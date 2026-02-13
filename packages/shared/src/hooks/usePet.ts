import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { petApi, PetResponseDto } from "../api/pet";
import { petEggApi } from "../api/pet-egg";
import { authApi } from "../api/auth";

const STORAGE_KEY = "@pet_data";

export const usePet = () => {
  const [pet, setPet] = useState<PetResponseDto | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    userId: string;
    phoneNumber: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化：检查登录态并同步数据
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const user = await authApi.getCurrentUser();
      if (user) {
        setCurrentUser({
          userId: user.userId.toString(),
          phoneNumber: user.phone,
        });
        await loadPet();
      }
      setLoading(false);
    };
    init();
  }, []);

  /**
   * 从服务器获取最新宠物数据
   */
  const syncPetWithServer = useCallback(async () => {
    if (!currentUser) return;

    try {
      const updated = await petApi.getPet();
      if (updated) {
        setPet(updated);
      } else {
        setPet((prevPet) => {
          if (prevPet) return null;
          return prevPet;
        });
      }
    } catch (error) {
      console.error("同步宠物数据失败:", error);
    }
  }, [currentUser]);

  // 定时轮询更新宠物状态
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // 立即同步一次
    syncPetWithServer();

    // 每2分钟轮询一次
    intervalId = setInterval(() => {
      if (isMounted) {
        syncPetWithServer();
      }
    }, 120000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentUser, syncPetWithServer]);

  const loadPet = async () => {
    try {
      const remotePet = await petApi.getPet();
      setPet(remotePet);
    } catch (error) {
      console.error("加载宠物数据失败:", error);
    }
  };

  /**
   * 登录 / 注册
   */
  const login = async (
    phone: string,
    captchaId: string,
    captchaCode: string,
  ) => {
    const user = await authApi.login(phone, captchaId, captchaCode);
    const userData = {
      userId: user.userId.toString(),
      phoneNumber: phone,
    };
    setCurrentUser(userData);
    await loadPet();
  };

  /**
   * 退出登录
   */
  const logout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    setPet(null);
  };

  /**
   * 抽取宠物蛋
   */
  const drawPet = useCallback(async () => {
    return await petEggApi.draw();
  }, []);

  /**
   * 领养宠物（确认契约）
   * @param name 宠物名称
   * @param speciesId 物种ID（来自抽取结果）
   */
  const adoptPet = useCallback(
    async (name: string, speciesId?: number) => {
      if (!currentUser) return;
      try {
        setLoading(true);

        let currentSpeciesId = speciesId;

        // 如果没有提供 speciesId，则自动抽取
        if (!currentSpeciesId) {
          console.log("开始自动抽取宠物蛋...");
          const drawResult = await petEggApi.draw();
          currentSpeciesId = drawResult.petEgg.species_id;
          console.log("抽到:", drawResult.petEgg.name);
        }

        // 领养
        console.log(
          "开始领养宠物，名字:",
          name,
          "SpeciesID:",
          currentSpeciesId,
        );
        const remotePet = await petApi.adoptPet(name, currentSpeciesId!);
        setPet(remotePet);
        console.log("领养成功:", remotePet.name);
      } catch (error) {
        console.error("领养失败:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentUser],
  );

  return {
    pet,
    currentUser,
    loading,
    login,
    logout,
    adoptPet,
    drawPet,
  };
};
