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

  useEffect(() => {
    // 如果有 interviewId 但没有 draftQuestions，说明是从访谈详情页回来的
    // 需要从后端加载访谈数据
    const loadInterviewData = async () => {
      if (interviewId && (!draftQuestions || draftQuestions.length === 0)) {
        setIsLoadingInterview(true);
        try {
          console.log('🔄 Loading interview data from backend:', interviewId);
          const response = await apiClient.get(`/interviews/${interviewId}`);
          const interview = response.data;
          
          console.log('✅ Interview data loaded:', interview);
          
          // 更新 store 中的数据
          setInterviewData({
            ...interview,
            interviewer_id: BigInt(interview.interviewer_id || 0),
            response_count: BigInt(interview.response_count || 0),
          });
          
          setDraftQuestions(interview.questions || []);
          setSelectedLanguage(interview.language || interview.outline_interview_language || '');
          setOutlineDebugLanguage(interview.outline_debug_language || '');
          
          toast.success("已加载访谈数据");
        } catch (error) {
          console.error('❌ Error loading interview:', error);
          toast.error("加载访谈数据失败");
          router.push('/dashboard');
        } finally {
          setIsLoadingInterview(false);
        }
        return;
      }
    };
    
    loadInterviewData();
    
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
  }, [interviewId, interviewData, router, draftQuestions, addCompletedStep, setInterviewData, setDraftQuestions, setSelectedLanguage, setOutlineDebugLanguage]);

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

  if (isLoading || isLoadingInterview) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <LoaderWithLogo />
        <p className="mt-6 text-lg text-gray-600 animate-pulse">
          {isLoadingInterview ? "加载访谈数据中..." : loadingMessage}
        </p>
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
          mode="edit"
        />
      </div>
      <Footer />
    </div>
  );
}
