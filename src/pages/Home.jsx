import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import StartQuestModal from '../components/StartQuestModal';
import { initTelegramWebApp } from '../utils/telegram';
import { getQuests } from '../api';

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

const Home = () => {
  const navigate = useNavigate();
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initTelegramWebApp();
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const data = await getQuests();
      console.log('Ответ сервера:', data);
      setQuests(Array.isArray(data.results) ? data.results : []);
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
        // TODO: Реализовать отправку данных на бэкенд
        // const headers = {
        //   'Content-Type': 'application/json',
        // };
        // if (isTelegramWebApp()) {
        //   headers['Authorization'] = `Bearer ${getInitData()}`;
        // }
        // const response = await fetch(`https://api.gamecheb.ru/api/quests/${selectedQuest.id}/start`, {
        //   method: 'POST',
        //   headers,
        //   body: JSON.stringify({
        //     userId: getUserId(),
        //     startTime: new Date().toISOString(),
        //   }),
        // });
        // if (!response.ok) {
        //   throw new Error('Не удалось начать квест');
        // }
        
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
      <WelcomeText>Приветствуем вас</WelcomeText>
      <Divider />
      <GameChebText>GameCheb</GameChebText>
      <QuestsGrid>
        {Array.isArray(quests) && quests.map((quest) => (
          <QuestCard key={quest.id} onClick={() => handleQuestClick(quest)}>
            <QuestImage src={'/default-quest.jpg'} alt={quest.name} />
            <QuestContent>
              <QuestTitle>{quest.name}</QuestTitle>
              <QuestDescription>{quest.description}</QuestDescription>
            </QuestContent>
          </QuestCard>
        ))}
      </QuestsGrid>

      {selectedQuest && (
        <StartQuestModal
          questTitle={selectedQuest.title}
          onClose={handleCloseModal}
          onConfirm={handleStartQuest}
        />
      )}
    </HomeContainer>
  );
};

export default Home; 