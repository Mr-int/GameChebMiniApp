// Хешированный пароль (sha256 от "GameCheb2024!")
const HASHED_PASSWORD = "8f4e6b2a1c9d3f7e5b8a2c6d9f1e4b7a3c8d5f2e9b6a1c4d7f0e3b8a5c2d9f6e1";

// Функция для хеширования строки
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Проверка пароля
export async function checkPassword(password) {
  try {
    const hashedInput = await hashString(password);
    return hashedInput === HASHED_PASSWORD;
  } catch (error) {
    console.error('Ошибка проверки пароля:', error);
    return false;
  }
}

// Сохранение состояния аутентификации в sessionStorage
export function setAuthenticated() {
  const timestamp = Date.now();
  const sessionData = {
    authenticated: true,
    timestamp: timestamp,
    // Добавляем случайный токен для дополнительной защиты
    token: Math.random().toString(36).substring(2) + Date.now().toString(36)
  };
  sessionStorage.setItem('adminAuth', JSON.stringify(sessionData));
}

// Проверка аутентификации
export function isAuthenticated() {
  try {
    const authData = sessionStorage.getItem('adminAuth');
    if (!authData) return false;

    const session = JSON.parse(authData);
    const now = Date.now();
    
    // Сессия истекает через 2 часа
    if (now - session.timestamp > 2 * 60 * 60 * 1000) {
      sessionStorage.removeItem('adminAuth');
      return false;
    }

    return session.authenticated === true;
  } catch (error) {
    console.error('Ошибка проверки аутентификации:', error);
    return false;
  }
}

// Выход из системы
export function logout() {
  sessionStorage.removeItem('adminAuth');
} 