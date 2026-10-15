import { Router } from 'express';
import nodemailer from 'nodemailer';
import { pool } from '../db/pool';

const router = Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    return res.status(400).json({ error: 'Message must be at least 5 characters.' });
  }

  const safeName = (typeof name === 'string' && name.trim()) || 'Anonymous';
  const safeEmail = (typeof email === 'string' && email.trim()) || '';

  await pool.query(
    `INSERT INTO suggestions (name, email, message) VALUES ($1, $2, $3)`,
    [safeName, safeEmail, message.trim()]
  );

  // Send email if SMTP is configured
  if (process.env.SMTP_HOST && process.env.SMTP_TO) {
    try {
      await transporter.sendMail({
        from: `"OrbiTaurus Feedback" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_TO,
        subject: `New suggestion from ${safeName}`,
        text: `Name: ${safeName}\nEmail: ${safeEmail || 'not provided'}\n\n${message.trim()}`,
        html: `<p><strong>Name:</strong> ${safeName}</p>
               <p><strong>Email:</strong> ${safeEmail || 'not provided'}</p>
               <hr/>
               <p>${message.trim().replace(/\n/g, '<br/>')}</p>`,
      });
    } catch (err) {
      // Don't fail the request if email fails — suggestion is already saved
      console.error('Email send failed:', err);
    }
  }

  res.status(201).json({ ok: true });
});

export default router;
