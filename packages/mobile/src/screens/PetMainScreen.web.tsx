import React, { useState } from 'react';
import { Pet } from '../models/PetModel';
import './PetMainScreen.css';

interface PetMainScreenProps {
  pet: Pet;
  onFeed: () => void;
  onPlay: () => void;
  onTouch: () => void;
  onChat: (message: string) => Promise<string>;
  onShowHistory: () => void;
  onShowStatus: () => void;
  onLogout: () => void;
}

export const PetMainScreen: React.FC<PetMainScreenProps> = ({
  pet,
  onFeed,
  onPlay,
  onTouch,
  onChat,
  onShowHistory,
  onShowStatus,
  onLogout,
}) => {
  const [message, setMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const handleSendMessage = async () => {
    if (message.trim()) {
      await onChat(message);
      setMessage('');
    }
  };

  const maxExp = pet.level * 100;
  const expProgress = (pet.exp / maxExp) * 100;

  return (
    <div className="pet-main-container">
      {/* 渐变背景 */}
      <div className="gradient-background" />

      {/* 背景装饰 */}
      <div className="background-decorations">
        <div className="floating-star star-1">✨</div>
        <div className="floating-star star-2">🌟</div>
        <div className="floating-star star-3">💫</div>
        <div className="floating-star star-4">☁️</div>
      </div>

      {/* 主内容区 */}
      <div className="main-content">
        {/* 宠物显示区域 */}
        <div className="pet-display-area">
          <div className="pet-glow" />
          <div className="pet-container">
            {/* 这里将放置 Spine 动画 */}
            <div className="pet-placeholder">
              <span className="pet-emoji">🐲</span>
            </div>
          </div>
          <div className="pet-shadow" />
        </div>

        {/* 左侧状态栏 */}
        <div className="status-sidebar glass-surface">
          <div className="level-badge">
            <div className="level-label">LV</div>
            <div className="level-value">{pet.level}</div>
          </div>

          <div className="status-item">
            <div className="status-label">
              <span className="status-icon">✨</span>
              <span>经验</span>
            </div>
            <div className="status-bar">
              <div className="status-bar-fill" style={{ width: `${expProgress}%`, backgroundColor: '#FFD700' }} />
            </div>
          </div>

          <div className="status-item">
            <div className="status-label">
              <span className="status-icon">🍖</span>
              <span>饥饿</span>
            </div>
            <div className="status-bar">
              <div className="status-bar-fill" style={{ width: `${pet.hunger}%`, backgroundColor: '#FF9500' }} />
            </div>
          </div>

          <div className="status-item">
            <div className="status-label">
              <span className="status-icon">🎮</span>
              <span>快乐</span>
            </div>
            <div className="status-bar">
              <div className="status-bar-fill" style={{ width: `${pet.happiness}%`, backgroundColor: '#FF2D55' }} />
            </div>
          </div>

          <div className="status-item">
            <div className="status-label">
              <span className="status-icon">❤️</span>
              <span>健康</span>
            </div>
            <div className="status-bar">
              <div className="status-bar-fill" style={{ width: `${pet.health}%`, backgroundColor: '#34C759' }} />
            </div>
          </div>
        </div>

        {/* 顶部导航栏 */}
        <div className="top-navbar glass-surface">
          <button className="nav-button" onClick={onShowHistory}>
            <span className="nav-icon">💬</span>
          </button>
          <button className="nav-button" onClick={onShowStatus}>
            <span className="nav-icon">📊</span>
          </button>
          <button className="nav-button logout-button" onClick={onLogout}>
            <span className="nav-icon">🚪</span>
          </button>
        </div>

        {/* 右侧操作按钮 */}
        <div className="action-sidebar">
          <button className="action-button feed-button" onClick={onFeed}>
            <div className="action-icon-circle">
              <span className="action-icon">🍖</span>
            </div>
            <span className="action-label">喂食</span>
          </button>

          <button className="action-button play-button" onClick={onPlay}>
            <div className="action-icon-circle">
              <span className="action-icon">🎮</span>
            </div>
            <span className="action-label">玩耍</span>
          </button>

          <button className="action-button touch-button" onClick={onTouch}>
            <div className="action-icon-circle">
              <span className="action-icon">💕</span>
            </div>
            <span className="action-label">抚摸</span>
          </button>
        </div>
      </div>

      {/* 底部输入栏 */}
      <div className="chat-input-container glass-surface">
        <button className="mode-button" onClick={() => setIsVoiceMode(!isVoiceMode)}>
          <span className="mode-icon">{isVoiceMode ? '⌨️' : '🎤'}</span>
        </button>

        {isVoiceMode ? (
          <button className="voice-button">
            <span>按住 说话</span>
          </button>
        ) : (
          <div className="text-input-wrapper">
            <input
              type="text"
              className="text-input"
              placeholder="和宠物说点什么..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>
        )}

        {!isVoiceMode && message.trim() ? (
          <button className="send-button" onClick={handleSendMessage}>
            <span>发送</span>
          </button>
        ) : (
          <button className="plus-button">
            <span className="plus-icon">➕</span>
          </button>
        )}
      </div>
    </div>
  );
};
