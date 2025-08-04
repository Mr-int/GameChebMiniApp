// Утилита для генерации хеша пароля
// Запустите: node generate-password-hash.js "ваш_пароль"

const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const password = process.argv[2];

if (!password) {
  console.log('Использование: node generate-password-hash.js "ваш_пароль"');
  console.log('Пример: node generate-password-hash.js "GameCheb2024!"');
  process.exit(1);
}

const hashedPassword = hashPassword(password);
console.log(`Пароль: ${password}`);
console.log(`Хеш: ${hashedPassword}`);
console.log('\nЗамените HASHED_PASSWORD в src/utils/auth.js на этот хеш'); 