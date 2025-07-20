import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
// Удаляю импорт Яндекс.Карт:
// import { YMaps, Map, Placemark, Polyline } from 'react-yandex-maps';
// Импортирую компоненты react-leaflet:
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { createGlobalStyle } from 'styled-components';
import CompletionModal from '../components/CompletionModal';
import { initTelegramWebApp } from '../utils/telegram';
import { getRouteById } from '../api';

const HideAttribution = createGlobalStyle`
  .leaflet-control-attribution {
    display: none !important;
  }
`;

const QuestContainer = styled.div`
  background-color: #F8F9FA;
  min-height: 100vh;
  padding: 16px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const MapWrapper = styled.div`
  height: 500px;
  margin: 16px 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const PointsList = styled.div`
  margin: 16px 0;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const PointCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const PointImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
`;

const PointInfo = styled.div`
  flex: 1;
`;

const PointTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const PointDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
`;

const PointStatus = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$visited ? '#4CAF50' : '#E0E0E0'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  margin-top: 8px;
`;

const CompleteButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  
  &:hover {
    background: #1976D2;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #BDBDBD;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &.primary {
    background: #2196F3;
    color: white;
  }
`;

const ConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ConfirmContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  position: relative;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ConfirmTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  text-align: center;
`;

const ConfirmText = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0 0 24px 0;
  text-align: center;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const ConfirmButton = styled.button`
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #2196F3;
    color: white;
    
    &:hover {
      background: #1976D2;
    }
  }
  
  &.secondary {
    background: #F5F5F5;
    color: #333;
    
    &:hover {
      background: #E0E0E0;
    }
  }
`;

const LocationRequestModal = styled(ConfirmModal)``;

const NotificationModal = styled(ConfirmModal)``;

const NotificationContent = styled(ConfirmContent)``;

const PointModalOverlay = styled(ConfirmModal)``;
const PointModalContent = styled(ConfirmContent)`max-width: 500px;`;

const LocateButton = styled.button`
  position: absolute;
  bottom: 32px;
  right: 32px;
  z-index: 1200;
  background: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  font-size: 24px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.22);
  }
`;

function LocateControl({ userLocation }) {
  const map = useMap();
  if (!userLocation) return null;
  return (
    <LocateButton title="К моему местоположению" onClick={() => map.flyTo(userLocation, 16)}>
      <span role="img" aria-label="locate">🧭</span>
    </LocateButton>
  );
}

