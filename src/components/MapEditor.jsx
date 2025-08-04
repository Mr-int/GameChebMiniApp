import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: 500px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
`;

const MapFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const MapOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
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

const MapEditor = ({ points = [], onPointsChange, questName }) => {
  const [mode, setMode] = useState('view'); // view, add, edit, delete
  const [mapUrl, setMapUrl] = useState('');
  const [centerLat, setCenterLat] = useState(55.7558); // Москва по умолчанию
  const [centerLng, setCenterLng] = useState(37.6176);
  const [zoom, setZoom] = useState(13);

  // Генерируем URL для карты с маркерами
  useEffect(() => {
    if (points.length === 0) {
      // Если нет точек, показываем карту по умолчанию
      setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${centerLng-0.01},${centerLat-0.01},${centerLng+0.01},${centerLat+0.01}&layer=mapnik&marker=${centerLat},${centerLng}`);
      return;
    }

    // Находим границы для центрирования карты
    const lats = points.map(p => p.point.latitude);
    const lngs = points.map(p => p.point.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Добавляем отступы
    const latPadding = (maxLat - minLat) * 0.1;
    const lngPadding = (maxLng - minLng) * 0.1;

    const bbox = `${minLng - lngPadding},${minLat - latPadding},${maxLng + lngPadding},${maxLat + latPadding}`;
    
    // Создаем маркеры для всех точек
    const markers = points.map((pointData, index) => {
      const color = index === 0 ? 'green' : index === points.length - 1 ? 'red' : 'blue';
      return `&marker=${pointData.point.latitude},${pointData.point.longitude}`;
    }).join('');

    setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markers}`);
  }, [points, centerLat, centerLng]);

  // Добавляем промежуточную точку
  const addIntermediatePoint = () => {
    if (points.length < 2) {
      alert('Нужно минимум 2 точки для добавления промежуточной!');
      return;
    }

    // Находим середину между первой и последней точкой
    const firstPoint = points[0].point;
    const lastPoint = points[points.length - 1].point;
    
    const midLat = (firstPoint.latitude + lastPoint.latitude) / 2;
    const midLng = (firstPoint.longitude + lastPoint.longitude) / 2;

    const newPoint = {
      point: {
        id: `intermediate_${Date.now()}`,
        name: `Промежуточная точка ${points.length}`,
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
    if (points.length <= 2) {
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
    if (points.length <= 2) {
      alert('Нужно больше точек для оптимизации маршрута!');
      return;
    }

    // Простая оптимизация - сортируем по расстоянию от начальной точки
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const intermediatePoints = points.slice(1, -1);

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

  return (
    <div>
      <MapInfo>
        <strong>🗺️ Редактор маршрута:</strong> {questName} | 
        Режим: {mode === 'view' ? 'Просмотр' : mode === 'add' ? 'Добавление точек' : mode === 'edit' ? 'Редактирование' : 'Удаление'} | 
        Точок: {points.length}
      </MapInfo>

      <Instructions>
        <strong>💡 Как использовать:</strong><br/>
        • <strong>Зеленый маркер</strong> - начало маршрута<br/>
        • <strong>Синие маркеры</strong> - промежуточные точки<br/>
        • <strong>Красный маркер</strong> - конец маршрута<br/>
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
      </MapControls>

      <MapContainer>
        <MapFrame
          src={mapUrl}
          title="Карта маршрута"
        />
        <MapOverlay />
      </MapContainer>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>💡 Подсказка:</strong> Карта автоматически центрируется на вашем маршруте. 
        Используйте кнопки для добавления промежуточных точек и создания красивого маршрута.
      </div>
    </div>
  );
};

export default MapEditor; 