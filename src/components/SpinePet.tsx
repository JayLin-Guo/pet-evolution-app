import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Pet, GrowthStage } from '../models/PetModel';

const { width } = Dimensions.get('window');

interface SpinePetProps {
  pet: Pet;
  animation?: string;
}

export const SpinePet: React.FC<SpinePetProps> = ({ pet, animation = 'idle2' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 根据成长阶段选择资源文件夹和文件名
  const assetConfig = React.useMemo(() => {
    // 目前只有 mon_earth_dragon_01_v38 可用，其他阶段暂时复用
    // TODO: 后续添加其他阶段的资源文件
    switch (pet.stage) {
      case GrowthStage.BABY:
      case GrowthStage.CHILD:
        return {
          folder: 'mon_earth_dragon_01_v38',
          baseName: 'mon_earth_dragon_01'
        };
      case GrowthStage.TEEN:
      case GrowthStage.ADULT:
        // TODO: 替换为实际的 teen/adult 资源
        return {
          folder: 'mon_earth_dragon_01_v38',
          baseName: 'mon_earth_dragon_01'
        };
      case GrowthStage.PRIME:
      case GrowthStage.PEAK:
        // TODO: 替换为实际的 prime/peak 资源
        return {
          folder: 'mon_earth_dragon_01_v38',
          baseName: 'mon_earth_dragon_01'
        };
      default:
        return {
          folder: 'mon_earth_dragon_01_v38',
          baseName: 'mon_earth_dragon_01'
        };
    }
  }, [pet.stage]);

  useEffect(() => {
    // 在浏览器环境中加载 Spine
    if (typeof window === 'undefined') return;

    const loadSpine = async () => {
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
      const assetsPath = window.location.origin + `/assets/${assetConfig.folder}/`;
      
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
          jsonUrl: assetsPath + `${assetConfig.baseName}.json`,
          atlasUrl: assetsPath + `${assetConfig.baseName}.atlas`,
          animation: animation,
          premultipliedAlpha: true,
          backgroundColor: "#00000000",
          alpha: true,
          showControls: false,
          preserveDrawingBuffer: false,
          fitToCanvas: true,
          viewport: {
            padLeft: "10%",
            padRight: "10%",
            padTop: "10%",
            padBottom: "10%"
          },
          success: () => {
            setError(null);
            console.log('✅ Spine 加载成功！');
            // 确保动画开始播放
            if (playerRef.current?.skeleton?.data?.animations) {
              const animations = playerRef.current.skeleton.data.animations.map((anim: any) => anim.name);
              console.log('📋 可用动画:', animations);
              console.log('🎬 尝试播放动画:', animation);
              
              const hasAnimation = animations.includes(animation);
              if (hasAnimation) {
                console.log('✅ 动画存在，开始播放');
                playerRef.current.setAnimation(animation, true);
                
                // 检查动画状态
                setTimeout(() => {
                  if (playerRef.current?.animationState) {
                    console.log('🎭 动画状态:', playerRef.current.animationState);
                  }
                }, 100);
              } else {
                console.log('⚠️ 动画不存在，使用 idle2');
                playerRef.current.setAnimation('idle2', true);
              }
            }
          },
          error: (_: any, msg: string) => {
            setError(msg);
          }
        });
      } catch (e: any) {
        setError(e.message);
      }
    };

    loadSpine();

    return () => {
      if (playerRef.current) {
        try { playerRef.current.dispose(); } catch(e) {}
      }
    };
  }, [assetConfig, animation]);

  useEffect(() => {
    if (!playerRef.current || !playerRef.current.skeleton) return;
    
    try {
      const animationData = playerRef.current.skeleton.data;
      const hasAnimation = animationData.animations.some((anim: any) => anim.name === animation);
      
      if (hasAnimation) {
        playerRef.current.setAnimation(animation, true);
      } else {
        playerRef.current.setAnimation('idle2', true);
      }
    } catch (e) {
      console.error('切换动画失败:', e);
    }
  }, [animation]);

  if (typeof window === 'undefined') {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>服务端渲染中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
