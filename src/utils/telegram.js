// Проверяем, запущено ли приложение в Telegram
export const isTelegramWebApp = () => {
  return window.Telegram && window.Telegram.WebApp;
};

// Получаем данные инициализации
export const getInitData = () => {
  if (isTelegramWebApp()) {
    return window.Telegram.WebApp.initData;
  }
  return null;
};

// Получаем ID пользователя
export const getUserId = () => {
  if (isTelegramWebApp()) {
    return window.Telegram.WebApp.initDataUnsafe?.user?.id;
  }
  return null;
};

// Инициализация Telegram WebApp
export const initTelegramWebApp = () => {
  if (isTelegramWebApp()) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
}; 