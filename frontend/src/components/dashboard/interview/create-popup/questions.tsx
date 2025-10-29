import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "@/services/api";
import { useClerk, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { InterviewBase, Question } from "@/types/interview";
import { useInterviews } from "@/contexts/interviews.context";
import { useInterviewers } from "@/contexts/interviewers.context";
import { useInterviewStore } from "@/store/interview-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionCard from "@/components/dashboard/interview/create-popup/questionCard";
import { Button } from "@/components/ui/button";
import { Plus, Globe, Info, Settings } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import "@/styles/custom-select.css";
import { LanguageCode, SUPPORTED_LANGUAGES } from "@/lib/languages";
import { InterviewService } from "@/services/interviews.service";
import { OutlineService } from "@/services/outline.service";
import { OutlineSkeleton } from "@/types/interview";
import { SkeletonReview } from "./SkeletonReview";

interface Props {
  interviewData: InterviewBase;
  setStep: (step: 'details' | 'questions' | 'distribute') => void;
  setOpen: (open: boolean) => void;
  outlineDebugLanguage?: LanguageCode | ''; // 初稿调试语言
  selectedLanguage?: LanguageCode | ''; // 访谈语言（从details页面传来）
  draftQuestions: any[];
  setDraftQuestions: (questions: any[]) => void;
  localizedQuestions: any[] | null;
  setLocalizedQuestions: (questions: any[] | null) => void;
  mode?: 'generate' | 'edit'; // 显示模式：生成或编辑
}

function QuestionsPopup({ 
  interviewData, 
  setStep, 
  setOpen, 
  outlineDebugLanguage, 
  selectedLanguage,
  draftQuestions,
  setDraftQuestions,
  localizedQuestions,
  setLocalizedQuestions,
  mode = 'generate'
}: Props) {
  const { user } = useClerk();
  const { organization } = useOrganization();
  const { interviewers } = useInterviewers();
  const { fetchInterviews } = useInterviews();
  const {
    setInterviewData,
    setSelectedLanguage,
    setOutlineDebugLanguage,
    interviewId,
    setInterviewId,
    addCompletedStep,
    setCompletedSteps,
    completedSteps,
    outlineSkeleton: storeOutlineSkeleton,
    setOutlineSkeleton: setStoreOutlineSkeleton,
  } = useInterviewStore();
  const router = useRouter();

  // 检测是否为深度访谈模式（David 面试官）
  const selectedInterviewer = interviewers.find(
    (interviewer) => Number(interviewer.id) === Number(interviewData.interviewer_id)
  );
  const isDeepDiveMode = selectedInterviewer?.name?.includes('David') || 
                         selectedInterviewer?.name?.includes('Deep Dive');

  // 获取研究类型（从interviewData中获取，默认为product）
  const researchType = (interviewData as any).researchType || 'product';

  // ===== 生成大纲阶段的状态 =====
  // 根据mode属性确定是否显示编辑界面
  const hasGeneratedOutline = mode === 'edit';
  const [isGenerating, setIsGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState(
    interviewData.question_count ? String(interviewData.question_count) : ""
  );
  const [duration, setDuration] = useState(
    interviewData.time_duration || ""
  );
  const [localOutlineDebugLanguage, setLocalOutlineDebugLanguage] = useState<LanguageCode | ''>(outlineDebugLanguage || 'zh-CN');
  
  // 用户手动输入的sessions（可选）
  const [manualSessions, setManualSessions] = useState<Array<{ id: string; content: string }>>([]);
  const [isSessionConfigExpanded, setIsSessionConfigExpanded] = useState(false); // Session配置展开状态

  // ===== 两步生成流程的状态 =====
  // 从 store 恢复骨架，或使用本地状态
  const [skeleton, setSkeleton] = useState<OutlineSkeleton | null>(storeOutlineSkeleton);
  const [isGeneratingSkeleton, setIsGeneratingSkeleton] = useState(false);
  const [isGeneratingFullOutline, setIsGeneratingFullOutline] = useState(false);

  // ===== 编辑大纲阶段的状态 =====
  const [questions, setQuestions] = useState<Question[]>(
    draftQuestions.length > 0 ? draftQuestions : interviewData.questions
  );
  const [description, setDescription] = useState<string>(
    interviewData.description?.trim() || "",
  );
  const [showLocalized, setShowLocalized] = useState(false);
  const [isLocalizing, setIsLocalizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const endOfListRef = useRef<null | HTMLDivElement>(null);
  const prevQuestionLengthRef = useRef(questions.length);

  // ===== 两步生成流程函数 =====

  /**
   * Step 1: 生成大纲骨架
   */
  const onGenerateSkeleton = async () => {
    if (!numQuestions || !duration) {
      toast.error("请填写问题数量和访谈时长");
      return;
    }

    setIsGeneratingSkeleton(true);
    try {
      console.log('🎯 Generating skeleton...');

      // 生成骨架（不需要 interview_id）
      const result = await OutlineService.generateSkeleton({
        name: interviewData.name,
        objective: interviewData.objective,
        context: (interviewData as any).context || '',
        session_count: Number(numQuestions),
        duration_minutes: Number(duration),
        draft_language: localOutlineDebugLanguage,
        researchType: researchType
      });

      console.log('✅ Skeleton generated:', result.skeleton);
      setSkeleton(result.skeleton);
      setStoreOutlineSkeleton(result.skeleton); // 保存到 store
      toast.success("骨架生成成功！请 review 后确认");

    } catch (error: any) {
      console.error('❌ Error generating skeleton:', error);
      toast.error("生成骨架失败: " + (error.response?.data?.details || error.message));
    } finally {
      setIsGeneratingSkeleton(false);
    }
  };

  /**
   * Step 2: 更新骨架（用户编辑）
   */
  const onUpdateSkeleton = async (updatedSkeleton: OutlineSkeleton) => {
    setSkeleton(updatedSkeleton);
    setStoreOutlineSkeleton(updatedSkeleton); // 同步到 store

    // 可选：自动保存到后端
    if (interviewId) {
      try {
        await OutlineService.updateSkeleton(interviewId, updatedSkeleton);
        console.log('✅ Skeleton updated in backend');
      } catch (error) {
        console.error('❌ Error updating skeleton:', error);
        // 不显示错误提示，因为这是自动保存
      }
    }
  };

  /**
   * Step 3: 确认骨架并生成完整大纲
   */
  const onConfirmSkeletonAndGenerateFullOutline = async () => {
    if (!skeleton) {
      toast.error("Skeleton not found");
      return;
    }

    setIsGeneratingFullOutline(true);
    try {
      console.log('🚀 Generating full outline from skeleton...');

      // 如果还没有 interviewId，先创建 interview
      let currentInterviewId = interviewId;
      if (!currentInterviewId) {
        console.log('📝 Creating interview first...');

        // 准备 interview 数据
        const sanitizedInterviewData = {
          ...interviewData,
          user_id: user?.id || "",
          organization_id: organization?.id || "",
          interviewer_id: interviewData.interviewer_id.toString(),
          response_count: interviewData.response_count?.toString() || "0",
          logo_url: organization?.imageUrl || "",
          question_count: Number(numQuestions),
          time_duration: String(duration),
          outline_debug_language: localOutlineDebugLanguage,
          outline_skeleton: skeleton, // 保存骨架
          outline_generation_status: 'skeleton_generated',
        };

        // 创建 interview
        const createResponse = await apiClient.post("/interviews", {
          organizationName: organization?.name,
          interviewData: sanitizedInterviewData,
        });

        currentInterviewId = createResponse.data.id;
        setInterviewId(currentInterviewId);
        console.log('✅ Interview created:', currentInterviewId);
      }

      // 生成完整大纲
      const result = await OutlineService.generateFullOutline(currentInterviewId);

      console.log('✅ Full outline generated:', result);

      // 解析生成的问题
      const generatedQuestions = result.draft_outline.map((sessionText: string, index: number) => ({
        id: uuidv4(),
        question: sessionText,
        follow_up_count: 1,
      }));

      // 更新状态
      setQuestions(generatedQuestions);
      setDescription(result.description || "");
      setDraftQuestions(generatedQuestions);

      // 更新store
      setOutlineDebugLanguage(localOutlineDebugLanguage);

      const updatedInterviewData = {
        ...interviewData,
        questions: generatedQuestions,
        description: result.description || "",
        question_count: generatedQuestions.length,
        time_duration: String(duration),
        language: selectedLanguage || 'zh-CN',
        outline_debug_language: localOutlineDebugLanguage,
      };
      setInterviewData(updatedInterviewData);

      // 清除骨架（已经生成完整大纲）
      setSkeleton(null);
      setStoreOutlineSkeleton(null);

      // 标记生成和编辑步骤完成
      addCompletedStep('generate');
      addCompletedStep('edit');
      toast.success("完整大纲生成成功！");

      // 导航到编辑大纲页面
      router.push('/dashboard/create-interview/edit-outline');

    } catch (error: any) {
      console.error('❌ Error generating full outline:', error);
      toast.error("生成完整大纲失败: " + (error.response?.data?.details || error.message));
    } finally {
      setIsGeneratingFullOutline(false);
    }
  };

  // 生成大纲函数（旧流程，保留向后兼容）
  const onGenerateOutline = async () => {
    if (!numQuestions || !duration) {
      toast.error("请填写问题数量和访谈时长");
      return;
    }

    // 如果是重新生成，清除后续步骤的完成状态
    if (draftQuestions.length > 0) {
      console.log('🔄 Regenerating outline, clearing subsequent steps...');
      setCompletedSteps(completedSteps.filter(step => step === 'define'));
    }

    setIsGenerating(true);
    try {
      console.log('🚀 Starting outline generation...');
      
      // 根据模式构建不同的payload
      // 如果用户手动填写了session主题，构建context
      let contextWithTopics = "";
      if (isDeepDiveMode && manualSessions.length > 0) {
        const filledTopics = manualSessions
          .filter(s => s.content.trim())
          .map((s, idx) => `Session ${idx + 1}: ${s.content}`);
        
        if (filledTopics.length > 0) {
          contextWithTopics = "用户希望涵盖以下Session主题：\n" + filledTopics.join("\n");
        }
      }

      const generatePayload = isDeepDiveMode ? {
        // Deep Dive模式 - 使用sessions API的参数格式
        name: interviewData.name,
        objective: interviewData.objective,
        interviewer_id: Number(interviewData.interviewer_id),
        number: Number(numQuestions), // sessions API使用 'number'
        time_duration: String(duration),
        language: localOutlineDebugLanguage, // 初稿语言（控制大纲生成语言）
        outline_debug_language: localOutlineDebugLanguage,
        context: contextWithTopics, // sessions API使用 'context'，包含用户填写的主题
        researchType: researchType, // 使用用户选择的研究类型（product/market）
      } : {
        // 普通模式 - 使用questions API的参数格式
        name: interviewData.name,
        objective: interviewData.objective,
        interviewer_id: Number(interviewData.interviewer_id),
        question_count: Number(numQuestions), // questions API使用 'question_count'
        time_duration: String(duration),
        language: localOutlineDebugLanguage,
        outlineDebugLanguage: localOutlineDebugLanguage,
        isDeepDiveMode: false,
      };

      console.log('📤 Generate request payload:', generatePayload);
      console.log('🔬 Research Type:', researchType, '(will call', researchType === 'market' ? 'Market Research' : 'Product Research', 'prompt)');

      // 根据是否为深度访谈模式调用不同的API
      const apiEndpoint = isDeepDiveMode ? "/generate-interview-sessions" : "/generate-interview-questions";
      console.log(`📡 Calling API: ${apiEndpoint}`);

      const generationResponse = await apiClient.post(
        apiEndpoint,
        generatePayload,
        { timeout: 120000 }
      );

      console.log('✅ Generation response received:', generationResponse.data);

      const generatedQuestionsResponse = JSON.parse(generationResponse.data.response);
      console.log('📝 Parsed questions response:', generatedQuestionsResponse);
      console.log('🔢 Questions array length:', generatedQuestionsResponse.questions?.length);
      console.log('📊 Questions array type:', Array.isArray(generatedQuestionsResponse.questions) ? 'Array' : typeof generatedQuestionsResponse.questions);
      
      // 打印每个元素的类型和前100个字符
      if (Array.isArray(generatedQuestionsResponse.questions)) {
        generatedQuestionsResponse.questions.forEach((item: any, index: number) => {
          console.log(`📄 Question ${index + 1}:`, {
            type: typeof item,
            isString: typeof item === 'string',
            preview: typeof item === 'string' ? item.substring(0, 100) + '...' : JSON.stringify(item).substring(0, 100) + '...',
            fullLength: typeof item === 'string' ? item.length : JSON.stringify(item).length
          });
        });
      }

      // 根据模式不同，解析不同的数据格式
      let generatedQuestions: Question[];
      
      if (isDeepDiveMode) {
        // Deep Dive模式：questions是字符串数组，每个字符串是完整的session文本
        console.log('🔍 Processing sessions format (string array)');
        generatedQuestions = generatedQuestionsResponse.questions.map((sessionText: string, index: number) => ({
          id: uuidv4(),
          question: sessionText, // session的完整文本
          follow_up_count: 1,
        }));
      } else {
        // 普通模式：questions是对象数组
        console.log('🔍 Processing questions format (object array)');
        generatedQuestions = generatedQuestionsResponse.questions.map((q: any) => ({
          id: q.id || uuidv4(),
          question: q.question,
          follow_up_count: q.follow_up_count || 1,
        }));
      }

      console.log('✅ Processed questions:', generatedQuestions.length, 'items');
      generatedQuestions.forEach((q, idx) => {
        console.log(`   Session ${idx + 1} length:`, q.question.length, 'chars');
      });

      // 更新状态
      setQuestions(generatedQuestions);
      setDescription(generatedQuestionsResponse.description || "");
      setDraftQuestions(generatedQuestions);

      // 更新store
      setOutlineDebugLanguage(localOutlineDebugLanguage);
      
      const updatedInterviewData = {
        ...interviewData,
        questions: generatedQuestions,
        description: generatedQuestionsResponse.description || "",
        question_count: generatedQuestions.length,
        time_duration: String(duration),
        language: selectedLanguage || 'zh-CN', // 保持原有的访谈语言
        outline_debug_language: localOutlineDebugLanguage, // 设置初稿语言
      };
      setInterviewData(updatedInterviewData);

      // 标记生成和编辑步骤完成
      addCompletedStep('generate');
      addCompletedStep('edit');
      toast.success("大纲生成成功！");
      
      // 导航到编辑大纲页面
      router.push('/dashboard/create-interview/edit-outline');
      
    } catch (error: any) {
      console.error('❌ Error generating outline:', error);
      toast.error("生成大纲失败: " + (error.response?.data?.details || error.message));
    } finally {
      setIsGenerating(false);
    }
  };

  // 本地化函数
  const onLocalize = async () => {
    if (!selectedLanguage || !localOutlineDebugLanguage) {
      toast.error("请先选择访谈语言和初稿语言");
      return;
    }

    if (selectedLanguage === localOutlineDebugLanguage) {
      toast.info("访谈语言和初稿语言相同，无需本地化");
      return;
    }

    setIsLocalizing(true);
    try {
      console.log('🌐 Starting localization...', {
        targetLanguage: selectedLanguage,
        debugLanguage: localOutlineDebugLanguage,
        draftOutline: questions
      });

      const response = await apiClient.post(
        '/localize-outline',
        {
          draftOutline: questions,
          targetLanguage: selectedLanguage,
          researchObjective: interviewData.objective,
          studyName: interviewData.name,
          description: description
        },
        { timeout: 120000 }
      );

      console.log('✅ Localization response:', response.data);
      const localizedData = JSON.parse(response.data.response);

      const localizedQuestionsWithIds = localizedData.questions.map((q: any, index: number) => ({
        ...q,
        id: questions[index]?.id || uuidv4(),
      }));

      setLocalizedQuestions(localizedQuestionsWithIds);
      setShowLocalized(true);
      toast.success("本地化完成！");
    } catch (error: any) {
      console.error('❌ Localization error:', error);
      toast.error("本地化失败: " + (error.response?.data?.details || error.message));
    } finally {
      setIsLocalizing(false);
    }
  };

  // 下一步：保存访谈并跳转到分发页
  const onNextStep = async () => {
    console.log('💾 Starting interview save...');
    console.log('📊 Current state:', {
      questionsCount: questions.length,
      descriptionLength: description.length,
      duration: duration,
      interviewDataDuration: interviewData.time_duration,
      selectedLanguage,
      organization: organization?.name,
      hasLocalizedQuestions: !!localizedQuestions,
      existingInterviewId: interviewId,
    });

    setIsLoading(true);
    try {
      // 如果有本地化版本，使用本地化版本作为实际访谈的questions
      // 同时保存初稿和本地化版本
      const finalQuestions = localizedQuestions || questions;

      // 构建 payload - 如果是更新，只包含可更新的字段；如果是创建，包含所有字段
      const sanitizedInterviewData: any = interviewId ? {
        // 更新模式：只包含可更新的字段（参考 EditInterview）
        objective: interviewData.objective,
        interviewer_id: Number(interviewData.interviewer_id), // 更新时转为数字
        is_anonymous: interviewData.is_anonymous,
        description: description,
        questions: finalQuestions,
        question_count: finalQuestions.length,
        time_duration: Number(duration) || Number(interviewData.time_duration) || 30,
        language: selectedLanguage || interviewData.language || 'zh-CN',
      } : {
        // 创建模式：包含所有字段
        user_id: user?.id || "",
        organization_id: organization?.id || "",
        name: interviewData.name,
        objective: interviewData.objective,
        interviewer_id: interviewData.interviewer_id.toString(),
        response_count: (interviewData.response_count || BigInt(0)).toString(),
        is_anonymous: interviewData.is_anonymous,
        description: description,
        questions: finalQuestions,
        question_count: finalQuestions.length,
        time_duration: duration || interviewData.time_duration || "30",
        language: selectedLanguage || interviewData.language || 'zh-CN',
        logo_url: organization?.imageUrl || null,
      };
      
      // 保存初稿和本地化版本到对应字段（参考 EditInterview 的逻辑）
      if (showLocalized && localizedQuestions) {
        // 如果当前显示的是本地化版本，保存到 localized_outline
        sanitizedInterviewData.localized_outline = localizedQuestions;
        // 同时也保存初稿
        sanitizedInterviewData.draft_outline = questions;
      } else {
        // 如果显示的是初稿，保存到 draft_outline
        sanitizedInterviewData.draft_outline = questions;
        // 如果有本地化版本，也一起保存
        if (localizedQuestions) {
          sanitizedInterviewData.localized_outline = localizedQuestions;
        }
      }
      
      // 只在有值时添加可选字段
      if (localOutlineDebugLanguage) {
        sanitizedInterviewData.outline_debug_language = localOutlineDebugLanguage;
      }
      if (selectedLanguage) {
        sanitizedInterviewData.outline_interview_language = selectedLanguage;
      }

      console.log('📤 Sending interview data summary:', {
        organizationName: organization?.name,
        hasQuestions: !!sanitizedInterviewData.questions,
        questionsCount: sanitizedInterviewData.questions.length,
        hasDraftOutline: !!sanitizedInterviewData.draft_outline,
        draftOutlineCount: sanitizedInterviewData.draft_outline?.length,
        hasLocalizedOutline: !!sanitizedInterviewData.localized_outline,
        localizedOutlineCount: sanitizedInterviewData.localized_outline?.length,
        hasUser: !!sanitizedInterviewData.user_id,
        hasOrganization: !!sanitizedInterviewData.organization_id,
        language: sanitizedInterviewData.language,
        description: sanitizedInterviewData.description?.substring(0, 50) + '...',
        isUpdate: !!interviewId,
      });
      
      // 详细打印要保存的问题内容（前2个用于调试）
      if (sanitizedInterviewData.draft_outline) {
        console.log('📝 Draft outline (first 2):', sanitizedInterviewData.draft_outline.slice(0, 2));
      }
      if (sanitizedInterviewData.localized_outline) {
        console.log('🌐 Localized outline (first 2):', sanitizedInterviewData.localized_outline.slice(0, 2));
      }

      let response;
      
      // 如果有 interviewId，更新现有访谈；否则创建新访谈
      if (interviewId) {
        console.log('🔄 Updating existing interview:', interviewId);
        // 使用 InterviewService.updateInterview (PUT请求)
        response = await InterviewService.updateInterview(sanitizedInterviewData, interviewId);
        console.log('✅ Interview updated successfully');
        toast.success("访谈已更新！");
        
        // 更新后跳转回访谈详情页
        fetchInterviews();
        setIsLoading(false);
        router.push(`/interviews/${interviewId}`);
        return;
      } else {
        console.log('➕ Creating new interview');
        response = await apiClient.post("/interviews", {
        organizationName: organization?.name,
        interviewData: sanitizedInterviewData,
      });
      console.log('✅ Interview created successfully:', response.data);

        if (response.data?.id) {
          setInterviewId(response.data.id);
          console.log('✅ Interview ID saved to store:', response.data.id);
        }
        toast.success("访谈已保存！");
      }

      fetchInterviews();
      setIsLoading(false);
      
      // 创建新访谈后，跳转到分发页面
      setStep('distribute');
    } catch (error: any) {
      console.error("Error saving interview:", error);
      setIsLoading(false);
      toast.error("保存失败: " + (error.response?.data?.details || error.message));
    }
  };

  useEffect(() => {
    if (questions.length > prevQuestionLengthRef.current) {
      endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevQuestionLengthRef.current = questions.length;
  }, [questions.length]);

  useEffect(() => {
    setDraftQuestions(questions);
  }, [questions, setDraftQuestions]);

  // 根据numQuestions自动生成空白session框
  useEffect(() => {
    if (numQuestions && !hasGeneratedOutline) {
      const count = Number(numQuestions);
      if (count > 0 && count <= 20) {
        // 只在session数量变化时更新，保留已有内容
        setManualSessions(prevSessions => {
          if (prevSessions.length === count) {
            // 数量没变，不更新
            return prevSessions;
          }
          
          if (prevSessions.length < count) {
            // 增加session数量，保留已有内容
            const additionalSessions = Array.from(
              { length: count - prevSessions.length }, 
              () => ({ id: uuidv4(), content: '' })
            );
            return [...prevSessions, ...additionalSessions];
          } else {
            // 减少session数量，保留前N个
            return prevSessions.slice(0, count);
          }
        });
      } else if (count === 0) {
        // 如果数量为0，清空
        setManualSessions([]);
      }
    }
  }, [numQuestions, hasGeneratedOutline]);

  // ===== 渲染：生成大纲视图 =====
  if (!hasGeneratedOutline) {
  return (
      <div className="w-full bg-transparent">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">生成大纲</h1>
          <p className="text-sm text-gray-600">
            配置访谈参数并生成大纲，AI将根据您的输入自动生成访谈问题或Session大纲。
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">访谈配置</h2>
          </div>

          <div className="space-y-6">
            {/* 三个选项放在一行 */}
            <div className="grid grid-cols-3 gap-6">
              {/* 问题数量/Session数量 */}
              <div className="form-control">
                <label className="label pb-2">
                  <span className="label-text text-sm font-medium text-gray-700">
                    {isDeepDiveMode ? "Session数量" : "问题数量"}
                  </span>
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:border-blue-500 focus:outline-none transition-all text-lg font-semibold"
                  placeholder={isDeepDiveMode ? "5" : "10"}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  min="1"
                />
              </div>

              {/* 访谈时长 */}
              <div className="form-control">
                <label className="label pb-2">
                  <span className="label-text text-sm font-medium text-gray-700">
                    访谈时长 (分钟)
                  </span>
                </label>
                <select
                  className="custom-select w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:border-blue-500 focus:outline-none transition-all cursor-pointer text-lg font-semibold"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
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
                  <option value="">选择时长</option>
                  <option value="15">15分钟</option>
                  <option value="30">30分钟</option>
                  <option value="45">45分钟</option>
                  <option value="60">60分钟</option>
                  <option value="90">90分钟</option>
                  <option value="120">120分钟</option>
                </select>
              </div>

              {/* 初稿语言 */}
              <div className="form-control">
                <label className="label pb-2">
                  <span className="label-text text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe size={16} className="text-blue-600" />
                    初稿语言
                  </span>
                </label>
                <select
                  className="custom-select w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:border-blue-500 focus:outline-none transition-all cursor-pointer text-lg font-semibold"
                  value={localOutlineDebugLanguage}
                  onChange={(e) => setLocalOutlineDebugLanguage(e.target.value as LanguageCode)}
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
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, langConfig]) => (
                    <option key={code} value={code}>
                      {langConfig.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Session配置（可选，仅深度访谈模式） */}
            {isDeepDiveMode && numQuestions && Number(numQuestions) > 0 && (
              <div className="form-control w-full">
                <button
                  type="button"
                  onClick={() => setIsSessionConfigExpanded(!isSessionConfigExpanded)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border-2 border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="label-text text-sm font-medium text-gray-700">
                      Session配置（可选）
                    </span>
                    <span className="text-xs text-gray-500">
                      可以提前填写session主题，AI将基于这些主题生成详细内容
                    </span>
                  </div>
                  <ChevronLeft
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      isSessionConfigExpanded ? '-rotate-90' : 'rotate-180'
                    }`}
                  />
                </button>

                {isSessionConfigExpanded && (
                  <div className="space-y-3 mt-4">
                    {manualSessions.map((session, index) => (
                      <div key={session.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          className="flex-1 px-4 py-2 border-2 border-gray-300 bg-white rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                          placeholder={`Session ${index + 1} 主题（可选）`}
                          value={session.content}
                          onChange={(e) => {
                            const newSessions = [...manualSessions];
                            newSessions[index].content = e.target.value;
                            setManualSessions(newSessions);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 骨架 Review 区域（放在白色背景板内） */}
          {skeleton && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <SkeletonReview
                skeleton={skeleton}
                onUpdate={onUpdateSkeleton}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center items-center gap-4 pt-6 mt-6 border-t border-gray-200">
            <Button
              variant="outline"
              className="px-8 py-6 h-12 text-base"
              onClick={() => setStep('details')}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              上一步
            </Button>
            {/* 如果还没有生成骨架，显示"生成骨架"按钮 */}
            {!skeleton && (
              <Button
                disabled={!numQuestions || !duration || isGeneratingSkeleton}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 h-12 text-base shadow-sm"
                onClick={onGenerateSkeleton}
              >
                {isGeneratingSkeleton ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    生成骨架中...
                  </>
                ) : (
                  "生成大纲骨架"
                )}
              </Button>
            )}
            {/* 如果已经生成骨架，显示"生成完整大纲初稿"按钮 */}
            {skeleton && (
              <Button
                disabled={isGeneratingFullOutline}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 h-12 text-base shadow-sm"
                onClick={onConfirmSkeletonAndGenerateFullOutline}
              >
                {isGeneratingFullOutline ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    生成完整大纲中...
                  </>
                ) : (
                  "生成完整大纲初稿"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== 渲染：编辑大纲视图 =====
  return (
    <div className="w-full bg-transparent">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">编辑大纲</h1>
        <p className="text-sm text-gray-600">
          编辑和优化访谈大纲，支持本地化到目标语言
        </p>
      </div>

      {/* Info Banner */}
      <div className="alert bg-blue-50 border border-blue-200 rounded-lg mb-6 flex items-start gap-3 p-4">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">访谈语言：</span>
            {selectedLanguage && SUPPORTED_LANGUAGES[selectedLanguage as LanguageCode]?.name || '未设置'} 
            {isDeepDiveMode && localOutlineDebugLanguage && (
              <>
                {" | "}
                <span className="font-semibold">初稿语言：</span>
                {SUPPORTED_LANGUAGES[localOutlineDebugLanguage as LanguageCode]?.name}
              </>
            )}
          </p>
          {isDeepDiveMode && (
            <p className="text-xs text-gray-600 mt-1">
              您可以切换查看初稿版本或本地化版本
            </p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Version Selector */}
        {isDeepDiveMode && (
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  !showLocalized
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setShowLocalized(false)}
              >
                初稿版本
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showLocalized
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setShowLocalized(true)}
                disabled={!localizedQuestions}
              >
                本地化版本
                {!localizedQuestions && " (未生成)"}
              </button>
            </div>
            <Button
              variant="outline"
              onClick={onLocalize}
              disabled={isLocalizing || !questions.length}
            >
              {isLocalizing ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  本地化中...
                </>
              ) : (
                "🌐 一键本地化"
              )}
            </Button>
          </div>
        )}

        {/* Questions List */}
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {(showLocalized && localizedQuestions ? localizedQuestions : questions).map((question, index) => (
            <QuestionCard
              key={question.id}
              questionNumber={index + 1}
              questionData={question}
              isDeepDiveMode={isDeepDiveMode}
                onQuestionChange={(id: string, updatedQuestion: Question) => {
                  const updatedQuestions = questions.map((q) =>
                    q.id === id ? updatedQuestion : q
                  );
                  setQuestions(updatedQuestions);
                  if (showLocalized && localizedQuestions) {
                    const updatedLocalizedQuestions = localizedQuestions.map((q) =>
                      q.id === id ? updatedQuestion : q
                    );
                    setLocalizedQuestions(updatedLocalizedQuestions);
                  }
                }}
                onDelete={(id: string) => {
                  const updatedQuestions = questions.filter((q) => q.id !== id);
                  setQuestions(updatedQuestions);
                  if (showLocalized && localizedQuestions) {
                    setLocalizedQuestions(localizedQuestions.filter((q) => q.id !== id));
                  }
                }}
            />
          ))}
          <div ref={endOfListRef} />
          </div>
        </ScrollArea>

        {/* Add Question Button */}
        <Button
          variant="outline"
          className="w-full mt-6 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50"
          onClick={() => {
            const newQuestion: Question = {
              id: uuidv4(),
              question: "",
              follow_up_count: 1,
            };
            setQuestions([...questions, newQuestion]);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          添加{isDeepDiveMode ? "Session" : "问题"}
        </Button>

        {/* Interview Description */}
        <div className="form-control w-full mt-6 pt-6 border-t border-gray-200">
          <label className="label pb-2">
            <span className="label-text text-sm font-medium text-gray-700">
              访谈简介
            </span>
          </label>
          <textarea
            className="w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:border-blue-500 focus:outline-none transition-all min-h-[120px] resize-y"
            placeholder="请输入访谈简介，这将显示在访谈开始前..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex justify-center items-center gap-4 pt-6 mt-6 border-t border-gray-200">
          <Button
            variant="outline"
            className="px-8 py-6 h-12 text-base"
            onClick={() => {
              router.push('/dashboard/create-interview/outline');
            }}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            上一步
          </Button>
          <Button
            variant="outline"
            className="px-8 py-6 h-12 text-base"
            onClick={() => {
              toast.success("草稿已保存");
            }}
          >
            📄 保存草稿
          </Button>
          <Button
            disabled={
              questions.length === 0 ||
              description.trim() === "" ||
              questions.some((question) => question.question.trim() === "") ||
              isLoading
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 h-12 text-base shadow-sm"
            onClick={onNextStep}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                保存中...
              </>
            ) : (
              interviewId ? "保存修改" : "下一步 →"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuestionsPopup;
