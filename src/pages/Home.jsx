import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import StartQuestModal from '../components/StartQuestModal';
import RouteEditor from '../components/RouteEditor';
import { initTelegramWebApp } from '../utils/telegram';
import { getQuests } from '../api';
import { verifyPassword, checkSession, createSession, clearSession } from '../utils/auth';

const HomeContainer = styled.div`
  background-color: white;
  min-height: 100vh;
  padding: 16px;
  font-family: 'Roboto', sans-serif;
`;

const WelcomeText = styled.h1`
  font-size: 20px;
  text-align: center;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: #E0E0E0;
  margin: 16px 0;
`;

const GameChebText = styled.h2`
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24px;
  color: #333;
`;

const QuestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 16px 0;
`;

const QuestCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const QuestImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
`;

const QuestContent = styled.div`
  padding: 16px;
`;

const QuestTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const QuestDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
`;

const EditButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  z-index: 1000;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRouteEditor, setShowRouteEditor] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);



  useEffect(() => {
    initTelegramWebApp();
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const data = await getQuests();
      console.log('Ответ сервера:', data);
      
      // Проверяем разные варианты структуры данных
      if (Array.isArray(data.results)) {
        console.log('Найдены results:', data.results);
        console.log('Первый квест:', data.results[0]);
        setQuests(data.results);
      } else if (Array.isArray(data)) {
        console.log('Данные - массив:', data);
        console.log('Первый квест:', data[0]);
        setQuests(data);
      } else {
        console.log('Неожиданная структура данных:', data);
        setQuests([]);
      }
    } catch (err) {
      setError(err.message);
      setQuests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestClick = (quest) => {
    setSelectedQuest(quest);
  };

  const handleStartQuest = async () => {
    if (selectedQuest) {
      try {
        navigate(`/quest/${selectedQuest.id}`);
      } catch (err) {
        console.error('Ошибка при начале квеста:', err);
        navigate(`/quest/${selectedQuest.id}`);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedQuest(null);
  };

  const handleOpenRouteEditor = async () => {
    // Проверяем сессию
    if (checkSession()) {
      setShowRouteEditor(true);
      return;
    }

    // Запрашиваем пароль
    const password = prompt('Введите пароль для редактирования маршрутов:');
    if (password === null) return; // Пользователь отменил

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        createSession();
        setShowRouteEditor(true);
      } else {
        alert('❌ Неверный пароль!');
      }
    } catch (error) {
      console.error('Ошибка проверки пароля:', error);
      alert('❌ Ошибка проверки пароля!');
    }
  };

  const handleCloseRouteEditor = () => {
    setShowRouteEditor(false);
    setEditingQuest(null);
    // Принудительно обновляем состояние кнопки
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleLogout = () => {
    clearSession();
    setShowRouteEditor(false);
    setEditingQuest(null);
    showNotification('✅ Вы вышли из режима редактирования', 'success');
    // Принудительно обновляем состояние кнопки
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Функция для показа уведомлений
  const showNotification = (message, type = 'info') => {
    // Создаем временное уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 3000;
      font-size: 14px;
      font-weight: 500;
      opacity: 1;
      transform: translateX(0);
      transition: all 0.3s ease;
      max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  if (loading) {
    return (
      <HomeContainer>
        <WelcomeText>Загрузка квестов...</WelcomeText>
      </HomeContainer>
    );
  }

  if (error) {
    return (
      <HomeContainer>
        <WelcomeText>Ошибка: {error}</WelcomeText>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <EditButton onClick={checkSession() ? handleLogout : handleOpenRouteEditor}>
        {checkSession() ? '🚪 Выйти из редактора' : '🗺️ Редактировать маршруты'}
      </EditButton>
      <WelcomeText>Приветствуем вас</WelcomeText>
      <Divider />
      <GameChebText>GameCheb</GameChebText>
      <QuestsGrid>
        {Array.isArray(quests) && quests.map((quest) => {
          // Получаем первое изображение из точек маршрута
          const firstPoint = quest.points && quest.points[0] && quest.points[0].point;
          const imageUrl = firstPoint?.photo || '/forest.jpg'; // fallback на статичное изображение
          
          return (
            <QuestCard key={quest.id} onClick={() => handleQuestClick(quest)}>
              <QuestImage 
                src={imageUrl}
                alt={quest.name} 
                onError={(e) => {
                  // Если изображение не загрузилось, используем fallback
                  e.target.src = '/forest.jpg';
                }}
              />
              <QuestContent>
                <QuestTitle>{quest.name}</QuestTitle>
                <QuestDescription>{quest.description}</QuestDescription>
              </QuestContent>
            </QuestCard>
          );
        })}
      </QuestsGrid>

      {selectedQuest && (
        <StartQuestModal
          questTitle={selectedQuest.title}
          onClose={handleCloseModal}
          onConfirm={handleStartQuest}
        />
      )}

      {showRouteEditor && (
        <RouteEditor
          quests={quests}
          onClose={handleCloseRouteEditor}
          onLogout={handleLogout}
        />
      )}
    </HomeContainer>
  );
};

export default Home; 