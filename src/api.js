import axios from 'axios';

const API_TOKEN = '00d197fe99bd7b7eb8b46d385d9713fe7a6a2d60593aa5634d116f7501eee4dc';

export const api = axios.create({
  baseURL: 'https://gamechebservice-1.onrender.com',
  headers: {
    'Authorization': `Token ${API_TOKEN}`,
    'Content-Type': 'application/json',
  }
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