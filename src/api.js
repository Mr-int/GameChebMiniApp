import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://gamechebservice-1.onrender.com',
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