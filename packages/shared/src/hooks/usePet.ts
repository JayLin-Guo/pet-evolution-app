import { useState, useEffect, useCallback } from "react";
import {
  Pet,
  GrowthStage,
  UltimateForm,
  createNewPet,
} from "../models/PetModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { petApi } from "../api/pet";
import { petEggApi } from "../api/pet-egg";
import { authApi } from "../api/auth";

const STORAGE_KEY = "@pet_data";
const USE_MOCK = false; // 改为 false，使用真实 API

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
   * 同步数据到服务器/本地存储
   * 轮询时调用此方法获取最新状态
   * 注意：不依赖 pet，避免 pet 更新时重新创建函数导致定时器重建
   */
  const syncPetWithServer = useCallback(async (targetPet?: Pet) => {
    if (!currentUser) return;

    try {
      if (USE_MOCK) {
        // Mock 模式下，如果有传入的 targetPet 就使用，否则从服务器获取
        if (targetPet) {
          await AsyncStorage.setItem(
            `${STORAGE_KEY}_${currentUser.userId}`,
            JSON.stringify(targetPet),
          );
        }
      } else {
        // 重新从服务器获取最新数据（轮询）
        // 不依赖本地 pet 状态，直接从服务器获取最新数据
        const updated = await petApi.getPet();
        if (updated) {
          setPet(updated);
        } else {
          // 如果服务器返回null，说明宠物可能被删除，清空本地状态
          setPet((prevPet) => {
            if (prevPet) {
              return null;
            }
            return prevPet;
          });
        }
      }
    } catch (error) {
      console.error("同步宠物数据失败:", error);
      // 轮询失败时不抛出错误，避免中断轮询
    }
  }, [currentUser]); // 只依赖 currentUser，不依赖 pet

  // 定时轮询更新宠物状态
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // 立即同步一次
    syncPetWithServer();

    // 每2分钟轮询一次，获取最新的宠物状态
    // 服务器定时任务每10分钟更新一次，2分钟轮询可以及时获取更新
    intervalId = setInterval(() => {
      if (isMounted) {
        syncPetWithServer();
      }
    }, 120000); // 2分钟（120秒）

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentUser, syncPetWithServer]);

  const loadPet = async () => {
    try {
      // 统一通过 API 获取数据（内部根据环境 mock 或真实请求）
      const remotePet = await petApi.getPet();
      setPet(remotePet);
    } catch (error) {
      console.error("加载宠物数据失败:", error);
    }
  };

  /**
   * 登录 / 注册
   */
  const login = async (phone: string) => {
    const user = await authApi.login(phone);
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


  // 领养宠物
  // 注意：这个函数现在只接收 name 参数，内部会自动先抽取宠物蛋
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
          // 1. 先抽取宠物蛋
          console.log("开始抽取宠物蛋...");
          const drawResult = await petEggApi.draw();
          const petEggId = drawResult.petEgg.id;
          console.log("抽到宠物蛋:", drawResult.petEgg.name, "ID:", petEggId);

          // 2. 使用抽取到的宠物蛋领养宠物
          console.log("开始领养宠物，名字:", name);
          const remotePet = await petApi.adoptPet(petEggId, name);
          setPet(remotePet);
          console.log("领养成功:", remotePet.name);
        }
      } catch (error) {
        console.error("领养失败:", error);
        throw error; // 抛出错误，让调用方可以处理
      } finally {
        setLoading(false);
      }
    },
    [currentUser],
  );

  // 喂食
  const feed = useCallback(
    async (foodValue: number = 20) => {
      if (!pet) return;
      
      // 前端检查：如果饥饿值已满，直接返回消息，不调用API
      if (pet.hunger >= 100) {
        return "宠物已经吃饱了";
      }
      
      try {
        const petId = parseInt(pet.id);
        const result = await petApi.feedPet(petId);
        setPet(result.pet);
        await syncPetWithServer(result.pet);
        // 返回消息，供调用方显示
        return result.message;
      } catch (e) {
        console.error("喂食同步失败:", e);
        return undefined;
      }
    },
    [pet],
  );

  // 玩耍
  const play = useCallback(async () => {
    if (!pet) return;
    
    // 前端检查：如果快乐值已满，直接返回消息，不调用API
    if (pet.happiness >= 100) {
      return "宠物已经很开心了";
    }
    
    try {
        const petId = parseInt(pet.id);
        const result = await petApi.playWithPet(petId);
        setPet(result.pet);
        await syncPetWithServer(result.pet);
        // 返回消息，供调用方显示
        return result.message;
    } catch (e) {
      console.error("玩耍同步失败:", e);
      return undefined;
    }
  }, [pet]);

  // 聊天
  const chat = useCallback(
    async (message: string): Promise<string> => {
      if (!pet) return "我还没出生呢...";

      try {
        const petId = parseInt(pet.id);
        const { reply, statusUpdate } = await petApi.chatWithPet(petId, message);

        // 以 API 返回的 statusUpdate 为主更新数据
        if (statusUpdate) {
          const newPet = { ...pet, ...statusUpdate };

          // 如果 API 返回了经验值增加，触发升级检查逻辑
          if (statusUpdate.exp !== undefined) {
            checkLevelUp(newPet);
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
    
    // 前端检查：如果健康值已满，直接返回消息，不调用API
    if (pet.health >= 100) {
      return "宠物已经很健康了";
    }
    
    try {
        const petId = parseInt(pet.id);
        const result = await petApi.touchPet(petId);
        setPet(result.pet);
        await syncPetWithServer(result.pet);
        // 返回消息，供调用方显示
        return result.message;
    } catch (e) {
      console.error("抚摸同步失败:", e);
      return undefined;
    }
  }, [pet]);

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
    // 阶段/形态变化后，更新资源路径
    // currentPet.spinePath = ... (TODO: 生产环境应由服务端返回最新路径)
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

  return {
    pet,
    currentUser,
    loading,
    login,
    logout,
    adoptPet,
    feed,
    play,
    chat,
    pet_touch,
  };
};
