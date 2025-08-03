import axios from 'axios';

const API_TOKEN = '00d197fe99bd7b7eb8b46d385d9713fe7a6a2d60593aa5634d116f7501eee4dc';

export const api = axios.create({
  baseURL: 'http://gamecheb.tech',
  timeout: 10000, // 10 секунд timeout
  withCredentials: false,
});

// Добавляем interceptor для логирования
api.interceptors.request.use(
  (config) => {
    console.log('Отправляем запрос:', config.method?.toUpperCase(), config.url);
    // Добавляем заголовки для CORS
    config.headers = {
      ...config.headers,
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };
    return config;
  },
  (error) => {
    console.error('Ошибка запроса:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Получен ответ:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Ошибка ответа:', error.response?.status, error.message, error.config?.url);
    if (error.message.includes('Mixed Content')) {
      console.error('Ошибка Mixed Content: попробуйте использовать HTTP или настройте HTTPS на бэкенде');
    }
    return Promise.reject(error);
  }
);

export async function getQuests() {
  try {
    const response = await api.get('/api/routes/', {
      params: {
        api_token: API_TOKEN
      }
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка запроса к /api/routes/:', error);
    // Для тестирования возвращаем мок данные
    if (error.message.includes('Mixed Content') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      console.log('Возвращаем тестовые данные из-за ошибки подключения');
      return [
        {
          id: 1,
          name: "Тестовый квест",
          description: "Тестовое описание",
          points: [
            {
              point: {
                id: 1,
                name: "Тестовая точка",
                description: "Описание точки",
                latitude: 55.7558,
                longitude: 37.6176,
                photo: null,
                audio_file: null,
                video_file: null
              }
            }
          ]
        }
      ];
    }
    throw error;
  }
}

export async function getRouteById(id) {
  try {
    const response = await api.get(`/api/routes/${id}/`, {
      params: {
        api_token: API_TOKEN
      }
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка запроса к /api/routes/' + id + '/', error);
    throw error;
  }
} 