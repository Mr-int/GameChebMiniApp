import axios from 'axios';

const API_TOKEN = '00d197fe99bd7b7eb8b46d385d9713fe7a6a2d60593aa5634d116f7501eee4dc';

export const api = axios.create({
  baseURL: 'http://51.250.47.130:8000',
  timeout: 10000, // 10 секунд timeout
});

// Добавляем interceptor для логирования
api.interceptors.request.use(
  (config) => {
    console.log('Отправляем запрос:', config.method?.toUpperCase(), config.url);
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