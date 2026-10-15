import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import React from 'react';
import { useSimStore } from '../store/simStore';
import { SimBody } from '../types';

const TEXTURE_MAP: Record<string, string> = {
  Sun:     '/textures/sun.jfif',
  Mercury: '/textures/mercury.jpg',
  Venus:   '/textures/venus.jpg',
  Earth:   '/textures/earth.jpg',
  Moon:    '/textures/moon.jpg',
  Mars:    '/textures/mars.jpg',
  Jupiter: '/textures/jupiter.jpg',
  Saturn:  '/textures/saturn.jpg',
  Uranus:  '/textures/Uranus.jpg',
  Neptune: '/textures/neptune.jpg',
};

// Self-rotation speeds — Earth & Moon excluded (handled separately, look great already)
const SPIN_RATES: Record<string, number> = {
  Sun:     0.004,
  Mercury: 0.001,
  Venus:   0.0008,
  Mars:    0.003,
  Jupiter: 0.008,
  Saturn:  0.007,
  Uranus:  0.005,
  Neptune: 0.004,
  Pluto:   0.002,
  Earth:   0.003,
  Moon:    0.001,
};

class TextureErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? this.props.fallback : this.props.children; }
}

function SaturnRings({ radius }: { radius: number }) {
  return (
    <mesh rotation={[Math.PI / 2 - 0.47, 0, 0]}>
      <ringGeometry args={[radius * 1.3, radius * 2.4, 64]} />
      <meshBasicMaterial color="#c8b89a" side={THREE.DoubleSide} transparent opacity={0.85} />
    </mesh>
  );
}

function TexturedSphere({ name, radius, segments }: {
  name: string; radius: number; segments: number;
}) {
  const texture = useLoader(THREE.TextureLoader, TEXTURE_MAP[name]);
  return (
    <mesh>
      <sphereGeometry args={[Math.max(radius, 0.3), segments, segments]} />
      {/* MeshBasicMaterial ignores all lighting — full texture visible on every side */}
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function PlainSphere({ radius, colour, segments }: {
  radius: number; colour: string; segments: number;
}) {
  return (
    <mesh>
      <sphereGeometry args={[Math.max(radius, 0.3), segments, segments]} />
      <meshBasicMaterial color={colour} />
    </mesh>
  );
}

function Body({ body, onSelect, reducedDetail }: {
  body: SimBody; onSelect: () => void; reducedDetail: boolean;
}) {
  const posRef  = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const spinRate = SPIN_RATES[body.name] ?? 0;
  const hasTexture = !!TEXTURE_MAP[body.name];
  const segments = reducedDetail ? 8 : 32;

  useFrame(() => {
    if (posRef.current)  posRef.current.position.set(body.x, body.y, body.z);
    if (spinRef.current && spinRate > 0) spinRef.current.rotation.y += spinRate;
  });

  const plain = <PlainSphere radius={body.radius} colour={body.colour} segments={segments} />;

  return (
    <>
      {/* Position group — sphere + label only, NO trail here */}
      <group ref={posRef}>
        <group ref={spinRef} onClick={onSelect}>
          {hasTexture ? (
            <TextureErrorBoundary fallback={plain}>
              <Suspense fallback={plain}>
                <TexturedSphere name={body.name} radius={body.radius} segments={segments} />
              </Suspense>
            </TextureErrorBoundary>
          ) : plain}
          {body.name === 'Saturn' && <SaturnRings radius={Math.max(body.radius, 0.3)} />}
        </group>
        <Text position={[0, body.radius + 1.5, 0]} fontSize={1.2} color="white" anchorX="center" anchorY="bottom">
          {body.name}
        </Text>
      </group>
      {/* Trail rendered in WORLD SPACE — outside posRef so no double-offset */}
      {!reducedDetail && body.trail.length > 1 && (
        <Line points={body.trail} color={body.colour} lineWidth={1} opacity={0.6} transparent />
      )}
    </>
  );
}

function CameraRig({ distance }: { distance: number }) {
  const { camera } = useThree();
  const initialised = useRef(false);
  useEffect(() => {
    if (!initialised.current) {
      camera.position.set(0, distance * 0.4, distance);
      camera.lookAt(0, 0, 0);
      initialised.current = true;
    }
  }, [distance]);
  return null;
}

export function SimulatorCanvas({ onSelectBody }: { onSelectBody: (id: string) => void }) {
  const { state, selectedBodyId, reducedDetail, cameraDistance } = useSimStore();

  return (
    <Canvas camera={{ position: [0, 20, 60], fov: 60 }}
      style={{ background: '#050510', width: '100%', height: '100%' }}>
      <OrbitControls makeDefault enableDamping />
      <CameraRig distance={cameraDistance} />
      {/* Tilt the entire scene ~25deg so the orbital plane looks 3D */}
      <group rotation={[0.44, 0, 0]}>
        {state?.bodies.map(b => (
          <Body key={b.id} body={b}
            onSelect={() => onSelectBody(b.id)}
            reducedDetail={reducedDetail} />
        ))}
      </group>
    </Canvas>
  );
}
