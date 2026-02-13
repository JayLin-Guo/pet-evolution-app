import { useMemo, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { MessageItem, PetSceneActions, PetSceneProps } from "./types";
import { AnimatedPet } from "./AnimatedPet";
import { usePetAnimation } from "./hooks/useAnimatedPet";
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

  // PNG 动画状态管理
  const { animState, triggerAnim } = usePetAnimation("idle");

  // 监听外部传入的消息
  useEffect(() => {
    if (propActionMessage) {
      setPetMessage(propActionMessage);
    }
  }, [propActionMessage]);

  const expProgress = useMemo(() => {
    // cultivation_exp is the raw XP; show as percentage capped at 100
    // In a real game, this might map to levels (e.g. level * 100)
    const maxExp = 100; // Temporary cap for display
    return Math.min((pet.cultivation_exp / maxExp) * 100, 100);
  }, [pet.cultivation_exp]);

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
      // 触发对应的 PNG 动画
      triggerAnim(action, 2500);

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
        <div className="floating-star star-2">✦</div>
        <div className="floating-star star-3">✧</div>
        <div className="floating-star star-4">✴</div>
      </div>

      <div className="main-content">
        <div className="light-beams-container">
          <div className="light-beam beam-1" />
          <div className="light-beam beam-2" />
          <div className="light-beam beam-3" />
          <div className="light-beam beam-4" />
        </div>
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

            <AnimatedPet pet={pet} animState={animState} />
          </div>
          <div className="pet-shadow" />
        </div>

        <div className="status-sidebar">
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={18}
            backgroundOpacity={0.08}
            blur={24}
            displace={1}
            distortionScale={-150}
            redOffset={0}
            greenOffset={10}
            blueOffset={20}
          >
            <div className="status-list">
              <div className="level-badge">
                <div className="level-label">境界</div>
                <div className="level-value">
                  <ShinyText
                    text={pet.cultivation_level}
                    speed={4}
                    color="#FFD700"
                    shineColor="#FFFFFF"
                  />
                </div>
              </div>

              <div className="status-item">
                <div className="status-label">
                  <Icon
                    icon="solar:bolt-bold-duotone"
                    className="status-icon"
                    color="#FFD700"
                  />
                  <span>修炼</span>
                </div>
                <div className="status-bar">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${expProgress}%`,
                      background: "linear-gradient(90deg, #FFD700, #FFA500)",
                      boxShadow: "0 0 6px rgba(255, 215, 0, 0.4)",
                    }}
                  />
                </div>
              </div>

              <div className="status-item">
                <div className="status-label">
                  <Icon
                    icon="solar:hamburger-menu-bold-duotone"
                    className="status-icon"
                    color="#FF9500"
                  />
                  <span>灵食</span>
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
                  <Icon
                    icon="solar:gamepad-bold-duotone"
                    className="status-icon"
                    color="#FF2D55"
                  />
                  <span>道心</span>
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
                  <Icon
                    icon="solar:heart-angle-bold-duotone"
                    className="status-icon"
                    color="#34C759"
                  />
                  <span>体魄</span>
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
                  borderRadius={16}
                  backgroundOpacity={0.1}
                  blur={24}
                  displace={1}
                >
                  <div className="dropdown-list">
                    <button
                      className="nav-button"
                      onClick={() => {
                        setShowHistory(true);
                        setShowMenu(false);
                      }}
                      title="传音记录"
                    >
                      <Icon
                        icon="solar:chat-round-dots-bold-duotone"
                        className="nav-icon"
                      />
                    </button>
                    <button
                      className="nav-button"
                      onClick={() => {
                        setShowStatus(true);
                        setShowMenu(false);
                      }}
                      title="详细状态"
                    >
                      <Icon
                        icon="solar:chart-square-bold-duotone"
                        className="nav-icon"
                      />
                    </button>
                    <button
                      className="nav-button logout-button"
                      onClick={() => {
                        actions.logout();
                        setShowMenu(false);
                      }}
                      title="遁去"
                    >
                      <Icon
                        icon="solar:logout-2-bold-duotone"
                        className="nav-icon"
                      />
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
                <Icon
                  icon="solar:hamburger-menu-bold-duotone"
                  className="action-icon"
                  color="#FFFFFF"
                />
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
                <Icon
                  icon="solar:gamepad-bold-duotone"
                  className="action-icon"
                  color="#FFFFFF"
                />
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
                <Icon
                  icon="solar:heart-angle-bold-duotone"
                  className="action-icon"
                  color="#FFFFFF"
                />
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
          borderRadius={18}
          backgroundOpacity={0.08}
          blur={16}
          displace={2}
          distortionScale={-200}
        >
          <div className="chat-content-inner">
            <button
              className="mode-button"
              onClick={() => setIsVoiceMode(!isVoiceMode)}
            >
              <Icon
                icon="solar:microphone-3-bold-duotone"
                className="mode-icon"
              />
            </button>

            {isVoiceMode ? (
              <button className="voice-button">
                <span>按住 传音</span>
              </button>
            ) : (
              <div className="text-input-wrapper">
                <input
                  type="text"
                  className="text-input"
                  placeholder="与道友交流..."
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
              <div className="modal-title">传音记录</div>
              <button
                className="modal-close"
                onClick={() => setShowHistory(false)}
              >
                <Icon icon="lucide:x" />
              </button>
            </div>
            <div className="modal-content">
              {messages.length === 0 ? (
                <div style={{ padding: 16, opacity: 0.7, textAlign: "center" }}>
                  暂无传音记录
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} className={`msg-bubble ${m.sender}`}>
                    <div className="msg-sender">
                      {m.sender === "user" ? "我" : pet.name}
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
              <div className="modal-title">修为状态</div>
              <button
                className="modal-close"
                onClick={() => setShowStatus(false)}
              >
                <Icon icon="lucide:x" />
              </button>
            </div>
            <div className="modal-content">
              <div style={{ padding: 12 }}>
                <div
                  style={{ fontWeight: 700, marginBottom: 8, color: "#FFD700" }}
                >
                  📋 基础信息
                </div>
                <div style={{ marginBottom: 4 }}>道号：{pet.name}</div>
                <div style={{ marginBottom: 4 }}>
                  境界：{pet.cultivation_level}
                </div>
                <div style={{ marginBottom: 4 }}>
                  修为：{pet.cultivation_exp}
                </div>
              </div>
              <div
                style={{
                  padding: 12,
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{ fontWeight: 700, marginBottom: 8, color: "#FFD700" }}
                >
                  💫 状态
                </div>
                <div style={{ marginBottom: 4 }}>
                  灵食（饱食）：{pet.hunger}
                </div>
                <div style={{ marginBottom: 4 }}>
                  道心（心情）：{pet.happiness}
                </div>
                <div style={{ marginBottom: 4 }}>
                  体魄（健康）：{pet.health}
                </div>
                <div style={{ marginBottom: 4 }}>
                  羁绊（亲密）：{pet.intimacy}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
