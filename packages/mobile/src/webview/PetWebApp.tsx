import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Pet } from '../models/PetModel';
import './PetWebApp.css';

// WebView 通信接口
interface WebViewMessage {
  type: 'UPDATE_PET' | 'CHAT_RESPONSE';
  data: any;
}

const PetWebApp: React.FC = () => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [message, setMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  // 接收来自 React Native 的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const msg: WebViewMessage = JSON.parse(event.data);
        
        if (msg.type === 'UPDATE_PET') {
          setPet(msg.data);
        }
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage as any);

    // 通知 RN 已准备好
    sendMessageToRN({ type: 'WEBVIEW_READY' });

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage as any);
    };
  }, []);

  // 发送消息到 React Native
  const sendMessageToRN = (data: any) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageToRN({
        type: 'CHAT',
        data: message,
      });
      setMessage('');
    }
  };

  const handleAction = (action: 'FEED' | 'PLAY' | 'TOUCH') => {
    sendMessageToRN({ type: action });
  };

  const handleShowHistory = () => {
    sendMessageToRN({ type: 'SHOW_HISTORY' });
  };

  const handleShowStatus = () => {
    sendMessageToRN({ type: 'SHOW_STATUS' });
  };

  const handleLogout = () => {
    sendMessageToRN({ type: 'LOGOUT' });
  };

  if (!pet) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🥚</div>
        <div className="loading-text">加载中...</div>
      </div>
    );
  }

  const maxExp = pet.level * 100;
  const expProgress = (pet.exp / maxExp) * 100;

  return (
    <div className="pet-web-container">
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
            <div className="pet-placeholder">
              <span className="pet-emoji">🐲</span>
            </div>
          </div>
          <div className="pet-shadow" />
        </div>

        {/* 左侧状态栏 - 使用毛玻璃效果 */}
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
              <div 
                className="status-bar-fill" 
                style={{ 
                  width: `${expProgress}%`, 
                  background: 'linear-gradient(90deg, #FFD700, #FFA500)' 
                }} 
              />
            </div>
          </div>

          <div className="status-item">
            <div className="status-label">
              <span className="status-icon">🍖</span>
              <span>饥饿</span>
            </div>
            <div className="status-bar">
              <div 
                className="status-bar-fill" 
                style={{ 
                  width: `${pet.hunger}%`, 
                  background: 'linear-gradient(90deg, #FF9500, #FF7A00)' 
                }} 
              />
            </div>
          </div>

          <div className="status-item">
            <div className="status-label">
              <span className="status-icon">🎮</span>
              <span>快乐</span>
            </div>
            <div className="status-bar">
              <div 
                className="status-bar-fill" 
                style={{ 
                  width: `${pet.happiness}%`, 
                  background: 'linear-gradient(90deg, #FF2D55, #FF1744)' 
                }} 
              />
            </div>
          </div>

          <div className="status-item">
            <div className="status-label">
              <span className="status-icon">❤️</span>
              <span>健康</span>
            </div>
            <div className="status-bar">
              <div 
                className="status-bar-fill" 
                style={{ 
                  width: `${pet.health}%`, 
                  background: 'linear-gradient(90deg, #34C759, #30D158)' 
                }} 
              />
            </div>
          </div>
        </div>

        {/* 顶部导航栏 */}
        <div className="top-navbar glass-surface">
          <button className="nav-button" onClick={handleShowHistory}>
            <span className="nav-icon">💬</span>
          </button>
          <button className="nav-button" onClick={handleShowStatus}>
            <span className="nav-icon">📊</span>
          </button>
          <button className="nav-button logout-button" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
          </button>
        </div>

        {/* 右侧操作按钮 */}
        <div className="action-sidebar">
          <button className="action-button" onClick={() => handleAction('FEED')}>
            <div className="action-icon-circle feed-button">
              <span className="action-icon">🍖</span>
            </div>
            <span className="action-label">喂食</span>
          </button>

          <button className="action-button" onClick={() => handleAction('PLAY')}>
            <div className="action-icon-circle play-button">
              <span className="action-icon">🎮</span>
            </div>
            <span className="action-label">玩耍</span>
          </button>

          <button className="action-button" onClick={() => handleAction('TOUCH')}>
            <div className="action-icon-circle touch-button">
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

// 导出用于 WebView
export default PetWebApp;

// 如果在浏览器中直接打开，渲染应用
if (typeof document !== 'undefined') {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<PetWebApp />);
  }
}

// 扩展 Window 接口以支持 ReactNativeWebView
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}
