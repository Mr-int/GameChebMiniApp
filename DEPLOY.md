# Инструкции по развертыванию GameCheb Mini App

## 🚀 Быстрый старт

### 1. Подготовка к развертыванию

1. **Измените пароль администратора** (обязательно!):
   ```bash
   node generate-password-hash.js "ваш_новый_пароль"
   ```
   Затем замените `HASHED_PASSWORD` в `src/utils/auth.js`

2. **Настройте API** в `src/api.js`:
   - Укажите правильный `API_TOKEN`
   - Настройте `baseURL` для вашего бэкенда

3. **Соберите проект**:
   ```bash
   npm run build
   ```

### 2. Развертывание на Netlify (рекомендуется)

1. Создайте аккаунт на [netlify.com](https://netlify.com)
2. Подключите ваш Git репозиторий
3. Настройте параметры сборки:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Нажмите "Deploy site"

### 3. Развертывание на Vercel

1. Создайте аккаунт на [vercel.com](https://vercel.com)
2. Подключите ваш Git репозиторий
3. Vercel автоматически определит настройки для Vite
4. Нажмите "Deploy"

### 4. Развертывание на других платформах

#### GitHub Pages
1. Добавьте в `package.json`:
   ```json
   {
     "homepage": "https://ваш-username.github.io/ваш-репозиторий",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```
2. Установите gh-pages: `npm install --save-dev gh-pages`
3. Запустите: `npm run deploy`

#### Firebase Hosting
1. Установите Firebase CLI: `npm install -g firebase-tools`
2. Инициализируйте проект: `firebase init hosting`
3. Укажите `dist` как public directory
4. Разверните: `firebase deploy`

## 🔧 Настройка окружения

### Переменные окружения (опционально)

Создайте файл `.env` в корне проекта:

```env
VITE_API_TOKEN=ваш_токен_здесь
VITE_API_BASE_URL=https://ваш-api.com
```

Затем обновите `src/api.js`:

```javascript
const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'ваш_токен_по_умолчанию';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
```

## 🔒 Безопасность

### Обязательные меры безопасности

1. **Измените пароль администратора** перед развертыванием
2. **Используйте HTTPS** на продакшене
3. **Настройте CORS** на бэкенде
4. **Ограничьте доступ** к API токену

### Дополнительные меры

1. **Настройте CSP** (Content Security Policy):
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
   ```

2. **Добавьте rate limiting** на бэкенде

3. **Настройте мониторинг** ошибок (например, Sentry)

## 📱 Оптимизация

### Производительность

1. **Сжатие изображений** перед загрузкой
2. **Используйте CDN** для статических файлов
3. **Настройте кэширование** на сервере

### SEO

1. **Добавьте мета-теги** в `index.html`
2. **Настройте sitemap.xml**
3. **Добавьте robots.txt**

## 🐛 Отладка

### Частые проблемы

1. **CORS ошибки**: Настройте CORS на бэкенде
2. **404 ошибки**: Настройте redirects для SPA
3. **Проблемы с API**: Проверьте токен и URL

### Логи

- Проверьте консоль браузера
- Используйте Network tab в DevTools
- Проверьте логи сервера

## 📞 Поддержка

При возникновении проблем:

1. Проверьте консоль браузера
2. Убедитесь, что все зависимости установлены
3. Проверьте настройки API
4. Создайте issue в репозитории

## 🔄 Обновления

Для обновления приложения:

1. Внесите изменения в код
2. Протестируйте локально: `npm run dev`
3. Соберите проект: `npm run build`
4. Запушьте изменения в Git
5. Платформа автоматически развернет обновления 