import { useMemo, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { getStageName, type Pet } from "@pet-evolution/shared";
import type { MessageItem, PetSceneActions, PetSceneProps } from "./types";
import { SpinePet } from "./SpinePet";
import GlassSurface from "../components/GlassSurface/GlassSurface";
import ShinyText from "../components/ShinyText";
import ClickSpark from "../components/ClickSpark";
import { PetMessageBubble } from "../components/PetMessageBubble";
import "./PetScene.css";

export function PetScene({
  pet,
  actions,
  actionMessage: propActionMessage,
  onActionMessageClose,
}: PetSceneProps) {
  const [message, setMessage] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [pendingChat, setPendingChat] = useState(false);
  const [petMessage, setPetMessage] = useState<string | null>(null);

  // 监听外部传入的消息
  useEffect(() => {
    if (propActionMessage) {
      setPetMessage(propActionMessage);
    }
  }, [propActionMessage]);

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

  const handleAction = async (
    action: keyof Pick<PetSceneActions, "feed" | "play" | "touch">,
  ) => {
    try {
      let result;
      if (action === "feed") {
        result = await actions.feed(20);
      } else {
        result = await actions[action]();
      }

      // 如果有返回消息，显示消息气泡
      if (result && typeof result === "object" && "message" in result) {
        setPetMessage((result as any).message);
      }
    } catch (error) {
      console.error(`操作 ${action} 失败:`, error);
    }
  };

  return (
    <div className="pet-main-container pet-web-container">
      <div className="scene-background" />

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
            {petMessage && (
              <PetMessageBubble
                message={petMessage}
                duration={3000}
                onClose={() => {
                  setPetMessage(null);
                  onActionMessageClose?.();
                }}
              />
            )}

            <SpinePet pet={pet} />
          </div>
          <div className="pet-shadow" />
        </div>

        <div className="status-sidebar">
          <GlassSurface
            width="100%"
            height="100%"
            borderRadius={24}
            backgroundOpacity={0.2}
            blur={20}
            displace={2}
            distortionScale={-200}
            redOffset={0}
            greenOffset={15}
            blueOffset={30}
          >
            <div className="status-list">
              <div className="level-badge">
                <div className="level-label">LV</div>
                <div className="level-value">
                  <ShinyText
                    text={pet.level.toString()}
                    speed={3}
                    color="#ffffff"
                    shineColor="#FFD700"
                  />
                </div>
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
          </GlassSurface>
        </div>

        <div className="top-navbar">
          <div className="nav-menu-container">
            <div className="nav-list">
              <button
                className={`nav-button menu-toggle ${showMenu ? "active" : ""}`}
                onClick={() => setShowMenu(!showMenu)}
              >
                <Icon
                  icon={showMenu ? "lucide:x" : "lucide:menu"}
                  className="nav-icon"
                />
              </button>
            </div>

            {showMenu && (
              <div className="nav-dropdown">
                <GlassSurface
                  width="auto"
                  height="auto"
                  borderRadius={20}
                  backgroundOpacity={0.2}
                  blur={20}
                  displace={2}
                  distortionScale={-200}
                  redOffset={0}
                  greenOffset={15}
                  blueOffset={30}
                >
                  <div className="dropdown-list">
                    <button
                      className="nav-button"
                      onClick={() => {
                        setShowHistory(true);
                        setShowMenu(false);
                      }}
                      title="消息记录"
                    >
                      <Icon icon="lucide:message-circle" className="nav-icon" />
                    </button>
                    <button
                      className="nav-button"
                      onClick={() => {
                        setShowStatus(true);
                        setShowMenu(false);
                      }}
                      title="成长状态"
                    >
                      <Icon icon="lucide:bar-chart-2" className="nav-icon" />
                    </button>
                    <button
                      className="nav-button logout-button"
                      onClick={() => {
                        actions.logout();
                        setShowMenu(false);
                      }}
                      title="退出登录"
                    >
                      <Icon icon="lucide:log-out" className="nav-icon" />
                    </button>
                  </div>
                </GlassSurface>
              </div>
            )}
          </div>
        </div>

        <div className="action-sidebar">
          <ClickSpark sparkColor="#FF9500" sparkCount={12} sparkRadius={30}>
            <button
              className="action-button"
              onClick={() => handleAction("feed")}
            >
              <div className="action-icon-circle feed-button">
                <span className="action-icon">🍖</span>
              </div>
              <span className="action-label">喂食</span>
            </button>
          </ClickSpark>

          <ClickSpark sparkColor="#FF2D55" sparkCount={12} sparkRadius={30}>
            <button
              className="action-button"
              onClick={() => handleAction("play")}
            >
              <div className="action-icon-circle play-button">
                <span className="action-icon">🎮</span>
              </div>
              <span className="action-label">玩耍</span>
            </button>
          </ClickSpark>

          <ClickSpark sparkColor="#AF52DE" sparkCount={12} sparkRadius={30}>
            <button
              className="action-button"
              onClick={() => handleAction("touch")}
            >
              <div className="action-icon-circle touch-button">
                <span className="action-icon">💕</span>
              </div>
              <span className="action-label">抚摸</span>
            </button>
          </ClickSpark>
        </div>
      </div>

      <div className="chat-input-container">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={24}
          backgroundOpacity={0.1}
          blur={15}
          displace={5}
          distortionScale={-400}
        >
          <div className="chat-content-inner">
            <button
              className="mode-button"
              onClick={() => setIsVoiceMode(!isVoiceMode)}
            >
              <Icon icon="mynaui:contactless-solid" width="24" height="24" />
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

            {!isVoiceMode && message.trim() && (
              <button className="send-button" onClick={handleSendMessage}>
                <span>{pendingChat ? "发送中..." : "发送"}</span>
              </button>
            )}
          </div>
        </GlassSurface>
      </div>

      {showHistory ? (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">消息记录</div>
              <button
                className="modal-close"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              {messages.length === 0 ? (
                <div style={{ padding: 16, opacity: 0.7 }}>还没有消息记录</div>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} className={`msg-bubble ${m.sender}`}>
                    <div className="msg-sender">
                      {m.sender === "user" ? "我" : "宠物"}
                    </div>
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
              <button
                className="modal-close"
                onClick={() => setShowStatus(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  📋 基本信息
                </div>
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
