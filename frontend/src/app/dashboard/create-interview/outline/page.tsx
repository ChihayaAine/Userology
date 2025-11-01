"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import QuestionsPopup from "@/components/dashboard/interview/create-popup/questions";
import LoaderWithLogo from "@/components/loaders/loader-with-logo/loaderWithLogo";
import { useInterviewStore } from "@/store/interview-store";
import Footer from "@/components/layout/Footer";

export default function GenerateOutlinePage() {
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
  } = useInterviewStore();

  useEffect(() => {
    // 如果没有访谈数据，重定向到第一步
    if (!interviewData.name) {
      console.log('⚠️ Missing interview name, redirecting to first step');
      router.push('/dashboard/create-interview');
      return;
    }

    // 标记生成大纲步骤为已访问（可返回）
    addCompletedStep('generate');
  }, [interviewData, router, addCompletedStep]);

  const handleSetStep = (step: 'details' | 'questions' | 'distribute') => {
    if (step === 'details') {
      router.push('/dashboard/create-interview');
    }
  };

  const handleClose = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <LoaderWithLogo />
        <p className="mt-6 text-lg text-gray-600 animate-pulse">{loadingMessage}</p>
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
          mode="generate"
        />
      </div>
      <Footer />
    </div>
  );
}

