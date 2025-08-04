import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  position: relative;
  background: #f5f5f5;
  margin-bottom: 20px;
`;

const MapCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: crosshair;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  padding: 8px 16px;
  border: 2px solid #E0E0E0;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #4CAF50;
    background: #f0f8f0;
  }

  &.active {
    background: #4CAF50;
    color: white;
    border-color: #4CAF50;
  }
`;

const PointList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  padding: 10px;
`;

const PointItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PointName = styled.span`
  font-size: 14px;
  color: #333;
`;

const PointCoords = styled.span`
  font-size: 12px;
  color: #666;
`;

const DeleteButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #d32f2f;
  }
`;

const MapEditor = ({ coordinates, onCoordinatesChange }) => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [mode, setMode] = useState('view'); // view, add, edit
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (coordinates) {
      try {
        const parsed = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
        setPoints(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Ошибка парсинга координат:', error);
        setPoints([]);
      }
    }
  }, [coordinates]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Устанавливаем размер canvas
    canvas.width = rect.width;
    canvas.height = rect.height;

    drawMap();
  }, [points, mode, selectedPoint]);

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Очищаем canvas
    ctx.clearRect(0, 0, width, height);

    // Рисуем сетку
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Рисуем точки
    points.forEach((point, index) => {
      const x = (point.lng + 180) * (width / 360);
      const y = (90 - point.lat) * (height / 180);

      // Рисуем точку
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = selectedPoint === index ? '#FF5722' : '#4CAF50';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Рисуем номер точки
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(index + 1, x, y + 4);

      // Рисуем название точки
      if (point.name) {
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(point.name, x + 12, y);
      }
    });

    // Рисуем линии между точками
    if (points.length > 1) {
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      points.forEach((point, index) => {
        const x = (point.lng + 180) * (width / 360);
        const y = (90 - point.lat) * (height / 180);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }
  };

  const handleCanvasClick = (e) => {
    if (mode !== 'add') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Конвертируем координаты canvas в географические координаты
    const lng = (x / rect.width) * 360 - 180;
    const lat = 90 - (y / rect.height) * 180;

    const pointName = prompt('Введите название точки:');
    if (pointName) {
      const newPoint = {
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
        name: pointName
      };

      const newPoints = [...points, newPoint];
      setPoints(newPoints);
      onCoordinatesChange(JSON.stringify(newPoints));
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (mode !== 'edit') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Проверяем, кликнули ли мы на точку
    const clickedPointIndex = points.findIndex(point => {
      const pointX = (point.lng + 180) * (rect.width / 360);
      const pointY = (90 - point.lat) * (rect.height / 180);
      const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);
      return distance <= 12;
    });

    if (clickedPointIndex !== -1) {
      setSelectedPoint(clickedPointIndex);
      setIsDragging(true);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || selectedPoint === null || mode !== 'edit') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lng = (x / rect.width) * 360 - 180;
    const lat = 90 - (y / rect.height) * 180;

    const newPoints = [...points];
    newPoints[selectedPoint] = {
      ...newPoints[selectedPoint],
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6))
    };

    setPoints(newPoints);
    onCoordinatesChange(JSON.stringify(newPoints));
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const deletePoint = (index) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
    onCoordinatesChange(JSON.stringify(newPoints));
    if (selectedPoint === index) {
      setSelectedPoint(null);
    }
  };

  const selectPoint = (index) => {
    setSelectedPoint(index);
    setMode('edit');
  };

  const clearAll = () => {
    if (window.confirm('Удалить все точки?')) {
      setPoints([]);
      onCoordinatesChange('[]');
      setSelectedPoint(null);
    }
  };

  return (
    <div>
      <Controls>
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
          className={mode === 'edit' ? 'active' : ''} 
          onClick={() => setMode('edit')}
        >
          ✏️ Редактировать
        </ControlButton>
        <ControlButton onClick={clearAll}>
          🗑️ Очистить все
        </ControlButton>
      </Controls>

      <MapContainer>
        <MapCanvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        />
      </MapContainer>

      <PointList>
        <h4>Точки маршрута ({points.length})</h4>
        {points.map((point, index) => (
          <PointItem key={index} onClick={() => selectPoint(index)}>
            <div>
              <PointName>{point.name || `Точка ${index + 1}`}</PointName>
              <br />
              <PointCoords>
                {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
              </PointCoords>
            </div>
            <DeleteButton onClick={(e) => {
              e.stopPropagation();
              deletePoint(index);
            }}>
              Удалить
            </DeleteButton>
          </PointItem>
        ))}
        {points.length === 0 && (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            Нет точек. Переключитесь в режим "Добавить точку" и кликните на карту.
          </p>
        )}
      </PointList>
    </div>
  );
};

export default MapEditor; 