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

interface Props {
  open: boolean;
  setLoading: (loading: boolean) => void;
  interviewData: InterviewBase;
  setInterviewData: (interviewData: InterviewBase) => void;
  isUploaded: boolean;
  setIsUploaded: (isUploaded: boolean) => void;
  fileName: string;
  setFileName: (fileName: string) => void;
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
}: Props) {
  const { interviewers, interviewersLoading } = useInterviewers();
  
  // 状态变量声明
  const [isClicked, setIsClicked] = useState(false);
  const [openInterviewerDetails, setOpenInterviewerDetails] = useState(false);
  const [interviewerDetails, setInterviewerDetails] = useState<Interviewer>();

  const [name, setName] = useState(interviewData.name);
  const [selectedInterviewer, setSelectedInterviewer] = useState<bigint | number>(
    interviewData.interviewer_id,
  );
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en-US');
  const [researchType, setResearchType] = useState<'product' | 'market'>('product');

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
      numQuestions !== "" &&
      duration !== "" &&
      Number(selectedInterviewer) > 0
    );
  };

  // 更新面试官的语言配置
  const updateInterviewerLanguage = async (language: LanguageCode) => {
    const selectedInterviewerData = interviewers.find(
      (interviewer) => Number(interviewer.id) === Number(selectedInterviewer)
    );

    if (!selectedInterviewerData?.agent_id) {
      console.error('No agent_id found for selected interviewer');
      return;
    }

    try {
      console.log(`🌐 Updating interviewer language to: ${language}`);
      await apiClient.post('/interviewers/update-language', {
        agentId: selectedInterviewerData.agent_id,
        language: language
      });
      console.log(`✅ Language updated successfully`);
    } catch (error) {
      console.error('❌ Error updating language:', error);
    }
  };

  const onGenrateQuestions = async () => {
    setLoading(true);

    try {
      const data = {
        name: name.trim(),
        objective: objective.trim(),
        number: numQuestions,
        context: uploadedDocumentContext,
        researchType: researchType,
      };

      // 检测选择的面试官是否是 David（深度访谈模式）
      const selectedInterviewerData = interviewers.find(
        (interviewer) => Number(interviewer.id) === Number(selectedInterviewer)
      );
      const isDeepDiveMode = selectedInterviewerData?.name?.includes('David') || 
                             selectedInterviewerData?.name?.includes('Deep Dive');

      console.log('🚀 Generating ' + (isDeepDiveMode ? 'SESSIONS' : 'questions') + ' with data:', data);
      console.log('🔍 Selected interviewer:', selectedInterviewerData?.name);

      // 根据面试官类型调用不同的 API
      const apiEndpoint = isDeepDiveMode 
        ? "/generate-interview-sessions"  // David 使用 sessions
        : "/generate-interview-questions"; // Lisa/Bob 使用 questions

      const generatedQuestions = (await apiClient.post(
        apiEndpoint,
        data,
      )) as any;

      console.log('✅ API response:', generatedQuestions.data);

      const generatedQuestionsResponse = JSON.parse(
        generatedQuestions.data.response,
      );

      console.log('✅ Parsed response:', generatedQuestionsResponse);

    const updatedQuestions = generatedQuestionsResponse.questions.map(
      (question: Question | string) => ({
        id: uuidv4(),
        // sessions 返回的是字符串，questions 返回的是对象
        question: typeof question === 'string' ? question.trim() : question.question.trim(),
        follow_up_count: 1,
      }),
    );

    const updatedInterviewData = {
      ...interviewData,
      name: name.trim(),
      objective: objective.trim(),
      questions: updatedQuestions,
      interviewer_id: BigInt(selectedInterviewer),
      question_count: Number(numQuestions),
      time_duration: duration,
      description: generatedQuestionsResponse.description,
      is_anonymous: isAnonymous,
    };
    setInterviewData(updatedInterviewData);
    console.log('✅ Interview data updated successfully');
    console.log('✅ Updated interview data:', updatedInterviewData);
    console.log('✅ Loading state remains true, parent component should handle the transition');
    // 不在这里设置 setLoading(false)，让父组件的 useEffect 来处理
  } catch (error) {
    console.error('❌ Error generating questions:', error);
    setLoading(false); // 只在错误时设置 loading 为 false
  }
};

  const onManual = () => {
    setLoading(true);

    const updatedInterviewData = {
      ...interviewData,
      name: name.trim(),
      objective: objective.trim(),
      questions: [{ id: uuidv4(), question: "", follow_up_count: 1 }],
      interviewer_id: BigInt(selectedInterviewer),
      question_count: Number(numQuestions),
      time_duration: String(duration),
      description: "",
      is_anonymous: isAnonymous,
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
      <div className="text-center w-[38rem]">
        <h1 className="text-xl font-semibold">Create a Research Study</h1>
        <div className="flex flex-col justify-center items-start mt-4 ml-10 mr-8">
          <div className="flex flex-row justify-center items-center">
            <h3 className="text-sm font-medium">Research Study Name:</h3>
            <input
              type="text"
              className="border-b-2 focus:outline-none border-gray-500 px-2 w-96 py-0.5 ml-3"
              placeholder="e.g. User Onboarding Experience Study"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => setName(e.target.value.trim())}
            />
          </div>
          <h3 className="text-sm mt-3 font-medium">Select a Research Assistant:</h3>
          <div className="relative flex items-center mt-1 overflow-hidden">
            <div
              id="slider-3"
              className=" h-36 pt-1 overflow-x-scroll scroll whitespace-nowrap scroll-smooth scrollbar-hide w-[27.5rem]"
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
                  className=" p-0 inline-block cursor-pointer ml-1 mr-5 rounded-xl shrink-0 overflow-hidden"
                  key={item.id}
                >
                  <button
                    className="absolute ml-9"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInterviewerDetails(item);
                      setOpenInterviewerDetails(true);
                    }}
                  >
                    <Info size={18} color="#4f46e5" strokeWidth={2.2} />
                  </button>
                  <div
                    className={`w-[96px] overflow-hidden rounded-full cursor-pointer ${
                      Number(selectedInterviewer) === Number(item.id)
                        ? "border-4 border-indigo-600"
                        : "border-2 border-transparent"
                    }`}
                    onClick={() => {
                      console.log('🚀 Selecting interviewer:', item.id, item.name);
                      console.log('🚀 Previous selectedInterviewer:', selectedInterviewer);
                      const newInterviewerId = Number(item.id);
                      setSelectedInterviewer(newInterviewerId);
                      console.log('🚀 New selectedInterviewer should be:', newInterviewerId);
                      // 立即应用当前选择的语言到新选择的面试官
                      setTimeout(() => {
                        const selectedInterviewerData = interviewers.find(
                          (interviewer) => Number(interviewer.id) === newInterviewerId
                        );
                        if (selectedInterviewerData?.agent_id) {
                          updateInterviewerLanguage(selectedLanguage);
                        }
                      }, 100);
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={`Picture of ${item.name}`}
                      width={70}
                      height={70}
                      className="w-full h-full object-cover"
                      onError={() => {
                        console.error('❌ Failed to load image:', item.image);
                      }}
                      onLoad={() => {
                        console.log('✅ Image loaded successfully:', item.image);
                      }}
                    />
                  </div>
                  <CardTitle className="mt-0 text-xs text-center">
                    {item.name}
                  </CardTitle>
                </div>
                ))
              )}
            </div>
            {interviewers.length > 4 ? (
              <div className="flex-row justify-center ml-3 mb-1 items-center space-y-6">
                <ChevronRight
                  className="opacity-50 cursor-pointer hover:opacity-100"
                  size={27}
                  onClick={() => slide("slider-3", 115)}
                />
                <ChevronLeft
                  className="opacity-50 cursor-pointer hover:opacity-100"
                  size={27}
                  onClick={() => slide("slider-3", -115)}
                />
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-row justify-between items-center w-[33.2rem] mt-3">
            <h3 className="text-sm font-medium">Interview Language:</h3>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const newLanguage = e.target.value as LanguageCode;
                setSelectedLanguage(newLanguage);
                if (selectedInterviewer && Number(selectedInterviewer) > 0) {
                  updateInterviewerLanguage(newLanguage);
                }
              }}
              className="border-2 border-gray-500 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-row justify-between items-center w-[33.2rem] mt-3">
            <h3 className="text-sm font-medium">Research Type:</h3>
            <div className="flex gap-3">
              <button
                type="button"
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
                type="button"
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
          <div className="mt-3">
            <h3 className="text-sm font-medium">Research Objective: (Required)</h3>
            <p className="text-xs text-gray-600 mt-1">
              {researchType === 'product'
                ? "Describe your product and core research questions. Include: product info, research background, core questions, decision needs, and expected outputs."
                : "Describe the market opportunity and validation goals. Include: business context, core questions to validate, target users, and success criteria."}
            </p>
          </div>
          <Textarea
            value={objective}
            className="h-24 mt-2 border-2 border-gray-500 w-[33.2rem]"
            placeholder={researchType === 'product'
              ? "e.g. Product Research - New Version Validation\n\nProduct Info:\n- Name: TaskMaster\n- Positioning: Team task management tool\n- Core Features: Task assignment, progress tracking\n- Target Users: SMB team managers\n\nResearch Background:\n- Trigger: Version 3.0 launched 3 months ago\n- Core Questions: Which new features are most valuable? What should we prioritize next?\n- Decision Need: Define roadmap for next 2-3 versions\n- Must Collect: Top 3 highlights and 3 pain points\n- Ideal Output: 3 must-do and 3 nice-to-have improvements"
              : "e.g. Market Research - Opportunity Exploration\n\nBusiness Context:\n- Domain: AI leisure consumption assistant\n- Opportunity: Young people face choice paralysis, info overload\n- Strategic Goal: Validate market opportunity\n\nCore Questions to Validate:\n- Market Need: Real pain points in leisure decision-making?\n- Solution Gap: What's missing in existing tools (Xiaohongshu, Dianping)?\n- Product Direction: What do users expect from AI recommendations?\n- Commercial Viability: Willingness to pay?\n\nTarget Users:\n- Core: Young professionals in tier-1 cities (25-35)\n- Geography: Beijing, Shanghai, Guangzhou, Shenzhen\n- Characteristics: Disposable income, quality-seeking\n\nSuccess Criteria:\n- Decision: Whether to enter this market\n- Ideal Output: Validate 3 need hypotheses, discover 2 new opportunities\n- Must Collect: Pain point authenticity, AI acceptance, payment willingness"}
            onChange={(e) => setObjective(e.target.value)}
            onBlur={(e) => setObjective(e.target.value.trim())}
          />
          <div className="mt-2">
            <h3 className="text-sm font-medium">Additional Documents: (Optional)</h3>
            <p className="text-xs text-gray-600 mt-1">
              {researchType === 'product'
                ? "Upload detailed product documentation, PRDs, feature specs, user feedback reports, or version release notes to provide additional context."
                : "Upload market research reports, competitor analysis, user survey data, industry reports, or business plans to supplement your research context."}
            </p>
          </div>
          <FileUpload
            isUploaded={isUploaded}
            setIsUploaded={setIsUploaded}
            fileName={fileName}
            setFileName={setFileName}
            setUploadedDocumentContext={setUploadedDocumentContext}
          />
          <label className="flex-col mt-7 w-full">
            <div className="flex items-center cursor-pointer">
              <span className="text-sm font-medium">
                Do you prefer the participants&apos; responses to be anonymous?
              </span>
              <Switch
                checked={isAnonymous}
                className={`ml-4 mt-1 ${
                  isAnonymous ? "bg-indigo-600" : "bg-[#E6E7EB]"
                }`}
                onCheckedChange={(checked) => setIsAnonymous(checked)}
              />
            </div>
            <span
              style={{ fontSize: "0.7rem", lineHeight: "0.66rem" }}
              className="font-light text-xs italic w-full text-left block"
            >
              Note: If not anonymous, the participant&apos;s email and name will
              be collected.
            </span>
          </label>
          <div className="flex flex-row gap-3 justify-between w-full mt-3">
            <div className="flex flex-row justify-center items-center ">
              <h3 className="text-sm font-medium ">Number of Questions:</h3>
              <input
                type="number"
                step="1"
                max="300"
                min="1"
                className="border-b-2 text-center focus:outline-none  border-gray-500 w-14 px-2 py-0.5 ml-3"
                value={numQuestions}
                onChange={(e) => {
                  let value = e.target.value;
                  if (
                    value === "" ||
                    (Number.isInteger(Number(value)) && Number(value) > 0)
                  ) {
                    setNumQuestions(value);
                  }
                }}
              />
            </div>
            <div className="flex flex-row justify-center items-center">
              <h3 className="text-sm font-medium ">Duration (mins):</h3>
              <input
                type="number"
                step="1"
                max="300"
                min="1"
                className="border-b-2 text-center focus:outline-none  border-gray-500 w-14 px-2 py-0.5 ml-3"
                value={duration}
                onChange={(e) => {
                  let value = e.target.value;
                  if (
                    value === "" ||
                    (Number.isInteger(Number(value)) && Number(value) > 0)
                  ) {
                    setDuration(value);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex flex-row w-full justify-center items-center space-x-24 mt-5">
            <Button
              disabled={!isFormValid() || isClicked}
              className="bg-indigo-600 hover:bg-indigo-800  w-40"
              onClick={() => {
                setIsClicked(true);
                onGenrateQuestions();
              }}
            >
              Generate Questions
            </Button>
            <Button
              disabled={!isFormValid() || isClicked}
              className="bg-indigo-600 w-40 hover:bg-indigo-800"
              onClick={() => {
                setIsClicked(true);
                onManual();
              }}
            >
              I&apos;ll do it myself
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
