import { useState, useEffect, useCallback } from 'react';
import { Pet, GrowthStage, UltimateForm, createNewPet } from '../models/PetModel';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@pet_data';

export const usePet = () => {
  const [pet, setPet] = useState<Pet>(createNewPet());
  const [loading, setLoading] = useState(true);

  // 加载宠物数据
  useEffect(() => {
    loadPet();
  }, []);

  // 定时更新宠物状态
  useEffect(() => {
    const interval = setInterval(() => {
      updatePetStatus();
    }, 60000); // 每分钟更新一次

    return () => clearInterval(interval);
  }, [pet]);

  const loadPet = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setPet(JSON.parse(data));
      }
    } catch (error) {
      console.error('加载宠物数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePet = async (newPet: Pet) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPet));
      setPet(newPet);
    } catch (error) {
      console.error('保存宠物数据失败:', error);
    }
  };

  // 喂食
  const feed = useCallback((foodValue: number = 20) => {
    const newPet = { ...pet };
    newPet.hunger = Math.min(100, newPet.hunger + foodValue);
    newPet.happiness = Math.min(100, newPet.happiness + 5);
    newPet.intimacy = Math.min(100, newPet.intimacy + 2);
    newPet.lastInteractTime = Date.now();
    addExp(newPet, 10);
    savePet(newPet);
  }, [pet]);

  // 玩耍
  const play = useCallback(() => {
    const newPet = { ...pet };
    newPet.happiness = Math.min(100, newPet.happiness + 10);
    newPet.hunger = Math.max(0, newPet.hunger - 5);
    newPet.intimacy = Math.min(100, newPet.intimacy + 3);
    newPet.lastInteractTime = Date.now();
    addExp(newPet, 15);
    savePet(newPet);
  }, [pet]);

  // 聊天
  const chat = useCallback((message: string): string => {
    const newPet = { ...pet };
    newPet.happiness = Math.min(100, newPet.happiness + 8);
    newPet.intimacy = Math.min(100, newPet.intimacy + 5);
    newPet.lastInteractTime = Date.now();
    addExp(newPet, 8);
    savePet(newPet);

    // 简单的回复逻辑
    const responses = [
      '喵~ 我很开心！',
      '主人，我想和你玩！',
      '我饿了，给我点吃的吧~',
      '你是最好的主人！',
      '今天天气真好呀！'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }, [pet]);

  // 抚摸
  const pet_touch = useCallback(() => {
    const newPet = { ...pet };
    newPet.happiness = Math.min(100, newPet.happiness + 5);
    newPet.intimacy = Math.min(100, newPet.intimacy + 3);
    newPet.lastInteractTime = Date.now();
    addExp(newPet, 5);
    savePet(newPet);
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
      GrowthStage.PEAK
    ];
    const currentIndex = stages.indexOf(currentPet.stage);
    if (currentIndex < stages.length - 1) {
      currentPet.stage = stages[currentIndex + 1];
    }

    if (currentPet.stage === GrowthStage.PEAK && !currentPet.ultimateForm) {
      determineUltimateForm(currentPet);
    }
  };

  // 根据属性确定终极形态
  const determineUltimateForm = (currentPet: Pet) => {
    const attrs = currentPet.attributes;
    const maxAttr = Math.max(
      attrs.strength,
      attrs.intelligence,
      attrs.agility,
      attrs.spirit,
      attrs.charm
    );

    if (attrs.strength === maxAttr) {
      currentPet.ultimateForm = UltimateForm.DRAGON;
    } else if (attrs.intelligence === maxAttr) {
      currentPet.ultimateForm = UltimateForm.TAOTIE;
    } else if (attrs.agility === maxAttr) {
      currentPet.ultimateForm = UltimateForm.PHOENIX;
    } else if (attrs.spirit === maxAttr) {
      currentPet.ultimateForm = UltimateForm.ANGEL;
    } else {
      currentPet.ultimateForm = UltimateForm.QILIN;
    }
  };

  // 更新宠物状态
  const updatePetStatus = () => {
    const now = Date.now();
    const timePassed = (now - pet.lastInteractTime) / 1000 / 60;

    if (timePassed >= 10) {
      const newPet = { ...pet };
      newPet.hunger = Math.max(0, newPet.hunger - 5);
      newPet.happiness = Math.max(0, newPet.happiness - 3);
      newPet.lastInteractTime = now;
      savePet(newPet);
    }
  };

  return {
    pet,
    loading,
    feed,
    play,
    chat,
    pet_touch,
  };
};
