# 数据库表设计文档

## 表结构说明

### 1. users - 用户表

存储用户基本信息，支持手机号注册和token认证。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| phone | VARCHAR(11) | 手机号，唯一索引 |
| token | VARCHAR(255) | 认证token |
| token_expires_at | DATETIME | token过期时间（30天） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

**索引：**
- `idx_phone` (UNIQUE) - 手机号唯一索引
- `idx_token` - token索引

### 2. pet_eggs - 宠物蛋资源表

存储所有可抽取的宠物蛋资源，对应nginx static中的资源文件。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| name | VARCHAR(100) | 宠物蛋名称 |
| description | TEXT | 描述 |
| quality | ENUM | 品质：normal/premium/legendary |
| resource_path | VARCHAR(500) | 资源路径（对应nginx static路径） |
| spine_path | VARCHAR(500) | Spine动画资源路径 |
| initial_stage | VARCHAR(50) | 初始阶段（精品直接进入child阶段） |
| draw_probability | DECIMAL(5,2) | 抽取概率（0-100） |
| growth_config | JSON | 成长配置（存储各阶段的成长时间等） |
| is_active | BOOLEAN | 是否启用 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

**索引：**
- `idx_quality` - 品质索引
- `idx_is_active` - 启用状态索引

### 3. pets - 宠物表

存储用户领取并命名后的宠物信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| user_id | INT | 用户ID，外键关联users |
| pet_egg_id | INT | 宠物蛋ID，外键关联pet_eggs |
| name | VARCHAR(50) | 宠物名称 |
| quality | ENUM | 品质（冗余字段） |
| stage | ENUM | 当前成长阶段：baby/child/teen/adult/prime/peak |
| sub_stage | INT | 当前子阶段（1-3） |
| level | INT | 等级 |
| exp | INT | 经验值（初始0） |
| hunger | INT | 饥饿值（0-10，初始10） |
| happiness | INT | 快乐值（0-10，初始10） |
| health | INT | 健康值（0-10，初始10） |
| intimacy | INT | 亲密度（0-100） |
| ultimate_form | ENUM | 终极形态（仅在PEAK阶段有效） |
| last_hunger_decrease_at | DATETIME | 上次饥饿值减少时间 |
| last_happiness_decrease_at | DATETIME | 上次快乐值减少时间 |
| last_exp_increase_at | DATETIME | 上次经验值增长时间 |
| last_feed_at | DATETIME | 上次喂食时间（8小时冷却） |
| last_play_at | DATETIME | 上次玩耍时间（8小时冷却） |
| last_touch_at | DATETIME | 上次抚摸时间（8小时冷却） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

**索引：**
- `idx_user_id` - 用户ID索引
- `idx_pet_egg_id` - 宠物蛋ID索引
- `idx_stage` - 阶段索引

### 4. chat_messages - 聊天记录表

存储用户与宠物的对话记录，保留一周。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| pet_id | INT | 宠物ID，外键关联pets |
| user_id | INT | 用户ID，外键关联users |
| sender | ENUM | 发送者类型：user/pet |
| message | TEXT | 消息内容 |
| created_at | DATETIME | 创建时间 |

**索引：**
- `idx_pet_id` - 宠物ID索引
- `idx_user_id` - 用户ID索引
- `idx_created_at` - 创建时间索引（用于清理）

### 5. pet_actions - 操作记录表

记录宠物的操作历史，用于统计和调试。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| pet_id | INT | 宠物ID，外键关联pets |
| action_type | ENUM | 操作类型：feed/play/touch |
| action_value | INT | 操作增加值（通常为3） |
| before_hunger | INT | 操作前饥饿值 |
| after_hunger | INT | 操作后饥饿值 |
| before_happiness | INT | 操作前快乐值 |
| after_happiness | INT | 操作后快乐值 |
| before_health | INT | 操作前健康值 |
| after_health | INT | 操作后健康值 |
| created_at | DATETIME | 创建时间 |

**索引：**
- `idx_pet_id` - 宠物ID索引
- `idx_action_type` - 操作类型索引
- `idx_created_at` - 创建时间索引

## 业务规则

### 属性变化规则

1. **饥饿值（hunger）**
   - 初始值：10
   - 喂食操作：+3（上限10，8小时冷却）
   - 自动减少：每3小时-1（当饥饿值>0时），直到0

2. **快乐值（happiness）**
   - 初始值：10
   - 抚摸操作：+3（上限10，8小时冷却）
   - 自动减少：当饥饿<7时，每2小时-1，直到0

3. **健康值（health）**
   - 初始值：10
   - 玩耍操作：+3（上限10，8小时冷却）
   - 自动减少：当饥饿<5时，健康值 = 10 - (5 - 饥饿值)，最低为1（濒死状态）
   - 当健康值<=3时，显示忠诚度下降百分比

4. **经验值（exp）**
   - 初始值：0
   - 手动操作：喂食/玩耍/抚摸每次+3经验
   - 自动增长：每3小时检查一次
     - 饥饿>=9：+2经验
     - 饥饿>=7且<9：+1经验
     - 饥饿<7：不增长

### 操作冷却时间

- 喂食、玩耍、抚摸：每种操作独立计算8小时冷却时间
- 未到冷却时间时提示："主人，你精力好旺盛"

### 定时任务

1. **宠物状态更新**：每10分钟执行一次
   - 更新所有宠物的饥饿、快乐、健康、经验值

2. **聊天记录清理**：每天凌晨2点执行
   - 清理一周前的聊天记录

## 注意事项

1. 精品品质的宠物蛋孵化后直接进入"child"（成长期）阶段
2. 健康值=1时为濒死状态，需要特殊处理
3. 健康值<=3时显示忠诚度下降百分比（通过计算得出：忠诚度 = (健康值/10) * 100）
4. Token过期时间设置为30天，可根据需要调整

