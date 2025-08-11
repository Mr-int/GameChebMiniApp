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
  max-height: 90vh;
  overflow-y: auto;
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
  
  /* Стили для скроллбара */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
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
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
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

const StartQuestModal = ({ onClose, onConfirm, questTitle }) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalTitle>Начать квест</ModalTitle>
        <ModalText>
          Вы уверены, что хотите начать квест "{questTitle}"?
          После начала квеста вам потребуется доступ к геолокации.
        </ModalText>
        <ButtonGroup>
          <Button className="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button className="primary" onClick={onConfirm}>
            Начать
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default StartQuestModal; 