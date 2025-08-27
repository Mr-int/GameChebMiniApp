import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Импортируем стили Leaflet
import 'leaflet/dist/leaflet.css';

// Фиксим проблему с иконками маркеров
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapContainerStyled = styled.div`
  width: 100%;
  height: 500px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
`;



const MapControls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const ControlButton = styled.button`
  padding: 10px 16px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #667eea;
    color: white;
  }

  &.active {
    background: #667eea;
    color: white;
  }

  &.danger {
    border-color: #dc3545;
    color: #dc3545;
    &:hover {
      background: #dc3545;
      color: white;
    }
  }

  &.success {
    border-color: #28a745;
    color: #28a745;
    &:hover {
      background: #28a745;
      color: white;
    }
  }
`;

const MapInfo = styled.div`
  background: #e9ecef;
  padding: 15px;
  border-radius: 8px;
  font-size: 14px;
  color: #495057;
  margin-bottom: 15px;
  line-height: 1.5;
`;

const Instructions = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #856404;
`;

// Компонент уведомлений
const Notification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => props.type === 'success' ? '#28a745' : props.type === 'error' ? '#dc3545' : '#17a2b8'};
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 3000;
  font-size: 14px;
  font-weight: 500;
  opacity: ${props => props.visible ? 1 : 0};
  transform: translateX(${props => props.visible ? '0' : '100%'});
  transition: all 0.3s ease;
  max-width: 300px;
`;

