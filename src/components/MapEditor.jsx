import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  position: relative;
  background: #f8f9fa;
  overflow: hidden;
  margin-bottom: 20px;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: crosshair;
`;

const MapControls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  padding: 8px 16px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 6px;
  font-size: 12px;
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
`;

const MapInfo = styled.div`
  background: #e9ecef;
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #495057;
  margin-bottom: 15px;
`;

const MapEditor = ({ points = [], onPointsChange, questName }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPoint, setDraggedPoint] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState('view'); // view, edit, delete

  // Конвертируем координаты в пиксели
  const latLngToPixel = (lat, lng) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    // Простая проекция (можно улучшить)
    const x = ((lng + 180) / 360) * canvas.width;
    const y = ((90 - lat) / 180) * canvas.height;
    
    return {
      x: x * scale + offset.x,
      y: y * scale + offset.y
    };
  };

  // Конвертируем пиксели в координаты
  const pixelToLatLng = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return { lat: 0, lng: 0 };

    const adjustedX = (x - offset.x) / scale;
    const adjustedY = (y - offset.y) / scale;
    
    const lng = (adjustedX / canvas.width) * 360 - 180;
    const lat = 90 - (adjustedY / canvas.height) * 180;
    
    return { lat, lng };
  };

  // Находим точку под курсором
  const findPointAtPosition = (x, y) => {
    return points.find((pointData, index) => {
      const pixel = latLngToPixel(pointData.point.latitude, pointData.point.longitude);
      const distance = Math.sqrt((pixel.x - x) ** 2 + (pixel.y - y) ** 2);
      return distance < 15; // Радиус клика
    });
  };

  // Рисуем карту
  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем сетку
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Рисуем маршрут
    if (points.length > 1) {
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      points.forEach((pointData, index) => {
        const pixel = latLngToPixel(pointData.point.latitude, pointData.point.longitude);
        if (index === 0) {
          ctx.moveTo(pixel.x, pixel.y);
        } else {
          ctx.lineTo(pixel.x, pixel.y);
        }
      });
      
      ctx.stroke();
    }

    // Рисуем точки
    points.forEach((pointData, index) => {
      const pixel = latLngToPixel(pointData.point.latitude, pointData.point.longitude);
      
      // Круг точки
      ctx.fillStyle = mode === 'delete' ? '#dc3545' : '#667eea';
      ctx.beginPath();
      ctx.arc(pixel.x, pixel.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Обводка
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Номер точки
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pointData.order, pixel.x, pixel.y);
    });
  };

  // Обработчики событий
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (mode === 'edit') {
      const pointData = findPointAtPosition(x, y);
      if (pointData) {
        setIsDragging(true);
        setDraggedPoint(pointData);
      }
    } else if (mode === 'delete') {
      const pointData = findPointAtPosition(x, y);
      if (pointData) {
        const newPoints = points.filter(p => p.point.id !== pointData.point.id);
        // Обновляем порядок
        newPoints.forEach((p, index) => {
          p.order = index + 1;
        });
        onPointsChange(newPoints);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && draggedPoint && mode === 'edit') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newCoords = pixelToLatLng(x, y);
      
      // Обновляем координаты точки
      const newPoints = points.map(p => {
        if (p.point.id === draggedPoint.point.id) {
          return {
            ...p,
            point: {
              ...p.point,
              latitude: newCoords.lat,
              longitude: newCoords.lng
            }
          };
        }
        return p;
      });
      
      onPointsChange(newPoints);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedPoint(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  // Инициализация canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawMap();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Перерисовка при изменении точек или масштаба
  useEffect(() => {
    drawMap();
  }, [points, scale, offset, mode]);

  return (
    <div>
      <MapInfo>
        <strong>Редактор маршрута:</strong> {questName} | 
        Режим: {mode === 'view' ? 'Просмотр' : mode === 'edit' ? 'Редактирование' : 'Удаление'} | 
        Точок: {points.length}
      </MapInfo>
      
      <MapControls>
        <ControlButton 
          className={mode === 'view' ? 'active' : ''} 
          onClick={() => setMode('view')}
        >
          👁️ Просмотр
        </ControlButton>
        <ControlButton 
          className={mode === 'edit' ? 'active' : ''} 
          onClick={() => setMode('edit')}
        >
          ✏️ Редактировать
        </ControlButton>
        <ControlButton 
          className={mode === 'delete' ? 'active' : ''} 
          onClick={() => setMode('delete')}
        >
          🗑️ Удалить
        </ControlButton>
        <ControlButton onClick={() => setScale(1)}>
          🔍 Сброс масштаба
        </ControlButton>
      </MapControls>

      <MapContainer>
        <Canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />
      </MapContainer>
    </div>
  );
};

export default MapEditor; 