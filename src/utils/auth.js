// Хеш пароля (admin123)
const ADMIN_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

// Генерируем хеш для проверки пароля
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Проверяем пароль
export async function verifyPassword(password) {
  try {
    const hash = await hashPassword(password);
    return hash === ADMIN_PASSWORD_HASH;
  } catch (error) {
    console.error('Ошибка проверки пароля:', error);
    return false;
  }
}

// Проверяем сессию
export function checkSession() {
  const session = sessionStorage.getItem('admin_session');
  if (!session) return false;
  
  try {
    const sessionData = JSON.parse(session);
    const now = Date.now();
    
    // Сессия действительна 1 час
    if (now - sessionData.timestamp > 3600000) {
      sessionStorage.removeItem('admin_session');
      return false;
    }
    
    return true;
  } catch (error) {
    sessionStorage.removeItem('admin_session');
    return false;
  }
}

// Создаем сессию
export function createSession() {
  const sessionData = {
    timestamp: Date.now(),
    token: Math.random().toString(36).substring(2)
  };
  sessionStorage.setItem('admin_session', JSON.stringify(sessionData));
}

// Удаляем сессию
export function clearSession() {
  sessionStorage.removeItem('admin_session');
} 