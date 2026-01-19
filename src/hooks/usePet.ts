import { useState, useEffect, useCallback } from "react";
import {
  Pet,
  GrowthStage,
  UltimateForm,
  createNewPet,
} from "../models/PetModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { petApi } from "../api/pet";
import { authApi } from "../api/auth";

const STORAGE_KEY = "@pet_data";
const USE_MOCK = true;

export const usePet = () => {
  const [pet, setPet] = useState<Pet | null>(null);
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
        setCurrentUser(user);
        await loadPet(user.userId);
      }
      setLoading(false);
    };
    init();
  }, []);

  // 定时同步宠物状态
  useEffect(() => {
    if (!pet || !currentUser) return;
    const interval = setInterval(() => {
      syncPetWithServer();
    }, 60000);

    return () => clearInterval(interval);
  }, [pet, currentUser]);

  const loadPet = async (userId: string) => {
    try {
      if (USE_MOCK) {
        // 使用用户ID作为存储键的一部分，实现多账号隔离
        const data = await AsyncStorage.getItem(`${STORAGE_KEY}_${userId}`);
        setPet(data ? JSON.parse(data) : null);
      } else {
        const remotePet = await petApi.getPet();
        setPet(remotePet);
      }
    } catch (error) {
      console.error("加载宠物数据失败:", error);
    }
  };

  /**
   * 登录 / 注册
   */
  const login = async (phone: string) => {
    const user = await authApi.login(phone);
    const userData = { userId: user.userId, phoneNumber: phone };
    setCurrentUser(userData);
    await loadPet(user.userId);
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
   * 同步数据到服务器/本地存储
   */
  const syncPetWithServer = async (targetPet?: Pet) => {
    const dataToSync = targetPet || pet;
    if (!dataToSync || !currentUser) return;

    try {
      if (USE_MOCK) {
        await AsyncStorage.setItem(
          `${STORAGE_KEY}_${currentUser.userId}`,
          JSON.stringify(dataToSync),
        );
      } else {
        // 增量或全量同步到服务器
        const updated = await petApi.updateStatus(dataToSync);
        setPet(updated);
      }
    } catch (error) {
      console.error("同步宠物数据失败:", error);
    }
  };

  // 领养宠物
  const adoptPet = useCallback(
    async (name: string) => {
      if (!currentUser) return;
      try {
        setLoading(true);
        if (USE_MOCK) {
          const newPet = createNewPet(currentUser.userId);
          newPet.name = name;
          await syncPetWithServer(newPet);
          setPet(newPet);
        } else {
          const remotePet = await petApi.adoptPet(name);
          setPet(remotePet);
        }
      } catch (error) {
        console.error("领养失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [pet, currentUser],
  );

  // 退出/注销
  const resetPet = async () => {
    if (currentUser) {
      await AsyncStorage.removeItem(`${STORAGE_KEY}_${currentUser.userId}`);
      setPet(null);
    }
  };

  // 喂食
  const feed = useCallback(
    async (foodValue: number = 20) => {
      if (!pet) return;
      try {
        const updatedPet = await petApi.feedPet(foodValue);
        setPet(updatedPet);
        await syncPetWithServer(updatedPet);
      } catch (e) {
        console.error("喂食同步失败:", e);
      }
    },
    [pet],
  );

  // 玩耍
  const play = useCallback(async () => {
    if (!pet) return;
    try {
      const updatedPet = await petApi.playWithPet();
      setPet(updatedPet);
      await syncPetWithServer(updatedPet);
    } catch (e) {
      console.error("玩耍同步失败:", e);
    }
  }, [pet]);

  // 聊天
  const chat = useCallback(
    async (message: string): Promise<string> => {
      if (!pet) return "我还没出生呢...";

      try {
        const { reply, statusUpdate } = await petApi.chatWithPet(message);

        // 以 API 返回的 statusUpdate 为主更新数据
        if (statusUpdate) {
          const newPet = { ...pet, ...statusUpdate };

          // 如果 API 返回了经验值增加，前端可以在此处处理升级逻辑
          if (statusUpdate.exp) {
            addExp(newPet, 0); // 触发内部升级检查逻辑
          }

          setPet(newPet);
          await syncPetWithServer(newPet);
        }
        return reply;
      } catch (e) {
        return "我的通讯似乎被切断了...";
      }
    },
    [pet],
  );

  // 抚摸
  const pet_touch = useCallback(async () => {
    if (!pet) return;
    try {
      const updatedPet = await petApi.touchPet();
      setPet(updatedPet);
      await syncPetWithServer(updatedPet);
    } catch (e) {
      console.error("抚摸同步失败:", e);
    }
  }, [pet]);

  // 增加经验值
  const addExp = (currentPet: Pet, amount: number) => {
    currentPet.exp += amount;
    checkLevelUp(currentPet);
  };

  // 检查升级
  const checkLevelUp = (currentPet: Pet) => {
    const expNeeded = currentPet.level * 100;
    if (currentPet.exp >= expNeeded) {
      currentPet.exp -= expNeeded;
      currentPet.level++;
      checkStageUp(currentPet);
    }
  };

  // 检查阶段提升
  const checkStageUp = (currentPet: Pet) => {
    if (currentPet.level % 3 === 0) {
      if (currentPet.subStage < 3) {
        currentPet.subStage++;
      } else {
        currentPet.subStage = 1;
        advanceStage(currentPet);
      }
    }
  };

  // 进入下一个大阶段
  const advanceStage = (currentPet: Pet) => {
    const stages = [
      GrowthStage.BABY,
      GrowthStage.CHILD,
      GrowthStage.TEEN,
      GrowthStage.ADULT,
      GrowthStage.PRIME,
      GrowthStage.PEAK,
    ];
    const currentIndex = stages.indexOf(currentPet.stage);
    if (currentIndex < stages.length - 1) {
      currentPet.stage = stages[currentIndex + 1];
    }
    if (currentPet.stage === GrowthStage.PEAK && !currentPet.ultimateForm) {
      determineUltimateForm(currentPet);
    }
  };

  /**
   * 确定终极形态
   */
  const determineUltimateForm = (currentPet: Pet) => {
    const attrs = currentPet.attributes;
    const maxAttr = Math.max(
      attrs.strength,
      attrs.intelligence,
      attrs.agility,
      attrs.spirit,
      attrs.charm,
    );
    if (attrs.strength === maxAttr)
      currentPet.ultimateForm = UltimateForm.DRAGON;
    else if (attrs.intelligence === maxAttr)
      currentPet.ultimateForm = UltimateForm.TAOTIE;
    else if (attrs.agility === maxAttr)
      currentPet.ultimateForm = UltimateForm.PHOENIX;
    else if (attrs.spirit === maxAttr)
      currentPet.ultimateForm = UltimateForm.ANGEL;
    else currentPet.ultimateForm = UltimateForm.QILIN;
  };

  const updatePetStatus = async () => {
    if (!pet) return;
    const now = Date.now();
    const timePassed = (now - pet.lastInteractTime) / 1000 / 60;
    if (timePassed >= 10) {
      const newPet = { ...pet };
      newPet.hunger = Math.max(0, newPet.hunger - 5);
      newPet.happiness = Math.max(0, newPet.happiness - 3);
      newPet.lastInteractTime = now;
      setPet(newPet);
      await syncPetWithServer(newPet);
    }
  };

  return {
    pet,
    currentUser,
    loading,
    login,
    logout,
    adoptPet,
    resetPet,
    feed,
    play,
    chat,
    pet_touch,
  };
};
