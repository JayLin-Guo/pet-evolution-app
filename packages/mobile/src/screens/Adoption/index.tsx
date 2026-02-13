import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { resolveWebPetUrl, resolveApiUrl } from "../../utils/config";
import {
  useAdoption,
  useAdoptionAnimations,
  useEggStageAnimations,
} from "./useAdoption";
import { Particle } from "./Particle";
import { styles } from "./styles";

interface AdoptionScreenProps {
  onAdopt: (name: string, speciesId?: number) => void;
  onDraw: () => Promise<any>;
}

export const AdoptionScreen: React.FC<AdoptionScreenProps> = ({
  onAdopt,
  onDraw,
}) => {
  const {
    stage,
    drawnEgg,
    name,
    setName,
    redrawCount,
    resultFadeAnim,
    handleStartDraw,
    handleRedraw,
    handleAdopt,
  } = useAdoption(onDraw, onAdopt);

  const {
    fadeAnim,
    slideAnim,
    eggScaleAnim,
    eggRotateAnim,
    glowOpacityAnim,
    glowScaleAnim,
    holyLightAnim,
    spinInterpolate,
  } = useAdoptionAnimations();

  useEggStageAnimations(
    stage,
    eggScaleAnim,
    eggRotateAnim,
    glowOpacityAnim,
    glowScaleAnim,
    holyLightAnim,
  );

  const getUltimateFormUrl = () => {
    if (!drawnEgg || !drawnEgg.resource_path) return null;
    const folder = drawnEgg.resource_path.startsWith("/")
      ? drawnEgg.resource_path.substring(1)
      : drawnEgg.resource_path;

    // 统一使用远程静态资源服务器
    const staticBaseUrl = "http://47.93.247.175:8081/static";
    return `${staticBaseUrl}/spine-role/${folder}/idle2.gif`;
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/pet-draw-bc.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.backgroundDecorations}>
        {[...Array(30)].map((_, i) => (
          <Particle key={i} />
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.mainTitle}>
            {stage === "drawn" ? "🎉 恭喜获得！" : "🥚 抽取伙伴"}
          </Text>
          <Text style={styles.subtitle}>
            {stage === "idle"
              ? "准备好迎接你的注定伙伴了吗？"
              : stage === "drawing"
                ? "正在感应命运的召唤..."
                : `命运指引你遇到了 ${drawnEgg?.name || "未知生物"}`}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.petSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {stage !== "drawn" ? (
            <Animated.View
              style={[
                styles.eggContainer,
                {
                  transform: [
                    { scale: eggScaleAnim },
                    { rotate: spinInterpolate },
                  ],
                },
              ]}
            >
              <Text style={styles.eggEmoji}>🥚</Text>
              <Animated.View
                style={[
                  styles.eggGlow,
                  {
                    opacity: glowOpacityAnim,
                    transform: [{ scale: glowScaleAnim }],
                  },
                ]}
              />
            </Animated.View>
          ) : (
            <Animated.View
              style={{ opacity: resultFadeAnim, alignItems: "center" }}
            >
              <View style={styles.resultImageContainer}>
                <Image
                  source={{ uri: getUltimateFormUrl() || "" }}
                  style={styles.resultImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.petNameResult}>{drawnEgg?.name}</Text>
              <Text style={styles.petDescResult}>{drawnEgg?.description}</Text>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {stage === "idle" && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStartDraw}
            >
              <LinearGradient
                style={styles.buttonGradient}
                colors={["#D31027", "#EA384D"]}
              >
                <Text style={styles.buttonText}>
                  开始抽取 ({redrawCount}次机会)
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {stage === "drawing" && (
            <ActivityIndicator size="large" color="#fff" />
          )}

          {stage === "drawn" && (
            <View style={{ width: "100%", alignItems: "center" }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>给它取个名字吧</Text>
                <View style={styles.nameInputContainer}>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="输入宠物姓名..."
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={name}
                    onChangeText={setName}
                    selectionColor="rgba(255,255,255,0.8)"
                    underlineColorAndroid="transparent"
                  />
                </View>
              </View>

              <View style={styles.buttonRow}>
                {redrawCount > 0 && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={handleRedraw}
                  >
                    <Text style={styles.secondaryButtonText}>
                      不满意，重抽 ({redrawCount})
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    !name.trim() && styles.disabledButton,
                    redrawCount > 0 ? styles.halfButton : styles.fullButton,
                  ]}
                  onPress={handleAdopt}
                  disabled={!name.trim()}
                >
                  <LinearGradient
                    colors={
                      name.trim()
                        ? ["#F2994A", "#F2C94C"]
                        : ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]
                    }
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>确认契约</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};
