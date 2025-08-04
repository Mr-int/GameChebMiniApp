import axios from 'axios';

const API_TOKEN = '00d197fe99bd7b7eb8b46d385d9713fe7a6a2d60593aa5634d116f7501eee4dc';

export const api = axios.create({
  baseURL: 'https://gamecheb.tech', // HTTPS URL для API
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
    return response.data;
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
    const response = await api.get('/docs/routes', {
      params: {
        api_token: API_TOKEN,
        v: Date.now() // Добавляем версию для избежания кэширования
      }
    });
    console.log('Полный ответ API:', response);
    console.log('Тип ответа:', typeof response);
    console.log('Ключи ответа:', Object.keys(response));
    

    
    // Проверяем структуру ответа
    if (response && response.results) {
      console.log('Найдены results:', response.results);
      return response.results;
    } else if (Array.isArray(response)) {
      console.log('Ответ - массив:', response);
      return response;
    } else {
      console.log('Неожиданная структура ответа:', response);
      return [];
    }
  } catch (error) {
    console.error('Ошибка запроса к /api/routes/:', error);
    console.error('Детали ошибки:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.message.includes('Mixed Content')) {
      console.error('ОШИБКА: Mixed Content - бэкенд должен поддерживать HTTPS');
      throw new Error('Бэкенд должен поддерживать HTTPS для работы с HTTPS фронтендом');
    }
    
    throw error;
  }
}

export async function getRouteById(id) {
  try {
    const response = await api.get(`/docs/routes/${id}`, {
      params: {
        api_token: API_TOKEN
      }
    });
    return response;
  } catch (error) {
    console.error('Ошибка запроса к /docs/routes/' + id, error);
    throw error;
  }
}

export async function updateRoute(routeId, updatedData) {
  try {
    console.log('Отправляем обновление маршрута:', routeId, updatedData);
    
    const response = await api.put(`/docs/routes/${routeId}`, updatedData, {
      params: {
        api_token: API_TOKEN
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Маршрут успешно обновлен:', response);
    return response;
  } catch (error) {
    console.error('Ошибка обновления маршрута:', error);
    throw error;
  }
} 