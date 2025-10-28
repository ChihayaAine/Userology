"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DetailsPopup from "@/components/dashboard/interview/create-popup/details";
import LoaderWithLogo from "@/components/loaders/loader-with-logo/loaderWithLogo";
import { useInterviewStore } from "@/store/interview-store";
import Footer from "@/components/layout/Footer";

export default function CreateInterviewPage() {
  const router = useRouter();
  const { 
    interviewData, 
    setInterviewData,
    selectedLanguage,
    setSelectedLanguage,
    outlineDebugLanguage,
    setOutlineDebugLanguage,
    isUploaded,
    setIsUploaded,
    fileName,
    setFileName,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    completedSteps,
    addCompletedStep,
    interviewId,
    resetStore
  } = useInterviewStore();

  useEffect(() => {
    // 检查是否应该重置store
    // 如果有 interviewId，说明是在编辑现有访谈，不应该重置
    // 只有在没有 interviewId 且 completedSteps 为空时才重置（真正的新访谈）
    const isEditingExisting = interviewId !== null;
    const shouldReset = completedSteps.length === 0 && !isEditingExisting;
    
    if (shouldReset) {
      console.log('🔄 Resetting store for new interview creation');
      resetStore();
    } else {
      console.log('↩️  Returning to create flow or editing existing, keeping data');
    }
  }, []);

  const handleSetLoading = (loading: boolean) => {
    if (loading) {
      // 标记第一步完成，解锁下一步
      addCompletedStep('define');
      // API已经完成，直接导航到下一页
      router.push('/dashboard/create-interview/outline');
    }
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
        <DetailsPopup
          open={true}
          setLoading={handleSetLoading}
          interviewData={interviewData}
          setInterviewData={setInterviewData}
          isUploaded={isUploaded}
          setIsUploaded={setIsUploaded}
          fileName={fileName}
          setFileName={setFileName}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          outlineDebugLanguage={outlineDebugLanguage}
          setOutlineDebugLanguage={setOutlineDebugLanguage}
        />
      </div>
      <Footer />
    </div>
  );
}

