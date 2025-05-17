import styled from 'styled-components';

interface MessageBoxProps {
  type: 'error' | 'success';
  message: string;
  onDismiss: () => void;
}

const MessageContainer = styled.div<{ type: 'error' | 'success' }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  background: ${props => props.type === 'error' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(34, 197, 94, 0.1)'};
  border: 1px solid ${props => props.type === 'error' ? 'var(--remove-button)' : '#22c55e'};
  color: ${props => props.type === 'error' ? 'var(--remove-button)' : '#22c55e'};
`;

const Message = styled.p`
  margin: 0;
  font-size: 0.875rem;
`;

const DismissButton = styled.button`
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

export const MessageBox: React.FC<MessageBoxProps> = ({ type, message, onDismiss }) => {
  return (
    <MessageContainer type={type}>
      <Message>{message}</Message>
      <DismissButton onClick={onDismiss}>✕</DismissButton>
    </MessageContainer>
  );
};
