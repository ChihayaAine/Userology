"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionsPopup from "@/components/dashboard/interview/create-popup/questions";
import LoaderWithLogo from "@/components/loaders/loader-with-logo/loaderWithLogo";
import { useInterviewStore } from "@/store/interview-store";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import Footer from "@/components/layout/Footer";

export default function EditOutlinePage() {
  const router = useRouter();
  const {
    interviewData,
    selectedLanguage,
    outlineDebugLanguage,
    draftQuestions,
    setDraftQuestions,
    localizedQuestions,
    setLocalizedQuestions,
    isLoading,
    loadingMessage,
    addCompletedStep,
    interviewId,
    setInterviewData,
    setSelectedLanguage,
    setOutlineDebugLanguage,
  } = useInterviewStore();
  
  const [isLoadingInterview, setIsLoadingInterview] = useState(false);
  const [hasCheckedData, setHasCheckedData] = useState(false);
  const [localizedDescription, setLocalizedDescription] = useState<string>("");

  useEffect(() => {
    // 如果有 interviewId 但没有 draftQuestions，说明是从访谈详情页回来的
    // 需要从后端加载访谈数据
    const loadInterviewData = async () => {
      console.log('🔍 Edit page - checking data:', {
        interviewId,
        draftQuestions,
        draftQuestionsLength: draftQuestions?.length,
        draftQuestionsType: typeof draftQuestions,
      });
      
      if (interviewId && (!draftQuestions || draftQuestions.length === 0)) {
        setIsLoadingInterview(true);
        try {
          console.log('🔄 Loading interview data from backend:', interviewId);
          const response = await apiClient.get(`/interviews/${interviewId}`);
          console.log('📦 Raw API response:', response);
          
          const interview = response.data;
          console.log('✅ Interview data:', interview);
          console.log('📋 Draft outline:', interview.draft_outline);
          console.log('📋 Localized outline:', interview.localized_outline);
          console.log('📋 Questions (legacy):', interview.questions);
          
          // 更新 store 中的数据
          setInterviewData({
            ...interview,
            interviewer_id: BigInt(interview.interviewer_id || 0),
            response_count: BigInt(interview.response_count || 0),
          });
          
          // 优先使用 draft_outline，如果没有则使用 questions（向后兼容）
          const draftOutline = interview.draft_outline || interview.questions || [];
          const localizedOutline = interview.localized_outline || null;
          const localDescription = interview.local_description || null;
          
          console.log('📝 Setting draftQuestions:', draftOutline);
          console.log('📝 Setting localizedQuestions:', localizedOutline);
          console.log('📝 Setting localizedDescription:', localDescription ? localDescription.substring(0, 100) + '...' : 'null');
          
          setDraftQuestions(draftOutline);
          setLocalizedQuestions(localizedOutline);
          setSelectedLanguage(interview.outline_interview_language || interview.language || '');
          setOutlineDebugLanguage(interview.outline_debug_language || interview.language || '');
          
          // 设置本地化的description
          if (localDescription) {
            setLocalizedDescription(localDescription);
          }
          
          toast.success("已加载访谈数据");
        } catch (error) {
          console.error('❌ Error loading interview:', error);
          toast.error("加载访谈数据失败");
          router.push('/dashboard');
        } finally {
          setIsLoadingInterview(false);
          setHasCheckedData(true);
        }
        return;
      }
      
      // 如果既没有 interviewId，也没有访谈数据，重定向到第一步
      if (!interviewId && (!interviewData.name || !interviewData.interviewer_id)) {
        router.push('/dashboard/create-interview');
        return;
      }
      
      // 如果没有生成过大纲（且不是从后端加载的情况），重定向到生成页面
      if (!interviewId && (!draftQuestions || draftQuestions.length === 0)) {
        router.push('/dashboard/create-interview/outline');
        return;
      }
      
      // 标记编辑大纲步骤为已访问（可返回）
      addCompletedStep('edit');
      setHasCheckedData(true);
    };
    
    loadInterviewData();
  }, [interviewId, interviewData.name, interviewData.interviewer_id, router, draftQuestions, addCompletedStep, setInterviewData, setDraftQuestions, setSelectedLanguage, setOutlineDebugLanguage]);

  const handleSetStep = (step: 'details' | 'questions' | 'distribute') => {
    if (step === 'details') {
      router.push('/dashboard/create-interview');
    } else if (step === 'distribute') {
      router.push('/dashboard/create-interview/distribute');
    }
  };

  const handleClose = () => {
    router.push('/dashboard');
  };

  // 显示加载状态
  if (isLoading || isLoadingInterview || !hasCheckedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <LoaderWithLogo />
        <p className="mt-6 text-lg text-gray-600 animate-pulse">
          {isLoadingInterview ? "加载访谈数据中..." : !hasCheckedData ? "准备数据中..." : loadingMessage}
        </p>
      </div>
    );
  }

  // 确保数据已加载后再渲染
  if (!draftQuestions || draftQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-lg text-gray-600">没有可编辑的大纲数据</p>
        <button 
          onClick={() => router.push('/dashboard/create-interview/outline')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          返回生成大纲
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
        <QuestionsPopup
          interviewData={interviewData}
          setStep={handleSetStep}
          setOpen={handleClose}
          selectedLanguage={selectedLanguage}
          outlineDebugLanguage={outlineDebugLanguage}
          draftQuestions={draftQuestions}
          setDraftQuestions={setDraftQuestions}
          localizedQuestions={localizedQuestions}
          setLocalizedQuestions={setLocalizedQuestions}
          localizedDescription={localizedDescription}
          setLocalizedDescription={setLocalizedDescription}
          mode="edit"
        />
      </div>
      <Footer />
    </div>
  );
}
