# UI改进方案 - 访谈类型选择功能

## 📅 创建时间
2025-10-19

## 🎯 改进目标
在访谈创建UI中添加访谈类型选择功能，支持产品调研和需求调研两种类型，并提供相应的输入指导。

---

## 📊 当前UI分析

### 现有UI结构
```
1. Research Study Name (访谈名称输入)
2. Select a Research Assistant (选择面试官)
3. Interview Language (访谈语言选择)
4. Research Objective (调研目标输入) ← 需要在这里添加类型选择
5. Upload documents (文档上传)
6. Anonymous preference (匿名选项)
7. Number of Questions & Duration (问题数量和时长)
8. Generate Questions / I'll do it myself (生成按钮)
```

### 关键组件
- **文件位置**: `frontend/src/components/dashboard/interview/create-popup/details.tsx`
- **主要状态**:
  - `name`: 访谈名称
  - `selectedInterviewer`: 选择的面试官
  - `selectedLanguage`: 访谈语言
  - `objective`: 调研目标
  - `numQuestions`: 问题数量
  - `duration`: 时长

---

## 🎨 UI改进设计

### 1. 访谈类型选择器

#### 位置
- 在 "Interview Language" 之后，"Research Objective" 之前
- 保持与其他选项的视觉一致性

#### 样式设计
```tsx
<div className="flex flex-row justify-between items-center w-[33.2rem] mt-3">
  <h3 className="text-sm font-medium">Research Type:</h3>
  <div className="flex gap-3">
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        researchType === 'product'
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      onClick={() => setResearchType('product')}
    >
      Product Research
    </button>
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        researchType === 'market'
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      onClick={() => setResearchType('market')}
    >
      Market Research
    </button>
  </div>
</div>
```

### 2. 动态Placeholder

#### 产品调研Placeholder
```
e.g. 
调研类型: 产品调研 [新版本改进调研-新旧版本变化]

产品基本信息:
- 产品名称: TaskMaster
- 产品定位: 面向团队的智能任务管理工具
- 核心功能: 任务分配、进度跟踪、团队协作
- 目标用户: 中小企业团队管理者

调研触发背景与核心任务:
- 触发原因: 新版本上线3个月，需要验证功能价值
- 核心问题: 哪些新功能最有价值？用户愿意为哪些功能付费？
- 决策需求: 制定未来2-3个版本的功能路线图
- 必需收集项: 产品的三个亮点和三个最不满意的点
- 理想产出: 3个必做优化点，3个选做优化点
```

#### 需求调研Placeholder
```
e.g.
调研类型: 需求调研 [市场机会探索]

业务背景与机会:
- 业务领域: AI闲暇消费助手
- 机会假设: 年轻人选择困难，信息过载，决策疲劳
- 战略目标: 验证市场机会，探索产品方向

核心待验证问题:
- 市场需求真实性: 用户在闲暇消费决策中的核心痛点？
- 解决方案空白: 现有工具（小红书、大众点评）的不足？
- 产品方向选择: 对AI推荐的期待和信任度？
- 商业可行性: 愿意为个性化推荐付费吗？

目标用户群体:
- 核心用户: 一线城市年轻白领（25-35岁）
- 地域范围: 北上广深
- 用户特征: 有一定消费能力，追求生活品质

调研成功标准:
- 核心决策: 是否进入该市场
- 理想产出: 验证3个需求假设，发现2个新机会
- 必需收集项: 痛点真实性、AI接受度、付费意愿
```

### 3. Input Best Practice按钮

#### 位置与样式
```tsx
<div className="flex flex-row justify-between items-center mt-3">
  <div className="flex items-center gap-2">
    <h3 className="text-sm font-medium">Research Objective:</h3>
    <button
      onClick={() => setShowBestPractice(true)}
      className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center gap-1"
    >
      <Info size={14} />
      Input Best Practice
    </button>
  </div>
</div>
```

#### Best Practice弹窗内容

**产品调研Best Practice**:
```markdown
# 产品调研输入最佳实践

## 必需输入项

### 产品基本信息
- 产品名称: [产品名称]
- 产品定位: [一句话描述产品定位]
- 核心功能: [3-5个核心功能简述]
- 目标用户: [主要用户群体描述]

### 调研触发背景与核心任务
- 触发原因: [为什么要进行这次调研]
- 核心问题: [希望通过调研解决的1-3个核心问题]
- 决策需求: [调研结果将用于什么决策]
- 必需收集项: [调研必须从用户处获取的数据点]
- 理想产出: [总结调研后的最终理想产出]

## 可选输入项
- 原始产品文档: [PRD、功能说明等]
- 竞品信息线索: [已知的竞品名称]
- 历史调研数据: [之前的用户反馈]
- 特殊要求: [对本次调研的特殊要求]

## 示例
调研类型: 产品调研 [新版本改进调研-功能排序]

产品基本信息:
- 产品名称: TaskMaster
- 产品定位: 面向团队的智能任务管理工具
- 核心功能: 任务分配、进度跟踪、团队协作、数据分析
- 目标用户: 中小企业团队管理者和成员

调研触发背景与核心任务:
- 触发原因: 新版本上线3个月，需要验证功能价值和优化方向
- 核心问题: 哪些新功能最有价值？用户愿意为哪些功能付费？
- 决策需求: 制定未来2-3个版本的功能路线图
- 必需收集项: 新功能使用频率、满意度评分、付费意愿
- 理想产出: 6个可执行优化点（3个必做，3个选做）
```

