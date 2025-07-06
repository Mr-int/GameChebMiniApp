# Инструкции по деплою на Render

## Основное решение (с react-scripts)

1. **Настройки в Render:**
   - Build Command: `npm ci --legacy-peer-deps && npm run build`
   - Publish Directory: `build`
   - Environment: Static Site
   - Node Version: 18.0.0

2. **Файлы конфигурации:**
   - `render.yaml` - основная конфигурация
   - `.nvmrc` - версия Node.js
   - `package.json` - обновлен с prebuild скриптом

## Альтернативное решение (с Vite)

Если проблемы с react-scripts продолжатся:

1. **Замените package.json:**
   ```bash
   cp package-vite.json package.json
   ```

2. **Установите зависимости Vite:**
   ```bash
   npm install
   ```

3. **Обновите настройки Render:**
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `build`

## Устранение неполадок

1. **Очистите кэш в Render**
2. **Пересоздайте деплой**
3. **Проверьте логи сборки**
4. **Убедитесь, что все зависимости установлены**

## Команды для локального тестирования

```bash
# Основное решение
npm ci --legacy-peer-deps
npm run build

# Альтернативное решение (Vite)
npm install
npm run build
``` 