# 任务清单 - 访谈类型UI改进

## 📅 创建时间
2025-10-19

## 🎯 总体目标
为Foloup访谈创建UI添加访谈类型选择功能，支持产品调研和需求调研两种类型，并调整后端大纲生成逻辑。

---

## 📋 任务列表

### Phase 1: 需求分析和规划
- [x] 1.1 分析当前UI结构
- [x] 1.2 查看参考素材（产品调研和需求调研）
- [x] 1.3 设计UI改进方案
- [x] 1.4 确认输入输出字段对齐

### Phase 2: UI改进
- [x] 2.1 添加访谈类型选择按钮
- [x] 2.2 添加动态placeholder提示
- [ ] 2.3 添加"Input Best Practice"按钮（可选）
- [ ] 2.4 实现Best Practice弹窗/提示（可选）

### Phase 3: 后端逻辑调整
- [x] 3.1 修改API接口，支持访谈类型参数
- [x] 3.2 根据类型调用不同的prompt
- [x] 3.3 验证输入输出字段对齐
- [ ] 3.4 测试两种类型的大纲生成

### Phase 4: 测试和文档
- [ ] 4.1 本地测试UI交互
- [ ] 4.2 测试后端API调用
- [ ] 4.3 更新项目文档
- [ ] 4.4 提交代码

---

## 📝 详细说明

### 1. UI改进需求

#### 1.1 访谈类型选择
- 位置：Research Assistant选择之后
- 样式：两个按钮/单选框
  - 产品调研 (Product Research)
  - 需求调研 (Market Research)

#### 1.2 动态Placeholder
- 根据选择的类型，Research Objective输入框显示不同的placeholder
- 样式：灰色虚幻字体（类似现有的placeholder）

#### 1.3 Input Best Practice按钮
- 位置：Research Objective输入框旁边
- 功能：点击后显示推荐的输入格式
- 内容来源：
  - 产品调研：`8.21-9.21双盲_副本/通用AI访谈模板/素材0-产品调研.txt`
  - 需求调研：`8.21-9.21双盲_副本/通用AI访谈模板/素材0-需求调研.txt`

### 2. 后端逻辑调整

#### 2.1 API修改
- 接口：`/api/questions/generate-sessions`（或类似）
- 新增参数：`researchType: 'product' | 'market'`

#### 2.2 Prompt选择
- `researchType === 'product'` → 使用 `generate-product-research-sessions.ts`
- `researchType === 'market'` → 使用 `generate-market-research-sessions.ts`

#### 2.3 字段对齐
- 输入字段：
  - `name`: 访谈名称
  - `objective`: 调研目标
  - `number`: 问题数量
  - `context`: 上下文（可选）
  - `researchType`: 访谈类型（新增）

- 输出字段：
  - 确保两个prompt返回相同的数据结构
  - 符合Retell AI的Multi-Prompt Agent格式

---

## 🔍 当前状态
- [x] 环境变量配置完成
- [x] 依赖安装完成
- [x] 需求分析和规划完成
- [x] 字段对齐验证完成
- [ ] UI改进进行中
- [ ] 后端逻辑调整待开始

---

## 📌 注意事项
1. 确保不破坏现有功能
2. 保持代码风格一致
3. 输入输出字段必须对齐
4. Prompt内容可以后续调试，但字段结构必须正确
5. 所有修改需要本地测试通过

---

## 📚 相关文件
- UI组件：`frontend/src/components/dashboard/interview/create-popup/details.tsx`
- 后端Prompt：
  - `backend/src/lib/prompts/generate-product-research-sessions.ts`
  - `backend/src/lib/prompts/generate-market-research-sessions.ts`
- 参考素材：
  - `8.21-9.21双盲_副本/通用AI访谈模板/素材0-产品调研.txt`
  - `8.21-9.21双盲_副本/通用AI访谈模板/素材0-需求调研.txt`

