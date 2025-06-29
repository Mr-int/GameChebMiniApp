import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
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

const ModalContent = styled.div`
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

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  text-align: center;
`;

const ModalText = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0 0 24px 0;
  text-align: center;
  line-height: 1.5;
`;

const StatsContainer = styled.div`
  background: #F8F9FA;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatIcon = styled.div`
  width: 32px;
  height: 32px;
  background: #E3F2FD;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #2196F3;
`;

const StatText = styled.span`
  font-size: 15px;
  color: #333;
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1976D2;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CompletionModal = ({ onClose, stats }) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalTitle>Поздравляем!</ModalTitle>
        <ModalText>Вы успешно прошли квест</ModalText>
        
        <StatsContainer>
          <StatItem>
            <StatIcon>🎯</StatIcon>
            <StatText>Пройдено точек: {stats.points}</StatText>
          </StatItem>
          <StatItem>
            <StatIcon>📏</StatIcon>
            <StatText>Пройдено расстояние: {stats.distance} км</StatText>
          </StatItem>
          <StatItem>
            <StatIcon>⏱️</StatIcon>
            <StatText>Время прохождения: {stats.time}</StatText>
          </StatItem>
        </StatsContainer>
        
        <CloseButton onClick={onClose}>
          Вернуться на главную
        </CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CompletionModal; 