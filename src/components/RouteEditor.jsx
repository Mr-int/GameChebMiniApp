import React, { useState } from 'react';
import styled from 'styled-components';
import MapEditor from './MapEditor';
import { updateRoute } from '../api';

const EditorOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const EditorModal = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
`;

const EditorTitle = styled.h2`
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

const QuestSelector = styled.div`
  margin-bottom: 20px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const RouteInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const RouteTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
`;

const RouteDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 15px 0;
  line-height: 1.5;
`;

const PointsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const PointItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PointInfo = styled.div`
  flex: 1;
`;

const PointName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const PointCoords = styled.div`
  font-size: 12px;
  color: #666;
`;

const PointOrder = styled.div`
  background: #667eea;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.primary {
    background: #667eea;
    color: white;
    &:hover { background: #5a6fd8; }
  }

  &.secondary {
    background: #6c757d;
    color: white;
    &:hover { background: #5a6268; }
  }

  &.danger {
    background: #dc3545;
    color: white;
    &:hover { background: #c82333; }
  }

  &:disabled {
    background: #6c757d;
    color: #adb5bd;
    cursor: not-allowed;
    &:hover {
      background: #6c757d;
    }
  }
`;

const RouteEditor = ({ quests, onClose, onLogout }) => {
  const [selectedQuestId, setSelectedQuestId] = useState('');
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [editingPoints, setEditingPoints] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleQuestSelect = (questId) => {
    setSelectedQuestId(questId);
    const quest = quests.find(q => q.id === questId);
    setSelectedQuest(quest);
    setEditingPoints(quest?.points || []);
    setHasChanges(false);
  };

  const handleSaveChanges = async () => {
    if (!selectedQuest || !hasChanges) {
      alert('Нет изменений для сохранения!');
      return;
    }

    try {
      setSaving(true);
      
      // Подготавливаем данные для отправки
      const updatedData = {
        ...selectedQuest,
        points: editingPoints
      };

      console.log('Сохраняем изменения для маршрута:', selectedQuest.id);
      console.log('Обновленные данные:', updatedData);

      await updateRoute(selectedQuest.id, updatedData);
      
      alert('✅ Маршрут успешно обновлен!');
      setHasChanges(false);
      
      // Обновляем выбранный квест
      setSelectedQuest(updatedData);
      
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert(`❌ Ошибка сохранения: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePointsChange = (newPoints) => {
    setEditingPoints(newPoints);
    setHasChanges(true);
  };

  const handleEditPoint = (point) => {
    // TODO: Реализовать редактирование точки
    alert(`Редактирование точки "${point.point.name}" будет добавлено в следующем этапе!`);
  };

  return (
    <EditorOverlay onClick={onClose}>
      <EditorModal onClick={(e) => e.stopPropagation()}>
        <EditorHeader>
          <EditorTitle>Редактор маршрутов</EditorTitle>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={onLogout}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              🚪 Выйти
            </button>
            <CloseButton onClick={onClose}>×</CloseButton>
          </div>
        </EditorHeader>

        <QuestSelector>
          <Select 
            value={selectedQuestId} 
            onChange={(e) => handleQuestSelect(e.target.value)}
          >
            <option value="">Выберите квест для редактирования</option>
            {quests.map(quest => (
              <option key={quest.id} value={quest.id}>
                {quest.name}
              </option>
            ))}
          </Select>
        </QuestSelector>

        {selectedQuest && (
          <>
            <RouteInfo>
              <RouteTitle>{selectedQuest.name}</RouteTitle>
              <RouteDescription>{selectedQuest.description}</RouteDescription>
              <div>Количество точек: {selectedQuest.points?.length || 0}</div>
            </RouteInfo>

            <MapEditor 
              points={editingPoints}
              onPointsChange={handlePointsChange}
              questName={selectedQuest.name}
            />

            <div style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>📋 Список точек маршрута:</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {editingPoints.map((pointData, index) => (
                  <div key={pointData.point.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                    borderBottom: index < editingPoints.length - 1 ? '1px solid #e0e0e0' : 'none',
                    backgroundColor: index === 0 ? '#d4edda' : index === editingPoints.length - 1 ? '#f8d7da' : '#fff'
                  }}>
                    <div style={{
                      background: index === 0 ? '#28a745' : index === editingPoints.length - 1 ? '#dc3545' : '#667eea',
                      color: 'white',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginRight: '12px'
                    }}>
                      {pointData.order}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                        {pointData.point.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {pointData.point.latitude.toFixed(6)}, {pointData.point.longitude.toFixed(6)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ActionButtons>
              <Button 
                className="primary" 
                onClick={handleSaveChanges}
                disabled={!hasChanges || saving}
              >
                {saving ? '💾 Сохранение...' : '💾 Сохранить изменения'}
              </Button>
              <Button className="secondary" onClick={onClose}>
                ❌ Отмена
              </Button>
              <Button 
                className="danger" 
                onClick={onLogout}
              >
                🚪 Выйти из редактора
              </Button>
            </ActionButtons>
          </>
        )}
      </EditorModal>
    </EditorOverlay>
  );
};

export default RouteEditor; 