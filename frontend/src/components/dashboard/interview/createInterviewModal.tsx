import React, { useEffect, useState } from "react";
import LoaderWithLogo from "@/components/loaders/loader-with-logo/loaderWithLogo";
import DetailsPopup from "@/components/dashboard/interview/create-popup/details";
import QuestionsPopup from "@/components/dashboard/interview/create-popup/questions";
import DistributePopup from "@/components/dashboard/interview/create-popup/distribute";
import { InterviewBase } from "@/types/interview";
import { LanguageCode } from "@/lib/languages";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CreateEmptyInterviewData = (): InterviewBase => ({
  user_id: "",
  organization_id: "",
  name: "",
  interviewer_id: BigInt(0),
  objective: "",
  question_count: 0,
  time_duration: "",
  is_anonymous: false,
  questions: [],
  description: "",
  response_count: BigInt(0),
});

function CreateInterviewModal({ open, setOpen }: Props) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'questions' | 'distribute'>('details');
  const [interviewData, setInterviewData] = useState<InterviewBase>(
    CreateEmptyInterviewData(),
  );

  // Below for File Upload
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState("");

  // 语言参数（从DetailsPopup传递过来）
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | ''>('');
  const [outlineDebugLanguage, setOutlineDebugLanguage] = useState<LanguageCode | ''>('');
  
  // 存储问题的状态（用于在分发页面选择版本）
  const [draftQuestions, setDraftQuestions] = useState<any[]>([]);
  const [localizedQuestions, setLocalizedQuestions] = useState<any[] | null>(null);

  useEffect(() => {
    if (loading == true) {
      setLoading(false);
      setStep('questions');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewData]);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setStep('details');
      setInterviewData(CreateEmptyInterviewData());
      // Below for File Upload
      setIsUploaded(false);
      setFileName("");
      // Reset language states
      setSelectedLanguage("");
      setOutlineDebugLanguage("");
      // Reset questions states
      setDraftQuestions([]);
      setLocalizedQuestions(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {loading ? (
        <div className="w-[38rem] h-[35.3rem]">
          <LoaderWithLogo />
        </div>
      ) : step === 'details' ? (
        <DetailsPopup
          open={open}
          setLoading={setLoading}
          interviewData={interviewData}
          setInterviewData={setInterviewData}
          // Below for File Upload
          isUploaded={isUploaded}
          setIsUploaded={setIsUploaded}
          fileName={fileName}
          setFileName={setFileName}
          // Language states
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          outlineDebugLanguage={outlineDebugLanguage}
          setOutlineDebugLanguage={setOutlineDebugLanguage}
        />
      ) : step === 'questions' ? (
        <QuestionsPopup
          interviewData={interviewData}
          setStep={setStep}
          setOpen={setOpen}
          selectedLanguage={selectedLanguage}
          outlineDebugLanguage={outlineDebugLanguage}
          draftQuestions={draftQuestions}
          setDraftQuestions={setDraftQuestions}
          localizedQuestions={localizedQuestions}
          setLocalizedQuestions={setLocalizedQuestions}
        />
      ) : (
        <DistributePopup
          interviewData={interviewData}
          setProceed={(back) => setStep(back ? 'questions' : 'distribute')}
          setOpen={setOpen}
          selectedLanguage={selectedLanguage}
          outlineDebugLanguage={outlineDebugLanguage}
          draftQuestions={draftQuestions}
          localizedQuestions={localizedQuestions}
        />
      )}
    </>
  );
}

export default CreateInterviewModal;

