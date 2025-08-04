// Конфигурация API для разных окружений

// Определяем окружение
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Настройки API
export const API_CONFIG = {
  // Токен для доступа к API
  TOKEN: '00d197fe99bd7b7eb8b46d385d9713fe7a6a2d60593aa5634d116f7501eee4dc',
  
  // URL бэкенда для разных окружений
  BASE_URL: (() => {
    // Приоритет: переменная окружения > настройка по умолчанию
    if (process.env.REACT_APP_API_BASE_URL) {
      return process.env.REACT_APP_API_BASE_URL;
    }
    
    // Настройки по умолчанию
    if (isDevelopment) {
      return 'http://localhost:8000'; // Локальный бэкенд
    }
    
    if (isProduction) {
      return 'https://gamecheb-backend.onrender.com'; // Продакшн бэкенд
    }
    
    // Fallback
    return 'https://gamecheb-backend.onrender.com';
  })(),
  
  // Timeout для запросов
  TIMEOUT: 10000,
  
  // Endpoints
  ENDPOINTS: {
    QUESTS: '/api/routes/',
    QUEST_BY_ID: (id) => `/api/routes/${id}/`,
  }
};

// Логирование конфигурации
console.log('API Config:', {
  BASE_URL: API_CONFIG.BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  IS_DEV: isDevelopment,
  IS_PROD: isProduction
}); 