const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Все поля обязательны' });
    }

    // Настройки транспорта (используем те же, что для восстановления пароля)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Получатель: если ADMIN_EMAIL не задан, используем EMAIL_USER (отправитель)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      throw new Error('Не указан получатель письма. Проверьте переменные EMAIL_USER или ADMIN_EMAIL в .env');
    }

    const mailOptions = {
      from: `"PortfolioPro" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `Новое сообщение от ${name} (${email})`,
      text: message,
      html: `<h3>Сообщение от ${name} (${email})</h3><p>${message.replace(/\n/g, '<br>')}</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Сообщение отправлено' });
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    res.status(500).json({ success: false, error: 'Ошибка отправки. Попробуйте позже.' });
  }
});

module.exports = router;