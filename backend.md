# API Documentation for GameCheb Telegram Mini App

## Base URL
```
https://api.gamecheb.ru
```

## Authentication
Все запросы должны включать заголовок авторизации:
```
Authorization: Bearer {initData}
```
где `initData` - это данные инициализации от Telegram WebApp.

## Endpoints

### 1. Получение списка квестов
```
GET /api/quests
```

Response:
```json
{
  "quests": [
    {
      "id": 1,
      "title": "Исторический центр",
      "description": "Познакомьтесь с историей города через его главные достопримечательности",
      "image": "https://api.gamecheb.ru/images/quests/1.jpg",
      "duration": 120,
      "distance": 3.5,
      "pointsCount": 8,
      "difficulty": "easy"
    }
  ]
}
```

### 2. Получение информации о конкретном квесте
```
GET /api/quests/{id}
```

Response:
```json
{
  "id": 1,
  "title": "Исторический центр",
  "description": "Познакомьтесь с историей города через его главные достопримечательности",
  "points": [
    {
      "id": 1,
      "title": "Площадь Революции",
      "description": "Главная площадь города",
      "coordinates": {
        "lat": 55.7558,
        "lng": 37.6173
      },
      "audio": "https://api.gamecheb.ru/audio/points/1.mp3",
      "image": "https://api.gamecheb.ru/images/points/1.jpg"
    }
  ],
  "route": {
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [55.7558, 37.6173],
        [55.7287, 37.6014]
      ]
    }
  }
}
```

### 3. Начало квеста
```
POST /api/quests/{id}/start
```

Request:
```json
{
  "userId": "123456789",
  "startTime": "2024-03-20T12:00:00Z"
}
```

Response:
```json
{
  "success": true,
  "questId": 1,
  "startTime": "2024-03-20T12:00:00Z"
}
```

### 4. Отметка посещения точки
```
POST /api/quests/{id}/points/{pointId}/visit
```

Request:
```json
{
  "userId": "123456789",
  "timestamp": "2024-03-20T12:30:00Z",
  "coordinates": {
    "lat": 55.7558,
    "lng": 37.6173
  }
}
```

Response:
```json
{
  "success": true,
  "pointId": 1,
  "visitedAt": "2024-03-20T12:30:00Z"
}
```

### 5. Завершение квеста
```
POST /api/quests/{id}/complete
```

Request:
```json
{
  "userId": "123456789",
  "endTime": "2024-03-20T14:00:00Z",
  "distance": 3.5,
  "pointsVisited": 8
}
```

Response:
```json
{
  "success": true,
  "questId": 1,
  "completionTime": "2024-03-20T14:00:00Z",
  "totalDistance": 3.5,
  "pointsVisited": 8,
  "totalPoints": 8,
  "timeSpent": 120
}
```

## Требования к бэкенду

1. **Аутентификация**
   - Проверка подписи данных от Telegram
   - Валидация пользователя
   - Защита от подделки запросов

2. **База данных**
   - Таблица квестов (id, title, description, image, duration, distance, pointsCount, difficulty)
   - Таблица точек (id, questId, title, description, coordinates, audio, image)
   - Таблица маршрутов (id, questId, geometry)
   - Таблица прогресса пользователей (userId, questId, startTime, endTime, pointsVisited, totalDistance)

3. **Хранение медиафайлов**
   - Изображения квестов и точек
   - Аудиофайлы для точек
   - CDN для быстрой доставки контента

4. **Валидация геолокации**
   - Проверка расстояния до точки (не более 50 метров)
   - Защита от подделки координат
   - Кэширование последней известной локации

5. **Безопасность**
   - Rate limiting
   - Защита от SQL-инъекций
   - Валидация входных данных
   - HTTPS
   - CORS настройки

6. **Мониторинг**
   - Логирование ошибок
   - Метрики производительности
   - Алерты при проблемах

7. **Масштабируемость**
   - Кэширование частых запросов
   - Горизонтальное масштабирование
   - Балансировка нагрузки

## Обработка ошибок

Все ошибки должны возвращаться в формате:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Человекочитаемое сообщение об ошибке"
  }
}
```

Коды ошибок:
- `AUTH_REQUIRED` - требуется авторизация
- `INVALID_TOKEN` - неверный токен
- `QUEST_NOT_FOUND` - квест не найден
- `POINT_NOT_FOUND` - точка не найдена
- `TOO_FAR` - пользователь слишком далеко от точки
- `QUEST_ALREADY_STARTED` - квест уже начат
- `QUEST_NOT_STARTED` - квест не начат
- `QUEST_ALREADY_COMPLETED` - квест уже завершен
- `INVALID_COORDINATES` - неверные координаты
- `SERVER_ERROR` - внутренняя ошибка сервера 