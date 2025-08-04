import React, { useState } from 'react';
import styled from 'styled-components';
import { checkPassword, setAuthenticated } from '../utils/auth';

const Modal = styled.div`
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

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 30px 0;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Input = styled.input`
  padding: 15px;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  text-align: center;
  letter-spacing: 2px;

  &:focus {
    outline: none;
    border-color: #4CAF50;
  }

  &::placeholder {
    letter-spacing: normal;
  }
`;

const LoginButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #45a049;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: 10px;
  padding: 10px;
  background: #ffebee;
  border-radius: 6px;
  border: 1px solid #ffcdd2;
`;

const LockIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  color: #4CAF50;
`;

const LoginModal = ({ onSuccess, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isValid = await checkPassword(password);
      
      if (isValid) {
        setAuthenticated();
        onSuccess();
      } else {
        setError('Неверный пароль. Попробуйте еще раз.');
        setPassword('');
      }
    } catch (error) {
      setError('Произошла ошибка при проверке пароля.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <LockIcon>🔒</LockIcon>
        <Title>Доступ к панели управления</Title>
        <Subtitle>
          Введите пароль администратора для доступа к панели управления квестами
        </Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
            required
          />
          
          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Проверка...' : 'Войти'}
          </LoginButton>
        </Form>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </ModalContent>
    </Modal>
  );
};

export default LoginModal; 