// Компонент для обработки кликов по карте
const MapClickHandler = ({ onMapClick, mode, isDragging }) => {
  useMapEvents({
    click: (e) => {
      if (mode === 'add' && !isDragging) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const MapEditor = ({ points = [], onPointsChange, questName }) => {
  const [mode, setMode] = useState('view'); // view, add, edit, delete, select
  const [mapCenter, setMapCenter] = useState([55.7558, 37.6176]); // Москва по умолчанию
  const [mapZoom, setMapZoom] = useState(13);
  const [notification, setNotification] = useState({ visible: false, message: '', type: 'info' });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState([]); // Для выбора точек для промежуточной

  console.log('MapEditor получил точки:', points);
  console.log('Количество точек:', points.length);
  console.log('Тип точек:', typeof points);

  // Функция для показа уведомлений
  const showNotification = (message, type = 'info') => {
    setNotification({ visible: true, message, type });
    setTimeout(() => {
      setNotification({ visible: false, message: '', type: 'info' });
    }, 3000);
  };

  // Обновляем центр карты при изменении точек
  useEffect(() => {
    console.log('useEffect MapEditor - точки:', points);
    console.log('Первая точка:', points[0]);
    
    const validPoints = points.filter(p => p.point && typeof p.point.latitude === 'number' && typeof p.point.longitude === 'number');
    
    if (validPoints.length > 0) {
      // Центрируем карту на первой точке
      setMapCenter([validPoints[0].point.latitude, validPoints[0].point.longitude]);
      setMapZoom(15);
    }
  }, [points]);

  // Обработчик клика по карте
  const handleMapClick = (latlng) => {
    if (mode === 'add') {
      const newPoint = {
        point: {
          id: `point_${Date.now()}`,
          name: `Точка ${points.length + 1}`,
          latitude: latlng.lat,
          longitude: latlng.lng,
          photo: null,
          description: 'Новая точка маршрута'
        },
        order: points.length + 1
      };

      const newPoints = [...points, newPoint];
      onPointsChange(newPoints);
      showNotification(`✅ Добавлена точка: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`, 'success');
    }
  };

  // Добавляем промежуточную точку между выбранными точками
  const addIntermediatePoint = () => {
    const validPoints = points.filter(p => p.point && typeof p.point.latitude === 'number' && typeof p.point.longitude === 'number');
    
    if (selectedPoints.length !== 2) {
      showNotification('❌ Выберите ровно 2 точки для добавления промежуточной между ними!', 'error');
      return;
    }

    // Находим выбранные точки
    const firstPointData = validPoints.find(p => p.point.id === selectedPoints[0]);
    const secondPointData = validPoints.find(p => p.point.id === selectedPoints[1]);
    
    if (!firstPointData || !secondPointData) {
      showNotification('❌ Выбранные точки не найдены!', 'error');
      return;
    }

    const firstPoint = firstPointData.point;
    const secondPoint = secondPointData.point;
    
    // Находим середину между выбранными точками
    const midLat = (firstPoint.latitude + secondPoint.latitude) / 2;
    const midLng = (firstPoint.longitude + secondPoint.longitude) / 2;

    // Определяем порядок для вставки между выбранными точками
    const firstOrder = Math.min(firstPointData.order, secondPointData.order);
    const secondOrder = Math.max(firstPointData.order, secondPointData.order);
    const newOrder = firstOrder + 1;

    // Создаем новую промежуточную точку
    const newPoint = {
      point: {
        id: `intermediate_${Date.now()}`,
        name: `Промежуточная точка ${newOrder}`,
        latitude: midLat,
        longitude: midLng,
        photo: null,
        description: 'Промежуточная точка маршрута',
        isIntermediate: true // Флаг для невидимых точек
      },
      order: newOrder
    };

    // Вставляем точку между выбранными и обновляем порядок остальных
    const newPoints = [...points];
    newPoints.splice(newOrder - 1, 0, newPoint);
    
    // Обновляем порядок точек после вставленной
    newPoints.forEach((p, index) => {
      if (p.order >= newOrder && p.point.id !== newPoint.point.id) {
        p.order = index + 1;
      }
    });

    onPointsChange(newPoints);
    setSelectedPoints([]); // Сбрасываем выбор
    setMode('view'); // Возвращаемся в режим просмотра
    showNotification('✅ Добавлена промежуточная точка между выбранными точками', 'success');
  };

  // Удаляем последнюю промежуточную точку
  const removeLastIntermediate = () => {
    const validPoints = points.filter(p => p.point && typeof p.point.latitude === 'number' && typeof p.point.longitude === 'number');
    
    if (validPoints.length <= 2) {
      showNotification('❌ Нельзя удалить основные точки маршрута!', 'error');
      return;
    }

    const newPoints = points.slice(0, -1);
    // Обновляем порядок
    newPoints.forEach((p, index) => {
      p.order = index + 1;
    });
    onPointsChange(newPoints);
    showNotification('✅ Удалена последняя точка', 'success');
  };

  // Перемешиваем промежуточные точки для красивого маршрута
  const optimizeRoute = () => {
    const validPoints = points.filter(p => p.point && typeof p.point.latitude === 'number' && typeof p.point.longitude === 'number');
    
    if (validPoints.length <= 2) {
      showNotification('❌ Нужно больше точек для оптимизации маршрута!', 'error');
      return;
    }

    // Простая оптимизация - сортируем по расстоянию от начальной точки
    const firstPoint = validPoints[0];
    const lastPoint = validPoints[validPoints.length - 1];
    const intermediatePoints = validPoints.slice(1, -1);

    // Сортируем промежуточные точки по расстоянию от начальной
    intermediatePoints.sort((a, b) => {
      const distA = Math.sqrt(
        Math.pow(a.point.latitude - firstPoint.point.latitude, 2) +
        Math.pow(a.point.longitude - firstPoint.point.longitude, 2)
      );
      const distB = Math.sqrt(
        Math.pow(b.point.latitude - firstPoint.point.latitude, 2) +
        Math.pow(b.point.longitude - firstPoint.point.longitude, 2)
      );
      return distA - distB;
    });

    const newPoints = [firstPoint, ...intermediatePoints, lastPoint];
    newPoints.forEach((p, index) => {
      p.order = index + 1;
    });

    onPointsChange(newPoints);
    showNotification('✅ Маршрут оптимизирован!', 'success');
  };

  // Создаем кастомные иконки для маркеров
  const createCustomIcon = (color, isDraggable = true) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        cursor: ${isDraggable ? 'grab' : 'default'};
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  // Обработчик перетаскивания маркера
  const handleMarkerDrag = (pointId, newLatLng) => {
    const newPoints = points.map(p => {
      if (p.point.id === pointId) {
        return {
          ...p,
          point: {
            ...p.point,
            latitude: newLatLng.lat,
            longitude: newLatLng.lng
          }
        };
      }
      return p;
    });
    onPointsChange(newPoints);
    showNotification('✅ Точка перемещена', 'success');
  };

  // Обработчик клика по маркеру для выбора точек
  const handleMarkerClick = (pointId) => {
    if (mode === 'select') {
      if (selectedPoints.includes(pointId)) {
        // Убираем точку из выбора
        setSelectedPoints(selectedPoints.filter(id => id !== pointId));
        showNotification('❌ Точка убрана из выбора', 'info');
      } else {
        // Добавляем точку в выбор
        if (selectedPoints.length < 2) {
          setSelectedPoints([...selectedPoints, pointId]);
          showNotification(`✅ Точка добавлена в выбор (${selectedPoints.length + 1}/2)`, 'success');
        } else {
          showNotification('❌ Можно выбрать только 2 точки!', 'error');
        }
      }
    }
  };

  const validPoints = points.filter(p => p.point && typeof p.point.latitude === 'number' && typeof p.point.longitude === 'number');

  return (
    <div>
      <MapInfo>
        <strong>🗺️ Редактор маршрута:</strong> {questName} | 
        Режим: {mode === 'view' ? 'Просмотр' : mode === 'add' ? 'Добавление точек' : mode === 'select' ? 'Выбор точек' : mode === 'edit' ? 'Редактирование' : 'Удаление'} | 
        Точок: {points.length} (валидных: {points.filter(p => p.point && typeof p.point.latitude === 'number' && typeof p.point.longitude === 'number').length}) | 
        Выбрано: {selectedPoints.length}/2
      </MapInfo>

      
      
      <MapControls>
        <ControlButton 
          className={mode === 'view' ? 'active' : ''} 
          onClick={() => {
            setMode('view');
            setSelectedPoints([]);
          }}
        >
          👁️ Просмотр
        </ControlButton>
        
        <ControlButton 
          className={mode === 'select' ? 'active' : ''} 
          onClick={() => {
            setMode('select');
            setSelectedPoints([]);
          }}
        >
          🎯 Выбрать точки
        </ControlButton>
        <ControlButton 
          className="success"
          onClick={addIntermediatePoint}
          disabled={selectedPoints.length !== 2}
        >
          🔗 Добавить промежуточную ({selectedPoints.length}/2)
        </ControlButton>
        <ControlButton 
          className="danger"
          onClick={removeLastIntermediate}
        >
          🗑️ Удалить последнюю
        </ControlButton>
        
        
      </MapControls>

      <MapContainerStyled>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          
          {/* Обработчик кликов по карте */}
          <MapClickHandler onMapClick={handleMapClick} mode={mode} />
          
          {/* Маркеры точек (включая промежуточные) */}
          {validPoints.map((pointData, index) => {
            const isSelected = selectedPoints.includes(pointData.point.id);
            const isIntermediate = pointData.point.isIntermediate;
            
            // Определяем цвет маркера
            let color = '#667eea'; // по умолчанию синий
            if (isSelected) {
              color = '#ffc107'; // желтый для выбранных
            } else if (index === 0) {
              color = '#28a745'; // зеленый для начала
            } else if (index === validPoints.length - 1) {
              color = '#dc3545'; // красный для конца
            } else if (isIntermediate) {
              color = '#6c757d'; // серый для промежуточных
            }
            
            const icon = createCustomIcon(color, true);
            
            return (
              <Marker
                key={pointData.point.id}
                position={[pointData.point.latitude, pointData.point.longitude]}
                icon={icon}
                draggable={true}
                eventHandlers={{
                  dragstart: () => setIsDragging(true),
                  dragend: (e) => {
                    setIsDragging(false);
                    handleMarkerDrag(pointData.point.id, e.target.getLatLng());
                  },
                  click: () => handleMarkerClick(pointData.point.id)
                }}
              >
              </Marker>
            );
          })}
          
          {/* Линия маршрута (включая промежуточные точки) */}
          {validPoints.length > 1 && (
            <Polyline
              positions={validPoints.map(({ point }) => [point.latitude, point.longitude])}
              pathOptions={{ color: '#2196F3', weight: 3, opacity: 0.8 }}
            />
          )}
        </MapContainer>
      </MapContainerStyled>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>💡 Подсказка:</strong> Переключитесь в режим "Добавление точек" и кликайте по карте для добавления новых точек маршрута.
      </div>

      {/* Компонент уведомлений */}
      <Notification 
        visible={notification.visible} 
        type={notification.type}
      >
        {notification.message}
      </Notification>
    </div>
  );
};

export default MapEditor; 