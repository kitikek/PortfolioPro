const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendResetEmail = async (toEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const mailOptions = {
    from: `"PortfolioPro" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Восстановление пароля PortfolioPro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Восстановление пароля</h2>
        <p>Вы запросили сброс пароля для аккаунта PortfolioPro.</p>
        <p>Для установки нового пароля нажмите на кнопку ниже:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">Сбросить пароль</a>
        <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
        <p>Ссылка действительна в течение 1 часа.</p>
        <hr />
        <p style="font-size: 12px; color: #666;">© PortfolioPro. Все права защищены.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };