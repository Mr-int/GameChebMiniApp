import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
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

// Компонент для обработки кликов по карте
const MapClickHandler = ({ onMapClick, mode }) => {
  useMapEvents({
    click: (e) => {
      if (mode === 'add') {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const MapEditor = ({ points = [], onPointsChange, questName }) => {
  const [mode, setMode] = useState('view'); // view, add, edit, delete
  const [mapCenter, setMapCenter] = useState([55.7558, 37.6176]); // Москва по умолчанию
  const [mapZoom, setMapZoom] = useState(13);

  console.log('MapEditor получил точки:', points);
  console.log('Количество точек:', points.length);
  console.log('Тип точек:', typeof points);

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
      alert(`✅ Добавлена точка: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
    }
  };

  // Добавляем промежуточную точку
  const addIntermediatePoint = () => {
    const validPoints = points.filter(p => p.point && typeof p.point.latitude === 'number' && typeof p.point.longitude === 'number');
    
    if (validPoints.length < 2) {
      alert('Нужно минимум 2 точки для добавления промежуточной!');
      return;
    }

    // Находим середину между первой и последней точкой
    const firstPoint = validPoints[0].point;
    const lastPoint = validPoints[validPoints.length - 1].point;
    
    const midLat = (firstPoint.latitude + lastPoint.latitude) / 2;
    const midLng = (firstPoint.longitude + lastPoint.longitude) / 2;

    const newPoint = {
      point: {
        id: `intermediate_${Date.now()}`,
        name: `Промежуточная точка ${points.length + 1}`,
        latitude: midLat,
        longitude: midLng,
        photo: null,
        description: 'Промежуточная точка маршрута'
      },
      order: points.length + 1
    };

    const newPoints = [...points, newPoint];
    onPointsChange(newPoints);
  };

  // Удаляем последнюю промежуточную точку
  const removeLastIntermediate = () => {
    const validPoints = points.filter(p => p.point && typeof p.point.latitude === 'number' && typeof p.point.longitude === 'number');
    
    if (validPoints.length <= 2) {
      alert('Нельзя удалить основные точки маршрута!');
      return;
    }

    const newPoints = points.slice(0, -1);
    // Обновляем порядок
    newPoints.forEach((p, index) => {
      p.order = index + 1;
    });
    onPointsChange(newPoints);
  };

  // Перемешиваем промежуточные точки для красивого маршрута
  const optimizeRoute = () => {
    const validPoints = points.filter(p => p.point && typeof p.point.latitude === 'number' && typeof p.point.longitude === 'number');
    
    if (validPoints.length <= 2) {
      alert('Нужно больше точек для оптимизации маршрута!');
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
    alert('✅ Маршрут оптимизирован!');
  };

  // Создаем кастомные иконки для маркеров
  const createCustomIcon = (color) => {
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
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const validPoints = points.filter(p => p.point && typeof p.point.latitude === 'number' && typeof p.point.longitude === 'number');

  return (
    <div>
      <MapInfo>
        <strong>🗺️ Редактор маршрута:</strong> {questName} | 
        Режим: {mode === 'view' ? 'Просмотр' : mode === 'add' ? 'Добавление точек' : mode === 'edit' ? 'Редактирование' : 'Удаление'} | 
        Точок: {points.length} (валидных: {points.filter(p => p.point && typeof p.point.latitude === 'number' && typeof p.point.longitude === 'number').length})
      </MapInfo>

      <Instructions>
        <strong>💡 Как использовать:</strong><br/>
        • <strong>Зеленый маркер</strong> - начало маршрута<br/>
        • <strong>Синие маркеры</strong> - промежуточные точки<br/>
        • <strong>Красный маркер</strong> - конец маршрута<br/>
        • Переключитесь в режим "Добавление точек" и кликайте по карте<br/>
        • Если точек нет, нажмите "🧪 Добавить тестовые точки"<br/>
        • Используйте кнопки ниже для управления маршрутом
      </Instructions>
      
      <MapControls>
        <ControlButton 
          className={mode === 'view' ? 'active' : ''} 
          onClick={() => setMode('view')}
        >
          👁️ Просмотр
        </ControlButton>
        <ControlButton 
          className={mode === 'add' ? 'active' : ''} 
          onClick={() => setMode('add')}
        >
          ➕ Добавить точку
        </ControlButton>
        <ControlButton 
          className="success"
          onClick={addIntermediatePoint}
        >
          🎯 Добавить промежуточную
        </ControlButton>
        <ControlButton 
          className="danger"
          onClick={removeLastIntermediate}
        >
          🗑️ Удалить последнюю
        </ControlButton>
        <ControlButton 
          onClick={optimizeRoute}
        >
          🔄 Оптимизировать маршрут
        </ControlButton>
        <ControlButton 
          className="success"
          onClick={() => {
            if (points.length === 0) {
              // Создаем тестовые точки для Москвы
              const testPoints = [
                {
                  point: {
                    id: 'start_1',
                    name: 'Начальная точка',
                    latitude: 55.7558,
                    longitude: 37.6176,
                    photo: null,
                    description: 'Начало маршрута'
                  },
                  order: 1
                },
                {
                  point: {
                    id: 'end_1',
                    name: 'Конечная точка',
                    latitude: 55.7287,
                    longitude: 37.6014,
                    photo: null,
                    description: 'Конец маршрута'
                  },
                  order: 2
                }
              ];
              onPointsChange(testPoints);
              alert('✅ Добавлены тестовые точки!');
            } else {
              alert('Точки уже есть в маршруте!');
            }
          }}
        >
          🧪 Добавить тестовые точки
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
          
          {/* Маркеры точек */}
          {validPoints.map((pointData, index) => {
            const color = index === 0 ? '#28a745' : index === validPoints.length - 1 ? '#dc3545' : '#667eea';
            const icon = createCustomIcon(color);
            
            return (
              <Marker
                key={pointData.point.id}
                position={[pointData.point.latitude, pointData.point.longitude]}
                icon={icon}
              >
                <Popup>
                  <div style={{ maxWidth: 220 }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: 16 }}>
                      {pointData.point.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                      {pointData.point.description}
                    </p>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
                      Порядок: {pointData.order}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      Координаты: {pointData.point.latitude.toFixed(6)}, {pointData.point.longitude.toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* Линия маршрута */}
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
    </div>
  );
};

export default MapEditor; 