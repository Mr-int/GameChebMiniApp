import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getQuests, updateQuest } from '../api';
import MapEditor from '../components/MapEditor';
import LoginModal from '../components/LoginModal';
import { isAuthenticated, logout } from '../utils/auth';

const AdminContainer = styled.div`
  background-color: white;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #E0E0E0;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 10px 0 0 0;
`;

const BackButton = styled.button`
  background: #666;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #555;
  }
`;

const LogoutButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #d32f2f;
  }
`;

const QuestsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const QuestCard = styled.div`
  background: white;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    border-color: #4CAF50;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.1);
  }
`;

const QuestTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
`;

const QuestDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 15px 0;
  line-height: 1.5;
`;

const QuestActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.edit {
    background: #2196F3;
    color: white;
    &:hover { background: #1976D2; }
  }

  &.view {
    background: #FF9800;
    color: white;
    &:hover { background: #F57C00; }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 20px 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 2px solid #E0E0E0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const SaveButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 10px;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  font-size: 18px;
  color: #666;
  margin: 50px 0;
`;

const AdminPanel = () => {
  const navigate = useNavigate();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    coordinates: ''
  });

  const handleBackClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setAuthenticated(true);
    setShowLogin(false);
  };

  const handleLoginClose = () => {
    if (!authenticated) {
      navigate('/');
    }
  };

  useEffect(() => {
    // Проверяем аутентификацию при загрузке
    if (isAuthenticated()) {
      setAuthenticated(true);
      fetchQuests();
    } else {
      setShowLogin(true);
    }
  }, []);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const data = await getQuests();
      setQuests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки квестов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuest = (quest) => {
    setEditingQuest(quest);
    setFormData({
      coordinates: quest.coordinates || ''
    });
    setShowModal(true);
  };

  const handleSaveQuest = async (e) => {
    e.preventDefault();
    try {
      if (editingQuest) {
        await updateQuest(editingQuest.id, formData);
        setShowModal(false);
        await fetchQuests();
      }
    } catch (error) {
      console.error('Ошибка сохранения маршрута:', error);
      alert('Ошибка при сохранении маршрута');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <AdminContainer>
        <LoadingText>Загрузка квестов...</LoadingText>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Header>
        <Title>Редактирование маршрутов квестов</Title>
        <Subtitle>Выберите квест для редактирования его маршрута</Subtitle>
        <div style={{ display: 'flex', gap: '10px' }}>
          <BackButton onClick={handleBackClick}>← Назад</BackButton>
          <LogoutButton onClick={handleLogout}>🚪 Выйти</LogoutButton>
        </div>
      </Header>

      <QuestsList>
        {quests.map((quest) => (
          <QuestCard key={quest.id}>
            <QuestTitle>{quest.name || quest.title}</QuestTitle>
            <QuestDescription>{quest.description}</QuestDescription>
            <QuestActions>
              <ActionButton 
                className="view" 
                onClick={() => window.open(`/quest/${quest.id}`, '_blank')}
              >
                Просмотр квеста
              </ActionButton>
              <ActionButton 
                className="edit" 
                onClick={() => handleEditQuest(quest)}
              >
                Редактировать маршрут
              </ActionButton>
            </QuestActions>
          </QuestCard>
        ))}
      </QuestsList>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                Редактирование маршрута: {editingQuest?.name || editingQuest?.title}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <Form onSubmit={handleSaveQuest}>
              <SectionTitle>Редактирование маршрута</SectionTitle>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Используйте редактор карты для изменения маршрута квеста. 
                Кликайте на карту для добавления точек, перетаскивайте существующие точки для изменения их положения.
              </p>
              
              <MapEditor 
                coordinates={formData.coordinates}
                onCoordinatesChange={(newCoordinates) => {
                  setFormData(prev => ({
                    ...prev,
                    coordinates: newCoordinates
                  }));
                }}
              />

              <SaveButton type="submit">
                Сохранить маршрут
              </SaveButton>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {showLogin && (
        <LoginModal
          onSuccess={handleLoginSuccess}
          onClose={handleLoginClose}
        />
      )}
    </AdminContainer>
  );
};

export default AdminPanel; 