// Функция для расчета расстояния между двумя точками в километрах
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Радиус Земли в километрах
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const Quest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [visitedPoints, setVisitedPoints] = useState(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showLocationRequest, setShowLocationRequest] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showPointModal, setShowPointModal] = useState(false);
  const audioRef = useRef(null);

  const fetchQuestData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRouteById(id);
      setQuest(data);
    } catch (err) {
      setError(err.message);
      setQuest(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const requestLocation = useCallback(() => {
    if (navigator.geolocation) {
      setShowLocationRequest(true);
    }
  }, []);

  useEffect(() => {
    initTelegramWebApp();
    fetchQuestData();
    requestLocation();
    setStartTime(new Date());
  }, [id, fetchQuestData, requestLocation]);

  const handleLocationAllow = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setShowLocationRequest(false);
      },
      (error) => {
        console.error('Ошибка получения геолокации:', error);
        setShowLocationRequest(false);
      }
    );
  };

  const handlePointVisit = async (pointId) => {
    if (!userLocation) return;

    try {
      // TODO: Реализовать отправку данных на бэкенд
      // const headers = {
      //   'Content-Type': 'application/json',
      // };
      // if (isTelegramWebApp()) {
      //   headers['Authorization'] = `Bearer ${getInitData()}`;
      // }
      // const response = await fetch(`https://api.gamecheb.ru/api/quests/${id}/points/${pointId}/visit`, {
      //   method: 'POST',
      //   headers,
      //   body: JSON.stringify({
      //     userId: getUserId(),
      //     timestamp: new Date().toISOString(),
      //     coordinates: {
      //       lat: userLocation[0],
      //       lng: userLocation[1],
      //     },
      //   }),
      // });
      // if (!response.ok) {
      //   throw new Error('Не удалось отметить посещение точки');
      // }

      // Временно просто отмечаем точку как посещенную
      setVisitedPoints(prev => new Set([...prev, pointId]));
    } catch (err) {
      console.error('Ошибка при отметке точки:', err);
      setVisitedPoints(prev => new Set([...prev, pointId]));
    }
  };

  const showError = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
  };

  const handlePointClick = (point) => {
    setSelectedPoint(point);
    setShowPointModal(true);
  };

  const handleCompleteQuest = async () => {
    try {
      // Проверяем, что все точки посещены
      if (visitedPoints.size !== quest.points.length) {
        showError('Вы посетили не все точки квеста!');
        return;
      }

      // TODO: Реализовать отправку данных на бэкенд
      // const headers = {
      //   'Content-Type': 'application/json',
      // };
      // if (isTelegramWebApp()) {
      //   headers['Authorization'] = `Bearer ${getInitData()}`;
      // }
      // const response = await fetch(`https://api.gamecheb.ru/api/quests/${id}/complete`, {
      //   method: 'POST',
      //   headers,
      //   body: JSON.stringify({
      //     userId: getUserId(),
      //     endTime: new Date().toISOString(),
      //     distance: totalDistance,
      //     pointsVisited: visitedPoints.size,
      //   }),
      // });
      // if (!response.ok) {
      //   throw new Error('Не удалось завершить квест');
      // }
      // const data = await response.json();

      // Закрываем модальное окно подтверждения
      setShowCompleteConfirm(false);
      // Показываем модальное окно завершения
      setShowCompletionModal(true);
    } catch (err) {
      console.error('Ошибка при завершении квеста:', err);
      showError('Произошла ошибка при завершении квеста');
    }
  };

  const handleAudioPlay = (audioUrl) => {
    if (audioRef.current) {
      if (audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };
  const handleAudioPause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Добавляем очистку при размонтировании компонента
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const customMarkerIcon = new L.Icon({
    iconUrl: '/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  if (loading) {
    return (
      <QuestContainer>
        <CloseButton onClick={() => setShowExitConfirm(true)}>✕</CloseButton>
        <div>Загрузка квеста...</div>
      </QuestContainer>
    );
  }

  if (error) {
    return (
      <QuestContainer>
        <CloseButton onClick={() => setShowExitConfirm(true)}>✕</CloseButton>
        <div>Ошибка: {error}</div>
      </QuestContainer>
    );
  }

  return (
    <QuestContainer>
      <HideAttribution />
      <CloseButton onClick={() => setShowExitConfirm(true)}>✕</CloseButton>
      
      <MapWrapper>
        {quest.points && quest.points.length > 0 && (
          <MapContainer
            center={[quest.points[0].point.latitude, quest.points[0].point.longitude]}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            />
            {quest.points.map(({ point }, index) => (
              <Marker
                key={point.id}
                position={[point.latitude, point.longitude]}
                icon={customMarkerIcon}
                eventHandlers={{
                  click: () => handlePointClick(point)
                }}
              >
                <Popup>
                  <div style={{ maxWidth: 220 }}>
                    {point.photo && (
                      <img src={point.photo} alt={point.name} style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />
                    )}
                    <h3 style={{ margin: '0 0 5px 0', fontSize: 16 }}>{point.name}</h3>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>{point.description}</p>
                    {point.video_file && (
                      <video controls style={{ width: '100%', marginTop: 8 }} src={point.video_file} />
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            {quest.points.length > 1 && (
              <Polyline
                positions={quest.points.map(({ point }) => [point.latitude, point.longitude])}
                pathOptions={{ color: '#2196F3', weight: 3, opacity: 0.8 }}
              />
            )}
            {/* Marker для геолокации пользователя */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={new L.Icon({
                  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                  iconSize: [30, 48],
                  iconAnchor: [15, 48],
                  popupAnchor: [1, -34],
                  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                  shadowSize: [48, 48],
                  className: 'user-location-marker',
                })}
              >
                <Popup>Вы здесь</Popup>
              </Marker>
            )}
            {userLocation && <LocateControl userLocation={userLocation} />}
          </MapContainer>
        )}
      </MapWrapper>

      <PointsList>
        {quest.points.map(({ point }, index) => (
          <PointCard key={point.id} onClick={() => handlePointClick(point)}>
            <PointImage 
              src={point.photo ? point.photo : ''}
              alt={point.name}
            />
            <PointInfo>
              <PointTitle>{point.name}</PointTitle>
              {point.audio_file && (
                <button onClick={e => { e.stopPropagation(); handleAudioPlay(point.audio_file); }}>
                  ▶️ Аудио
                </button>
              )}
            </PointInfo>
            <PointStatus $visited={visitedPoints.has(point.id)}>
              {visitedPoints.has(point.id) ? '✓' : index + 1}
            </PointStatus>
          </PointCard>
        ))}
      </PointsList>

      <CompleteButton
        onClick={() => setShowCompleteConfirm(true)}
        disabled={visitedPoints.size !== quest.points.length}
        className="primary"
      >
        Завершить квест
      </CompleteButton>

      {showLocationRequest && (
        <LocationRequestModal>
          <ConfirmContent>
            <ConfirmTitle>Доступ к геолокации</ConfirmTitle>
            <ConfirmText>
              Для работы с квестом необходим доступ к вашей геолокации.
              Разрешить доступ?
            </ConfirmText>
            <ButtonGroup>
              <ConfirmButton onClick={() => setShowLocationRequest(false)}>
                Отмена
              </ConfirmButton>
              <ConfirmButton onClick={handleLocationAllow}>
                Разрешить
              </ConfirmButton>
            </ButtonGroup>
          </ConfirmContent>
        </LocationRequestModal>
      )}

      {showExitConfirm && (
        <ConfirmModal>
          <ConfirmContent>
            <ConfirmTitle>Выход из квеста</ConfirmTitle>
            <ConfirmText>
              Вы уверены, что хотите выйти из квеста?
              Весь прогресс будет потерян.
            </ConfirmText>
            <ButtonGroup>
              <ConfirmButton onClick={() => setShowExitConfirm(false)}>
                Отмена
              </ConfirmButton>
              <ConfirmButton onClick={() => navigate('/')}>
                Выйти
              </ConfirmButton>
            </ButtonGroup>
          </ConfirmContent>
        </ConfirmModal>
      )}

      {showCompleteConfirm && (
        <ConfirmModal>
          <ConfirmContent>
            <ConfirmTitle>Завершение квеста</ConfirmTitle>
            <ConfirmText>
              Вы уверены, что хотите завершить квест?
              Проверьте, что посетили все точки.
            </ConfirmText>
            <ButtonGroup>
              <ConfirmButton onClick={() => setShowCompleteConfirm(false)}>
                Отмена
              </ConfirmButton>
              <ConfirmButton onClick={handleCompleteQuest}>
                Завершить
              </ConfirmButton>
            </ButtonGroup>
          </ConfirmContent>
        </ConfirmModal>
      )}

      {showNotification && (
        <NotificationModal>
          <NotificationContent>
            <ConfirmTitle>Уведомление</ConfirmTitle>
            <ConfirmText>{notificationMessage}</ConfirmText>
            <ButtonGroup>
              <ConfirmButton 
                className="primary"
                onClick={() => setShowNotification(false)}
              >
                Понятно
              </ConfirmButton>
            </ButtonGroup>
          </NotificationContent>
        </NotificationModal>
      )}

      {showCompletionModal && (
        <CompletionModal
          onClose={() => navigate('/')}
          pointsVisited={visitedPoints.size}
          totalPoints={quest.points.length}
          time={startTime ? Math.floor((new Date() - startTime) / 1000 / 60) : 0}
        />
      )}

      {showPointModal && selectedPoint && (
        <PointModalOverlay>
          <PointModalContent>
            <ConfirmTitle>{selectedPoint.name}</ConfirmTitle>
            {selectedPoint.photo && (
              <img src={selectedPoint.photo} alt={selectedPoint.name} style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />
            )}
            {selectedPoint.description && (
              <PointDescription>{selectedPoint.description}</PointDescription>
            )}
            {selectedPoint.video_file && (
              <video controls style={{ width: '100%', marginTop: 8 }} src={selectedPoint.video_file} />
            )}
            <ButtonGroup>
              <ConfirmButton className="primary" onClick={() => setShowPointModal(false)}>
                Закрыть
              </ConfirmButton>
            </ButtonGroup>
          </PointModalContent>
        </PointModalOverlay>
      )}
    </QuestContainer>
  );
};

export default Quest; 