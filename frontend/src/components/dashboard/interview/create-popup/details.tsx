import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "@/services/api";
import { useInterviewers } from "@/contexts/interviewers.context";
import { InterviewBase, Question } from "@/types/interview";
import { ChevronRight, ChevronLeft, Info, Globe } from "lucide-react";
import Image from "next/image";
import { CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import FileUpload from "../fileUpload";
import Modal from "@/components/dashboard/Modal";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";
import { Interviewer } from "@/types/interviewer";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/languages";
import "@/styles/custom-select.css";
import { useInterviewStore } from "@/store/interview-store";

interface Props {
  open: boolean;
  setLoading: (loading: boolean) => void;
  interviewData: InterviewBase;
  setInterviewData: (interviewData: InterviewBase) => void;
  isUploaded: boolean;
  setIsUploaded: (isUploaded: boolean) => void;
  fileName: string;
  setFileName: (fileName: string) => void;
  selectedLanguage: LanguageCode | '';
  setSelectedLanguage: (language: LanguageCode | '') => void;
  outlineDebugLanguage: LanguageCode | '';
  setOutlineDebugLanguage: (language: LanguageCode | '') => void;
}

function DetailsPopup({
  open,
  setLoading,
  interviewData,
  setInterviewData,
  isUploaded,
  setIsUploaded,
  fileName,
  setFileName,
  selectedLanguage,
  setSelectedLanguage,
  outlineDebugLanguage,
  setOutlineDebugLanguage,
}: Props) {
  const { interviewers, interviewersLoading } = useInterviewers();
  const { setDraftQuestions } = useInterviewStore();
  
  // 状态变量声明
  const [isClicked, setIsClicked] = useState(false);
  const [openInterviewerDetails, setOpenInterviewerDetails] = useState(false);
  const [interviewerDetails, setInterviewerDetails] = useState<Interviewer>();

  const [name, setName] = useState(interviewData.name);
  const [selectedInterviewer, setSelectedInterviewer] = useState<bigint | number>(
    interviewData.interviewer_id,
  );
  // selectedLanguage 和 outlineDebugLanguage 现在从 props 传入
  const [researchType, setResearchType] = useState<'product' | 'market'>('product');
  const [showObjectiveTooltip, setShowObjectiveTooltip] = useState(false);
  const [showDocumentTooltip, setShowDocumentTooltip] = useState(false);
  const [showObjectiveExample, setShowObjectiveExample] = useState(false);
  const [showDocumentExample, setShowDocumentExample] = useState(false);

  // 实时检测是否为深度访谈模式（David 面试官）
  const selectedInterviewerData = interviewers.find(
    (interviewer) => Number(interviewer.id) === Number(selectedInterviewer)
  );
  const isDeepDiveMode = selectedInterviewerData?.name?.includes('David') || 
                         selectedInterviewerData?.name?.includes('Deep Dive');

  // 调试日志 - 移到状态变量声明之后
  console.warn('【interviewers】：>>>>>>>>>>>> details.tsx:41', {
    interviewers,
    interviewersLoading,
    count: interviewers?.length || 0,
    selectedInterviewer,
    selectedInterviewerType: typeof selectedInterviewer,
    timestamp: new Date().toLocaleTimeString()
  });
  
  // 如果有面试官但界面没显示，输出详细信息
  if (interviewers?.length > 0) {
    console.warn('【面试官数据详情】：>>>>>>>>>>>> details.tsx:48', 
      interviewers.map(i => ({ 
        id: i.id, 
        idType: typeof i.id,
        name: i.name, 
        image: i.image,
        isSelected: Number(selectedInterviewer) === Number(i.id)
      }))
    );
  }
  const [objective, setObjective] = useState(interviewData.objective);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    interviewData.is_anonymous,
  );
  const [numQuestions, setNumQuestions] = useState(
    interviewData.question_count == 0
      ? ""
      : String(interviewData.question_count),
  );
  const [duration, setDuration] = useState(interviewData.time_duration);
  const [uploadedDocumentContext, setUploadedDocumentContext] = useState("");
  const [customInstructions, setCustomInstructions] = useState(""); // 个性化备注

  // 滑动函数优化
  const slide = (id: string, value: number) => {
    const slider = document.getElementById(`${id}`);
    if (slider) {
      slider.scrollLeft = slider.scrollLeft + value;
    }
  };

  // 表单验证函数
  const isFormValid = () => {
    return (
      name.trim() !== "" &&
      objective.trim() !== "" &&
      Number(selectedInterviewer) > 0 &&
      selectedLanguage !== ""
    );
  };

  // ❌ 已删除：不再修改全局 agent 的语言配置
  // 现在每个 interview 创建时会有自己专属的 agent，语言在创建时设置

  const onGenrateQuestions = async () => {
    // 先设置本地loading状态，但不触发导航
    setIsClicked(true);

    try {
      const data = {
        name: name.trim(),
        objective: objective.trim(),
        number: numQuestions,
        context: uploadedDocumentContext,
        researchType: researchType,
        customInstructions: customInstructions.trim(), // 添加个性化备注
        language: selectedLanguage || undefined, // 访谈语言
        outline_debug_language: outlineDebugLanguage || undefined, // 大纲调试语言
      };

      // 使用组件顶部已定义的 isDeepDiveMode 和 selectedInterviewerData

      console.log('🚀 Generating ' + (isDeepDiveMode ? 'SESSIONS' : 'questions') + ' with data:', data);
      console.log('🔍 Selected interviewer:', selectedInterviewerData?.name);

      // 根据面试官类型调用不同的 API
      const apiEndpoint = isDeepDiveMode 
        ? "/generate-interview-sessions"  // David 使用 sessions
        : "/generate-interview-questions"; // Lisa/Bob 使用 questions

      // 生成问题需要调用 OpenAI，可能需要 60+ 秒，所以单独设置更长超时
      const generatedQuestions = (await apiClient.post(
        apiEndpoint,
        data,
        { timeout: 120000 } // 120秒超时，仅用于问题生成
      )) as any;

      console.log('✅ API response:', generatedQuestions.data);

      const generatedQuestionsResponse = JSON.parse(
        generatedQuestions.data.response,
      );

      console.log('✅ Parsed response:', generatedQuestionsResponse);
      console.log('📊 Questions array:', generatedQuestionsResponse.questions);
      console.log('📊 Questions array length:', generatedQuestionsResponse.questions?.length);
      console.log('📊 First question type:', typeof generatedQuestionsResponse.questions?.[0]);
      const firstQuestion = generatedQuestionsResponse.questions?.[0];
      const firstQuestionPreview = typeof firstQuestion === 'string' 
        ? firstQuestion.substring(0, 200) 
        : firstQuestion?.question?.substring(0, 200) || 'N/A';
      console.log('📊 First question preview:', firstQuestionPreview);

    // 将生成的问题映射为标准格式
    let updatedQuestions = generatedQuestionsResponse.questions.map(
      (question: Question | string, index: number) => {
        const questionText = typeof question === 'string' ? question.trim() : question.question.trim();
        console.log(`📝 Processing question/session ${index + 1}:`, {
          type: typeof question,
          length: questionText.length,
          preview: questionText.substring(0, 100)
        });
        return {
          id: uuidv4(),
          question: questionText,
          follow_up_count: 1,
        };
      },
    );

    console.log('✅ Updated questions array:', updatedQuestions);
    console.log('✅ Total questions/sessions:', updatedQuestions.length);

    const updatedInterviewData = {
      ...interviewData,
      name: name.trim(),
      objective: objective.trim(),
      questions: updatedQuestions,
      interviewer_id: BigInt(selectedInterviewer),
      question_count: updatedQuestions.length,  // 🔧 使用实际生成的数量，而不是用户请求的数量
      time_duration: duration,
      description: generatedQuestionsResponse.description,
      is_anonymous: isAnonymous,
      language: selectedLanguage || 'en-US',  // 🆕 添加语言字段
      context: uploadedDocumentContext,  // 🆕 保存上传的文档内容
      custom_instructions: customInstructions.trim(),  // 🆕 保存个性化备注
    };
    setInterviewData(updatedInterviewData);
    setDraftQuestions(updatedQuestions); // 同步到store的draftQuestions
    console.log('✅ Interview data updated successfully');
    console.log('✅ Updated interview data:', updatedInterviewData);
    
    // ✅ API调用成功完成，现在触发导航
    setIsClicked(false);
    setLoading(true);
  } catch (error) {
    console.error('❌ Error generating questions:', error);
    setIsClicked(false);
    // 不需要调用 setLoading，因为我们从未将它设为true
  }
};

  const onManual = () => {
    setLoading(true);

    // 手动创建时，根据设定的数量生成空白问题
    const requestedCount = Number(numQuestions);
    const manualQuestions = Array.from({ length: requestedCount }, () => ({
      id: uuidv4(),
      question: "",
      follow_up_count: 1,
    }));

    const updatedInterviewData = {
      ...interviewData,
      name: name.trim(),
      objective: objective.trim(),
      questions: manualQuestions,
      interviewer_id: BigInt(selectedInterviewer),
      question_count: requestedCount,
      time_duration: String(duration),
      description: "",
      is_anonymous: isAnonymous,
      language: selectedLanguage || 'en-US',  // 🆕 添加语言字段
    };
    setInterviewData(updatedInterviewData);
  };

  useEffect(() => {
    if (!open) {
      setName("");
      setSelectedInterviewer(0);
      setObjective("");
      setIsAnonymous(false);
      setNumQuestions("");
      setDuration("");
      setIsClicked(false);
    }
  }, [open]);

  return (
    <>
      <div className="w-full bg-transparent">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">定义调研</h1>
          <p className="text-sm text-gray-600">定义您的调研目标，选择访谈员，AI将根据您的输入信息生成访谈内容。</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">调研信息</h2>
          
          {/* Research Study Name */}
          <div className="form-control w-full">
            <label className="label pb-2">
              <span className="label-text text-sm font-medium text-gray-700">调研名称</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:border-blue-500 focus:outline-none transition-all"
              placeholder="例如：智能家居产品用户体验优化调研"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => setName(e.target.value.trim())}
            />
          </div>
          {/* Select Research Assistant */}
          <div className="form-control w-full">
            <label className="label pb-3">
              <span className="label-text text-sm font-medium text-gray-700 flex items-center gap-2">
                选择访谈员
                <div className="tooltip tooltip-right" data-tip="选择合适的AI访谈员">
                  <Info size={16} className="text-gray-400 hover:text-blue-600 cursor-pointer" />
                </div>
              </span>
            </label>
            <div className="grid grid-cols-3 gap-6">
            <div
              id="slider-3"
              className="contents"
            >
              {interviewersLoading ? (
                // 加载状态
                <div className="flex items-center justify-center h-full w-full">
                  <div className="flex space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse" />
                    <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse" />
                    <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse" />
                  </div>
                </div>
              ) : interviewers.length === 0 ? (
                // 空状态 - 添加创建面试官的按钮
                <div className="flex flex-col items-center justify-center h-full w-full text-gray-500">
                  <div className="text-center mb-4">
                    <p className="text-sm font-medium">No research assistants available</p>
                    <p className="text-xs mt-1">You need to create research assistants first</p>
                  </div>
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                    onClick={() => {
                      // 跳转到面试官页面
                      window.location.href = '/dashboard/interviewers';
                    }}
                  >
                    Create Research Assistants
                  </button>
                </div>
              ) : (
                // 正常显示面试官列表
                interviewers.map((item) => (
                <div
                  key={item.id}
                  className={`relative bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all rounded-lg border-2 p-6 ${
                      Number(selectedInterviewer) === Number(item.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      console.log('🚀 Selecting interviewer:', item.id, item.name);
                      const newInterviewerId = Number(item.id);
                      setSelectedInterviewer(newInterviewerId);
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="avatar">
                      <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-gray-200">
                    <Image
                      src={item.image}
                      alt={`Picture of ${item.name}`}
                          width={80}
                          height={80}
                      className="w-full h-full object-cover"
                      onError={() => {
                        console.error('❌ Failed to load image:', item.image);
                      }}
                      onLoad={() => {
                        console.log('✅ Image loaded successfully:', item.image);
                      }}
                    />
                  </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.name.includes('Lisa') ? '标准模式·平衡型' : 
                         item.name.includes('Bob') ? '快速模式·高效型' : 
                         '深度模式·探索型'}
                      </p>
                    </div>
                  </div>
                  <button
                    className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInterviewerDetails(item);
                      setOpenInterviewerDetails(true);
                    }}
                  >
                    <Info size={14} className="text-gray-400" />
                  </button>
                </div>
                ))
              )}
            </div>
              </div>
          </div>

          {/* Research Type */}
          <div className="form-control w-full">
            <label className="label pb-2">
              <span className="label-text text-sm font-medium text-gray-700 flex items-center gap-2">
                调研类型
                <div className="tooltip tooltip-right" data-tip="选择调研类型">
                  <Info size={16} className="text-gray-400 hover:text-blue-600 cursor-pointer" />
          </div>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  researchType === 'product'
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="researchType"
                  value="product"
                  checked={researchType === 'product'}
                  onChange={() => setResearchType('product')}
                  className="radio radio-primary radio-sm"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">产品调研</span>
              </label>
              <label className={`flex items-center cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  researchType === 'market'
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="researchType"
                  value="market"
                  checked={researchType === 'market'}
                  onChange={() => setResearchType('market')}
                  className="radio radio-primary radio-sm"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">市场调研</span>
              </label>
            </div>
          </div>
          {/* Research Objective */}
          <div className="form-control w-full">
            <label className="label pb-2">
              <span className="label-text text-sm font-medium text-gray-700 flex items-center gap-2">
                调研目的
              <div className="relative ml-1">
              <Info
                size={16}
                className="text-gray-400 hover:text-blue-600 cursor-pointer"
                onClick={() => setShowObjectiveTooltip(!showObjectiveTooltip)}
              />
              {showObjectiveTooltip && !showObjectiveExample && (
                <div className="absolute left-0 top-6 z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold text-gray-900">Required.</span>{' '}
                    {researchType === 'product'
                      ? "Describe your product and core research questions. Very recommended to include: product info, research background, core questions, decision needs, and expected outputs."
                      : "Describe the market opportunity and validation goals. Very recommended to include: business context, core questions to validate, target users, and success criteria."}
                  </p>
                  <button
                    className="text-xs text-indigo-600 hover:text-indigo-800 mt-2 underline"
                    onClick={() => {
                      setShowObjectiveExample(true);
                    }}
                  >
                    See Example
                  </button>
                </div>
              )}
              {showObjectiveExample && (
                <div className="absolute left-0 top-6 z-50 w-[520px] bg-white border border-gray-300 rounded-lg shadow-lg p-5 max-h-[520px] overflow-y-auto">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {researchType === 'product' ? 'Product Research Example' : 'Market Research Example'}
                    </h4>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        setShowObjectiveExample(false);
                        setShowObjectiveTooltip(false);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-xs text-gray-700 space-y-3 text-left">
                    {researchType === 'product'
                      ? (
                        <>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Product Info:</p>
                            <p>• Name: HealthTrack Pro</p>
                            <p>• Positioning: AI-powered personal health management platform</p>
                            <p>• Core Features: Symptom tracking, medication reminders, health insights, doctor appointment scheduling</p>
                            <p>• Target Users: Health-conscious adults (30-55) managing chronic conditions</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Research Background:</p>
                            <p>• Trigger: Version 2.0 launched 6 months ago with AI health insights feature</p>
                            <p>• Core Questions: Is the AI insights feature providing real value? What improvements would increase daily engagement? Should we prioritize telemedicine integration or wearable device sync?</p>
                            <p>• Decision Need: Define product roadmap for next 3 quarters</p>
                            <p>• Must Collect: Top 3 most valuable features, 3 biggest pain points, feature usage frequency</p>
                            <p>• Ideal Output: Prioritized feature backlog with user impact scores</p>
                          </div>
                        </>
                      )
                      : (
                        <>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Business Context:</p>
                            <p>• Domain: AI-powered personal finance management for young professionals</p>
                            <p>• Opportunity: Young professionals struggle with budgeting and investment decisions despite high income</p>
                            <p>• Strategic Goal: Validate market opportunity for an AI financial advisor targeting millennials and Gen Z</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Core Questions to Validate:</p>
                            <p>• Market Need: Do young professionals feel overwhelmed by financial decisions? What specific pain points exist?</p>
                            <p>• Solution Gap: What's missing in existing apps (Mint, YNAB, Robinhood)? Why aren't they sufficient?</p>
                            <p>• Product Direction: Would users prefer automated investing, personalized budgeting, or financial education?</p>
                            <p>• Commercial Viability: Willingness to pay for AI-powered financial advice? Acceptable pricing?</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Target Users:</p>
                            <p>• Core: Young professionals (25-35) in tech/finance industries, earning $60k-120k annually</p>
                            <p>• Geography: Major US cities (SF, NYC, Seattle, Austin)</p>
                            <p>• Characteristics: Tech-savvy, career-focused, limited financial literacy</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Success Criteria:</p>
                            <p>• Decision: Go/No-Go on building MVP</p>
                            <p>• Ideal Output: Validate 3 core pain points, identify 2 must-have features, confirm $10-30/month pricing viability</p>
                            <p>• Must Collect: Current financial management habits, app usage patterns, top 3 financial stressors, willingness to share financial data with AI</p>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              )}
            </div>
              </span>
            </label>
          <Textarea
            value={objective}
              className="h-48 border-2 border-gray-300 w-full rounded-lg focus:border-blue-500 focus:outline-none transition-all resize-none bg-white"
            placeholder={researchType === 'product'
                ? "产品信息：\n- 产品名称：[产品名称]\n- 定位：[一句话产品定位]\n- 核心功能：[3-5个核心功能]\n- 目标用户：[主要用户群体]\n\n调研背景：\n- 触发点：[为什么要做这次调研]\n- 核心问题：[1-3个需要解决的核心问题]\n- 决策需求：[调研结果将支持什么决策]\n- 必须收集：[必需的数据点]\n- 理想输出：[期望的调研成果]"
                : "商业背景：\n- 领域：[业务领域]\n- 机会：[市场机会假设]\n- 战略目标：[战略目标]\n\n需要验证的核心问题：\n- 市场需求：[真实痛点？]\n- 解决方案缺口：[现有方案缺失什么？]\n- 产品方向：[用户期望？]\n- 商业可行性：[付费意愿？]\n\n目标用户：\n- 核心：[主要用户细分]\n- 地理范围：[地理范围]\n- 特征：[用户特征]\n\n成功标准：\n- 决策：[需要做出的关键决策]\n- 理想输出：[期望的验证结果]\n- 必须收集：[必需的数据点]"}
            onChange={(e) => setObjective(e.target.value)}
            onBlur={(e) => setObjective(e.target.value.trim())}
          />
          </div>

          {/* Additional Documents */}
          <div className="form-control w-full">
            <label className="label pb-2">
              <span className="label-text text-sm font-medium text-gray-700 flex items-center gap-2">
                上传背景资料（可选）
                <div className="relative ml-1">
              <Info
                size={16}
                className="text-indigo-600 cursor-pointer hover:text-indigo-800"
                onClick={() => setShowDocumentTooltip(!showDocumentTooltip)}
              />
              {showDocumentTooltip && !showDocumentExample && (
                <div className="absolute left-0 top-6 z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                  <p className="text-xs text-gray-700">
                    {researchType === 'product'
                      ? "Upload detailed product documentation, PRDs, feature specs, user feedback reports, or version release notes or anything related to provide additional context."
                      : "Upload market research reports, competitor analysis, user survey data, industry reports, or business plans or anything related to provide additional context."}
                  </p>
                  <button
                    className="text-xs text-indigo-600 hover:text-indigo-800 mt-2 underline"
                    onClick={() => {
                      setShowDocumentExample(true);
                    }}
                  >
                    See Example
                  </button>
                </div>
              )}
              {showDocumentExample && (
                <div className="absolute left-0 top-6 z-50 w-[520px] h-[520px] bg-white border border-gray-300 rounded-lg shadow-lg p-5 overflow-y-auto">
                  {/* Close button */}
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setShowDocumentExample(false);
                      setShowDocumentTooltip(false);
                    }}
                  >
                    ✕
                  </button>

                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    {researchType === 'product' ? 'Product Documentation Examples' : 'Market Research Documentation Examples'}
                  </h4>
                  <div className="text-xs text-gray-700 space-y-3 text-left">
                    {researchType === 'product' ? (
                      <>
                        <div>
                          <div className="font-semibold">• Product Requirements Document (PRD)</div>
                          <div>Detailed feature specifications, user stories, acceptance criteria</div>
                        </div>
                        <div>
                          <div className="font-semibold">• Feature Specifications</div>
                          <div>Technical specs, design mockups, interaction flows</div>
                        </div>
                        <div>
                          <div className="font-semibold">• User Feedback Reports</div>
                          <div>Support tickets, user reviews, NPS survey results</div>
                        </div>
                        <div>
                          <div className="font-semibold">• Version Release Notes</div>
                          <div>Changelog, new features, bug fixes, known issues</div>
                        </div>
                        <div>
                          <div className="font-semibold">• Analytics Reports</div>
                          <div>Usage metrics, feature adoption rates, user behavior data</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="font-semibold">• Market Research Reports</div>
                          <div>Industry trends, market size, growth projections</div>
                        </div>
                        <div>
                          <div className="font-semibold">• Competitor Analysis</div>
                          <div>Competitive landscape, feature comparison, pricing analysis</div>
                        </div>
                        <div>
                          <div className="font-semibold">• User Survey Data</div>
                          <div>Survey results, user interviews, focus group findings</div>
                        </div>
                        <div>
                          <div className="font-semibold">• Industry Reports</div>
                          <div>Third-party research, analyst reports, white papers</div>
                        </div>
                        <div>
                          <div className="font-semibold">• Business Plans</div>
                          <div>Go-to-market strategy, business model, revenue projections</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
              </span>
            </label>
          <FileUpload
            isUploaded={isUploaded}
            setIsUploaded={setIsUploaded}
            fileName={fileName}
            setFileName={setFileName}
            setUploadedDocumentContext={setUploadedDocumentContext}
          />
          </div>

          {/* 个性化备注输入框 */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">Custom Instructions:</span>
              <div className="relative">
                <Info
                  size={16}
                  className="text-indigo-600 cursor-pointer hover:text-indigo-800"
                  onClick={() => {
                    const tooltip = document.getElementById('custom-instructions-tooltip');
                    if (tooltip) {
                      tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                />
                <div
                  id="custom-instructions-tooltip"
                  className="absolute left-0 top-6 z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-3"
                  style={{ display: 'none' }}
                >
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold text-gray-900">Optional.</span>{' '}
                    Add any special instructions for generating the interview guide. For example: "Use simple language suitable for elderly participants" or "Focus on emotional responses rather than technical details" or "Keep questions very brief and direct."
                  </p>
                </div>
              </div>
            </label>
            <Textarea
              value={customInstructions}
              className="h-16 mt-2 border-2 border-gray-300 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              placeholder="Example: 'My interviews target elderly users, please use very simple and clear language' or 'Focus on emotional experiences rather than technical features'"
              onChange={(e) => setCustomInstructions(e.target.value)}
              onBlur={(e) => setCustomInstructions(e.target.value.trim())}
            />
          </div>

          {/* Interview Language */}
          <div className="form-control w-full">
            <label className="label pb-2">
              <span className="label-text text-sm font-medium text-gray-700 flex items-center gap-2">
                <Globe size={16} className="text-blue-600" />
                访谈语言
              </span>
            </label>
            <select
              className="custom-select w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:border-blue-500 focus:outline-none transition-all cursor-pointer text-gray-900"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25em 1.25em',
                paddingRight: '2.5rem',
              }}
            >
              <option value="">选择访谈语言</option>
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, langConfig]) => (
                <option key={code} value={code}>
                  {langConfig.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-500 mt-2">
              选择与受访者进行访谈的语言
            </span>
          </div>

          {/* Anonymous Switch */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text font-semibold text-gray-700">
                Do you prefer the participants&apos; responses to be anonymous?
              </span>
              <Switch
                checked={isAnonymous}
                className={`ml-4 ${
                  isAnonymous ? "bg-blue-600" : "bg-gray-300"
                }`}
                onCheckedChange={(checked) => setIsAnonymous(checked)}
              />
            </label>
            <span className="text-xs text-gray-500 italic mt-1">
              Note: If not anonymous, the participant&apos;s email and name will be collected.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row w-full justify-center items-center gap-4 pt-6 mt-6 border-t border-gray-200">
            <Button
              disabled={!isFormValid()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed h-12 text-base shadow-sm"
              onClick={() => {
                // 保存基本信息到store，包括访谈语言和研究类型
                const updatedInterviewData: any = {
                  ...interviewData,
                  name: name.trim(),
                  objective: objective.trim(),
                  interviewer_id: BigInt(selectedInterviewer),
                  is_anonymous: isAnonymous,
                  language: selectedLanguage || 'zh-CN', // 保存访谈语言
                  researchType: researchType, // 保存研究类型（product/market）
                };
                setInterviewData(updatedInterviewData);
                setSelectedLanguage(selectedLanguage || 'zh-CN'); // 同步到store
                // 标记第一步完成并导航
                setLoading(true);
              }}
            >
              下一步 →
            </Button>
          </div>
        </div>
      </div>
      <Modal
        open={openInterviewerDetails}
        closeOnOutsideClick={true}
        onClose={() => {
          setOpenInterviewerDetails(false);
        }}
      >
        <InterviewerDetailsModal interviewer={interviewerDetails} />
      </Modal>
    </>
  );
}

export default DetailsPopup;