**需求调研Best Practice**:
```markdown
# 需求调研输入最佳实践

## 必需输入项

### 业务背景与机会
- 业务领域: [目标进入的业务领域]
- 机会假设: [为什么认为这个领域有机会]
- 战略目标: [希望通过这个领域实现什么]

### 核心待验证问题
- 市场需求真实性: [用户需求是否真实存在且足够强烈]
- 解决方案空白: [现有解决方案的核心痛点]
- 产品方向选择: [应该做什么样的产品]
- 商业可行性: [用户的付费意愿]

### 目标用户群体
- 核心用户: [最有可能成为目标用户的群体]
- 地域范围: [目标市场的地理范围]
- 用户特征: [年龄、职业、需求场景]

### 调研成功标准
- 核心决策: [调研结果将用于做什么决策]
- 理想产出: [希望从调研中得到什么结论]
- 必需收集项: [必须从用户处获取的信息]

## 可选输入项
- 已知竞品线索: [已知的竞品名称]
- 历史相关数据: [之前的用户反馈]
- 资源约束: [时间、预算限制]
- 特殊要求: [对本次调研的特殊要求]

## 示例
调研类型: 需求调研 [市场机会探索]

业务背景与机会:
- 业务领域: AI闲暇消费助手
- 机会假设: 年轻人选择困难，信息过载，决策疲劳
- 战略目标: 验证市场机会，探索产品方向

核心待验证问题:
- 市场需求真实性: 用户在闲暇消费决策中的核心痛点？
- 解决方案空白: 现有工具的不足？
- 产品方向选择: 对AI推荐的期待？
- 商业可行性: 付费意愿如何？

目标用户群体:
- 核心用户: 一线城市年轻白领（25-35岁）
- 地域范围: 北上广深
- 用户特征: 有消费能力，追求生活品质

调研成功标准:
- 核心决策: 是否进入该市场
- 理想产出: 验证3个需求假设，发现2个新机会
- 必需收集项: 痛点真实性、AI接受度、付费意愿
```

---

## 🔧 技术实现要点

### 新增状态
```tsx
const [researchType, setResearchType] = useState<'product' | 'market'>('product');
const [showBestPractice, setShowBestPractice] = useState(false);
```

### Placeholder逻辑
```tsx
const getPlaceholder = () => {
  if (researchType === 'product') {
    return `e.g. 
调研类型: 产品调研 [新版本改进调研-新旧版本变化]

产品基本信息:
- 产品名称: TaskMaster
- 产品定位: 面向团队的智能任务管理工具
...`;
  } else {
    return `e.g.
调研类型: 需求调研 [市场机会探索]

业务背景与机会:
- 业务领域: AI闲暇消费助手
...`;
  }
};
```

### API调用修改
```tsx
const onGenrateQuestions = async () => {
  setLoading(true);
  
  try {
    const data = {
      name: name.trim(),
      objective: objective.trim(),
      number: numQuestions,
      context: uploadedDocumentContext,
      researchType: researchType, // 新增字段
    };
    
    // 根据面试官类型和调研类型调用不同的API
    const isDeepDiveMode = selectedInterviewerData?.name?.includes('David');
    
    if (isDeepDiveMode) {
      // David使用sessions API，需要根据researchType选择不同的prompt
      const apiEndpoint = "/generate-interview-sessions";
      // 后端会根据researchType参数选择对应的prompt
    } else {
      // Lisa/Bob使用questions API
      const apiEndpoint = "/generate-interview-questions";
    }
    
    // ... 其余逻辑
  } catch (error) {
    console.error('Error:', error);
    setLoading(false);
  }
};
```

---

## 📋 实现步骤

### Phase 1: UI组件修改
1. 添加访谈类型选择器
2. 实现动态placeholder
3. 添加Best Practice按钮和弹窗

### Phase 2: 后端API调整
1. 修改API接口，接收researchType参数
2. 根据researchType选择对应的prompt
3. 确保输入输出字段对齐

### Phase 3: 测试验证
1. 测试UI交互
2. 测试API调用
3. 验证生成的大纲格式

---

## ✅ 验收标准

1. **UI功能**:
   - ✅ 访谈类型选择器正常工作
   - ✅ Placeholder根据类型动态切换
   - ✅ Best Practice按钮可点击，弹窗显示正确内容

2. **后端逻辑**:
   - ✅ API正确接收researchType参数
   - ✅ 根据类型调用正确的prompt
   - ✅ 返回的数据格式符合预期

3. **用户体验**:
   - ✅ 操作流程流畅自然
   - ✅ 提示信息清晰易懂
   - ✅ 错误处理完善

---

## 📝 注意事项

1. **保持向后兼容**: 确保现有功能不受影响
2. **样式一致性**: 新增组件与现有UI风格保持一致
3. **响应式设计**: 确保在不同屏幕尺寸下正常显示
4. **错误处理**: 添加适当的错误提示和边界情况处理
5. **性能优化**: 避免不必要的重渲染

---

## 🔗 相关文件

- UI组件: `frontend/src/components/dashboard/interview/create-popup/details.tsx`
- 后端Prompt:
  - `backend/src/lib/prompts/generate-product-research-sessions.ts`
  - `backend/src/lib/prompts/generate-market-research-sessions.ts`
- 参考素材:
  - `8.21-9.21双盲_副本/通用AI访谈模板/素材0-产品调研.txt`
  - `8.21-9.21双盲_副本/通用AI访谈模板/素材0-需求调研.txt`

