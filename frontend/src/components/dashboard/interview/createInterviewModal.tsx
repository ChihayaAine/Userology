import React, { useEffect, useState } from "react";
import LoaderWithLogo from "@/components/loaders/loader-with-logo/loaderWithLogo";
import DetailsPopup from "@/components/dashboard/interview/create-popup/details";
import QuestionsPopup from "@/components/dashboard/interview/create-popup/questions";
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
  const [proceed, setProceed] = useState(false);
  const [interviewData, setInterviewData] = useState<InterviewBase>(
    CreateEmptyInterviewData(),
  );

  // Below for File Upload
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState("");

  // 语言参数（从DetailsPopup传递过来）
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | ''>('');
  const [outlineDebugLanguage, setOutlineDebugLanguage] = useState<LanguageCode | ''>('');

  useEffect(() => {
    if (loading == true) {
      setLoading(false);
      setProceed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewData]);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setProceed(false);
      setInterviewData(CreateEmptyInterviewData());
      // Below for File Upload
      setIsUploaded(false);
      setFileName("");
      // Reset language states
      setSelectedLanguage("");
      setOutlineDebugLanguage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {loading ? (
        <div className="w-[38rem] h-[35.3rem]">
          <LoaderWithLogo />
        </div>
      ) : !proceed ? (
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
      ) : (
        <QuestionsPopup
          interviewData={interviewData}
          setProceed={setProceed}
          setOpen={setOpen}
          selectedLanguage={selectedLanguage}
          outlineDebugLanguage={outlineDebugLanguage}
        />
      )}
    </>
  );
}

export default CreateInterviewModal;
