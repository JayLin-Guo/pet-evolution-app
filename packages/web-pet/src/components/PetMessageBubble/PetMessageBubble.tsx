import React, { useEffect, useState } from 'react';
import './PetMessageBubble.css';

interface PetMessageBubbleProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

/**
 * 宠物消息气泡组件
 * 显示在宠物头部右上角，用于显示操作反馈消息
 */
export const PetMessageBubble: React.FC<PetMessageBubbleProps> = ({
  message,
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 显示动画
    setTimeout(() => setIsVisible(true), 10);

    // 自动隐藏
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300); // 淡出动画时间
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!isVisible && !isExiting) return null;

  return (
    <div className={`pet-message-bubble ${isExiting ? 'exiting' : ''}`}>
      <div className="pet-message-content">
        <div className="pet-message-text">{message}</div>
        <div className="pet-message-tail" />
      </div>
    </div>
  );
};

