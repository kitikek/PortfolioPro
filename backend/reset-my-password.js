const bcrypt = require('bcryptjs');
const { User } = require('./src/models');
const sequelize = require('./src/config/database');

const email = 'katamelnik159@gmail.com';
const newPassword = '1234';  // напишите здесь свой новый пароль

async function reset() {
  await sequelize.authenticate();
  const hash = await bcrypt.hash(newPassword, 10);
  const [updated] = await User.update({ password_hash: hash }, { where: { email } });
  console.log(updated ? `✅ Пароль для ${email} обновлён на "${newPassword}"` : `❌ Пользователь не найден`);
  process.exit(0);
}
reset();