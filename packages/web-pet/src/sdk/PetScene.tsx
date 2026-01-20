import { useMemo, useState, useEffect, useRef } from "react";
import { getStageName, type Pet } from "@pet-evolution/shared";
import type { MessageItem, PetSceneActions, PetSceneProps } from "./types";
import { SpinePet } from "./SpinePet";

export function PetScene({ pet, actions, spineBaseUrl }: PetSceneProps) {
  const [message, setMessage] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [pendingChat, setPendingChat] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<string>("idle2");
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const expProgress = useMemo(() => {
    const maxExp = pet.level * 100;
    return maxExp > 0 ? (pet.exp / maxExp) * 100 : 0;
  }, [pet.exp, pet.level]);

  const handleSendMessage = async () => {
    const text = message.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setPendingChat(true);
    setMessage("");
    try {
      const reply = await actions.chat(text);
      setMessages((prev) => [...prev, { sender: "pet", text: reply }]);
    } finally {
      setPendingChat(false);
    }
  };

  const handleAction = async (action: keyof Pick<PetSceneActions, "feed" | "play" | "touch">) => {
    // 清除之前的 timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    // 根据操作切换动画
    const animationMap: Record<string, string> = {
      feed: "eat",
      play: "play",
      touch: "touch",
    };
    const anim = animationMap[action] || "idle2";
    setCurrentAnimation(anim);

    if (action === "feed") {
      await actions.feed(20);
    } else {
      await actions[action]();
    }

    // 操作完成后，延迟恢复 idle 动画
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentAnimation("idle2");
      animationTimeoutRef.current = null;
    }, 2000);
  };

  // 根据宠物状态自动切换动画
  useEffect(() => {
    // 如果当前没有特定操作动画，根据宠物状态选择
    if (currentAnimation === "idle2" || currentAnimation === "idle") {
      // 可以根据 pet 的状态选择不同的 idle 动画
      // 例如：如果饥饿值低，可以显示 "hungry" 动画
      if (pet.hunger < 30) {
        setCurrentAnimation("hungry");
      } else {
        setCurrentAnimation("idle2");
      }
    }
  }, [pet.hunger, currentAnimation]);

  return (
    <div className="pet-main-container pet-web-container">
      <div className="gradient-background" />

      <div className="background-decorations">
        <div className="floating-star star-1">✨</div>
        <div className="floating-star star-2">🌟</div>
        <div className="floating-star star-3">💫</div>
        <div className="floating-star star-4">☁️</div>
      </div>

      <div className="main-content">
        <div className="pet-display-area">
          <div className="pet-glow" />
          <div className="pet-container">
            <SpinePet spineBaseUrl={spineBaseUrl} animation={currentAnimation} pet={pet} />
          </div>
          <div className="pet-shadow" />
        </div>

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
                  background: "linear-gradient(90deg, #FFD700, #FFA500)",
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
                  background: "linear-gradient(90deg, #FF9500, #FF7A00)",
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
                  background: "linear-gradient(90deg, #FF2D55, #FF1744)",
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
                  background: "linear-gradient(90deg, #34C759, #30D158)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="top-navbar glass-surface">
          <button className="nav-button" onClick={() => setShowHistory(true)}>
            <span className="nav-icon">💬</span>
          </button>
          <button className="nav-button" onClick={() => setShowStatus(true)}>
            <span className="nav-icon">📊</span>
          </button>
          <button className="nav-button logout-button" onClick={() => actions.logout()}>
            <span className="nav-icon">🚪</span>
          </button>
        </div>

        <div className="action-sidebar">
          <button className="action-button" onClick={() => handleAction("feed")}>
            <div className="action-icon-circle feed-button">
              <span className="action-icon">🍖</span>
            </div>
            <span className="action-label">喂食</span>
          </button>

          <button className="action-button" onClick={() => handleAction("play")}>
            <div className="action-icon-circle play-button">
              <span className="action-icon">🎮</span>
            </div>
            <span className="action-label">玩耍</span>
          </button>

          <button className="action-button" onClick={() => handleAction("touch")}>
            <div className="action-icon-circle touch-button">
              <span className="action-icon">💕</span>
            </div>
            <span className="action-label">抚摸</span>
          </button>
        </div>
      </div>

      <div className="chat-input-container glass-surface">
        <button className="mode-button" onClick={() => setIsVoiceMode(!isVoiceMode)}>
          <span className="mode-icon">{isVoiceMode ? "⌨️" : "🎤"}</span>
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
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
          </div>
        )}

        {!isVoiceMode && message.trim() ? (
          <button className="send-button" onClick={handleSendMessage}>
            <span>{pendingChat ? "发送中..." : "发送"}</span>
          </button>
        ) : (
          <button className="plus-button">
            <span className="plus-icon">➕</span>
          </button>
        )}
      </div>

      {showHistory ? (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">消息记录</div>
              <button className="modal-close" onClick={() => setShowHistory(false)}>
                ✕
              </button>
            </div>
            <div className="modal-content">
              {messages.length === 0 ? (
                <div style={{ padding: 16, opacity: 0.7 }}>还没有消息记录</div>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} className={`msg-bubble ${m.sender}`}>
                    <div className="msg-sender">{m.sender === "user" ? "我" : "宠物"}</div>
                    <div className="msg-text">{m.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showStatus ? (
        <div className="modal-overlay" onClick={() => setShowStatus(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">成长状态</div>
              <button className="modal-close" onClick={() => setShowStatus(false)}>
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>📋 基本信息</div>
                <div>名字：{pet.name}</div>
                <div>等级：Lv.{pet.level}</div>
                <div>阶段：{getStageName(pet.stage, pet.subStage)}</div>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>💫 状态</div>
                <div>饥饿：{pet.hunger}</div>
                <div>快乐：{pet.happiness}</div>
                <div>健康：{pet.health}</div>
                <div>亲密：{pet.intimacy}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


