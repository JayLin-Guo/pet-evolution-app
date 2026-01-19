import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import { Pet, GrowthStage } from '../models/PetModel';

const { width } = Dimensions.get('window');

interface SpinePetProps {
  pet: Pet;
  animation?: string;
}

export const SpinePet: React.FC<SpinePetProps> = ({ pet, animation = 'idle2' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assetFolder = React.useMemo(() => {
    switch (pet.stage) {
      case GrowthStage.BABY:
      case GrowthStage.CHILD: return 'mon_earth_dragon_01_v38';
      case GrowthStage.TEEN:
      case GrowthStage.ADULT: return 'mon_earth_dragon_02';
      case GrowthStage.PRIME:
      case GrowthStage.PEAK: return 'mon_earth_dragon_03';
      default: return 'mon_earth_dragon_01_v38';
    }
  }, [pet.stage]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const loadSpine = async () => {
      // 加载 Spine Player 脚本
      if (!(window as any).spine) {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/@esotericsoftware/spine-player@4.2/dist/iife/spine-player.js";
        const link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/@esotericsoftware/spine-player@4.2/dist/spine-player.css";
        document.head.appendChild(script);
        document.head.appendChild(link);
        await new Promise(resolve => script.onload = resolve);
      }

      if (!containerRef.current) return;

      const spine = (window as any).spine;
      const assetsPath = window.location.origin + `/assets/${assetFolder}/`;
      
      try {
        containerRef.current.innerHTML = "";
        const playerDiv = document.createElement('div');
        playerDiv.style.width = "100%";
        playerDiv.style.height = "100%";
        containerRef.current.appendChild(playerDiv);

        if (playerRef.current) {
          try { playerRef.current.dispose(); } catch(e) {}
        }

        playerRef.current = new spine.SpinePlayer(playerDiv, {
          jsonUrl: assetsPath + "mon_earth_dragon_01.json",
          atlasUrl: assetsPath + "mon_earth_dragon_01.atlas",
          animation: animation,
          premultipliedAlpha: true,
          backgroundColor: "#00000000",
          alpha: true,
          showControls: false,
          viewport: {
            padLeft: "10%",
            padRight: "10%",
            padTop: "10%",
            padBottom: "10%"
          },
          success: () => {
            setIsLoading(false);
            setError(null);
          },
          error: (p: any, msg: string) => {
            setError(msg);
            setIsLoading(false);
          }
        });
      } catch (e: any) {
        setError(e.message);
        setIsLoading(false);
      }
    };

    loadSpine();

    return () => {
      if (playerRef.current) {
        try { playerRef.current.dispose(); } catch(e) {}
      }
    };
  }, [assetFolder]);

  // 当动画改变时更新
  useEffect(() => {
    if (playerRef.current && playerRef.current.skeleton) {
      try {
        playerRef.current.setAnimation(animation, true);
      } catch (e) {
        console.warn('Animation not found:', animation);
      }
    }
  }, [animation]);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>移动端 Spine 渲染开发中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>加载宠物中...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>加载失败: {error}</Text>
        </View>
      )}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 350,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
  },
  errorOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    padding: 10,
    backgroundColor: 'rgba(255,0,0,0.8)',
    borderRadius: 5,
    zIndex: 10,
  },
  errorText: {
    color: '#fff',
    fontSize: 12,
  },
  placeholder: {
    color: '#666',
    fontSize: 14,
  }
});
