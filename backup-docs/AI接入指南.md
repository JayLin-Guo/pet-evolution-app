# AI 语音对话接入指南

## 概述
本文档说明如何为虚拟宠物 App 接入 AI 语音对话功能。

## 推荐方案

### 方案一：讯飞星火（推荐国内使用）
**优势：**
- 中文支持优秀
- 语音识别准确
- 响应速度快
- 有免费额度

**接入步骤：**
1. 注册讯飞开放平台账号：https://www.xfyun.cn/
2. 创建应用，获取 APPID、APIKey、APISecret
3. 集成 SDK 或使用 WebAPI

### 方案二：百度智能云
**优势：**
- 生态完善
- 文档详细
- 价格合理

**接入步骤：**
1. 注册百度智能云：https://cloud.baidu.com/
2. 开通语音识别、语音合成、文心一言服务
3. 获取 API Key 和 Secret Key

### 方案三：OpenAI（国际方案）
**优势：**
- 对话质量高
- 功能强大

**注意：**
- 需要国际网络
- 费用较高

## 代码实现示例

### 1. 创建 AI 服务接口

```typescript
// entry/src/main/ets/services/AIService.ets
export interface AIService {
  // 语音识别
  speechToText(audioData: ArrayBuffer): Promise<string>;
  
  // 对话生成
  chat(message: string, context?: string): Promise<string>;
  
  // 语音合成
  textToSpeech(text: string): Promise<ArrayBuffer>;
}
```

### 2. 实现讯飞星火服务

```typescript
// entry/src/main/ets/services/XunfeiAIService.ets
import http from '@ohos.net.http';

export class XunfeiAIService implements AIService {
  private appId: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(appId: string, apiKey: string, apiSecret: string) {
    this.appId = appId;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async speechToText(audioData: ArrayBuffer): Promise<string> {
    // 实现语音识别
    // 调用讯飞语音识别 API
    return "识别的文本";
  }

  async chat(message: string, context?: string): Promise<string> {
    // 实现对话
    // 调用讯飞星火认知大模型 API
    const prompt = this.buildPetPrompt(message, context);
    // 发送请求...
    return "AI 回复";
  }

  async textToSpeech(text: string): Promise<ArrayBuffer> {
    // 实现语音合成
    // 调用讯飞语音合成 API
    return new ArrayBuffer(0);
  }

  private buildPetPrompt(message: string, context?: string): string {
    return `你是一只可爱的虚拟宠物，正在和主人聊天。
主人说：${message}
请用可爱、活泼的语气回复主人。`;
  }
}
```

### 3. 集成到 ViewModel

```typescript
// 在 PetViewModel.ets 中
import { AIService } from '../services/AIService';
import { XunfeiAIService } from '../services/XunfeiAIService';

export class PetViewModel {
  private aiService: AIService | null = null;

  initAI(appId: string, apiKey: string, apiSecret: string) {
    this.aiService = new XunfeiAIService(appId, apiKey, apiSecret);
  }

  async chatWithPetAI(message: string): Promise<string> {
    if (!this.aiService) {
      return this.generateResponse(message); // 降级到简单回复
    }

    try {
      const response = await this.aiService.chat(message, this.buildContext());
      this.pet.chat();
      this.pet.addExp(8);
      this.savePet();
      return response;
    } catch (error) {
      console.error('AI 调用失败:', error);
      return this.generateResponse(message);
    }
  }

  private buildContext(): string {
    // 构建宠物上下文信息
    return `宠物名字：${this.pet.name}
成长阶段：${this.pet.getStageName()}
等级：${this.pet.level}
心情：${this.pet.happiness > 80 ? '很开心' : this.pet.happiness > 50 ? '还不错' : '有点不开心'}
饥饿度：${this.pet.hunger}`;
  }
}
```

## 配置管理

### 创建配置文件
```typescript
// entry/src/main/ets/config/AIConfig.ets
export class AIConfig {
  // 请替换为你的实际密钥
  static readonly XUNFEI_APP_ID = 'your_app_id';
  static readonly XUNFEI_API_KEY = 'your_api_key';
  static readonly XUNFEI_API_SECRET = 'your_api_secret';
}
```

**注意：** 生产环境中应该使用安全的方式存储密钥，不要硬编码在代码中。

## 权限配置

在 `entry/src/main/module.json5` 中添加必要权限：

```json
{
  "module": {
    "requestPermissions": [
      {
        "name": "ohos.permission.INTERNET"
      },
      {
        "name": "ohos.permission.MICROPHONE",
        "reason": "$string:microphone_reason",
        "usedScene": {
          "abilities": ["EntryAbility"],
          "when": "inuse"
        }
      }
    ]
  }
}
```

## 优化建议

### 1. 缓存机制
- 缓存常见问题的回复
- 减少 API 调用次数

### 2. 离线降级
- 准备离线回复库
- API 失败时使用本地回复

### 3. 个性化
- 根据宠物属性调整对话风格
- 记录对话历史，让对话更连贯

### 4. 成本控制
- 设置每日调用上限
- 使用免费额度
- 考虑本地小模型

## 测试建议

1. 先使用模拟数据测试 UI 流程
2. 接入 API 后测试基本对话
3. 测试异常情况（网络失败、超时等）
4. 测试语音识别准确度
5. 测试语音合成质量

## 后续优化

- 支持多轮对话
- 情感分析
- 根据对话内容影响宠物属性
- 宠物主动发起对话
- 语音唤醒功能
