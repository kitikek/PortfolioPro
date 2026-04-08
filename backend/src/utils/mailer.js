const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async (toEmail, resetToken) => {
  // ВОТ ЗДЕСЬ ДОБАВЛЕН # ПОСЛЕ ПОРТА:
  const resetLink = `${process.env.FRONTEND_URL}/#/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"PortfolioPro" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Восстановление пароля PortfolioPro',
    html: `<h3>Восстановление пароля</h3><p>Перейдите по ссылке: <a href="${resetLink}">${resetLink}</a></p><p>Ссылка действительна 1 час.</p>`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };