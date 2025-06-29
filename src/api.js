import axios from 'axios';

export const api = axios.create({
  // baseURL не указываем, чтобы работал proxy
});

export async function getQuests() {
  try {
    const response = await api.get('/api/routes/');
    return response.data;
  } catch (error) {
    console.error('Ошибка запроса к /api/routes/:', error);
    throw error;
  }
}

export async function getRouteById(id) {
  try {
    const response = await api.get(`/api/routes/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Ошибка запроса к /api/routes/' + id + '/', error);
    throw error;
  }
} 