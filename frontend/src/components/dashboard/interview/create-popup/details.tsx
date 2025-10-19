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
  const [showObjectiveTooltip, setShowObjectiveTooltip] = useState(false);
  const [showDocumentTooltip, setShowDocumentTooltip] = useState(false);
  const [showObjectiveExample, setShowObjectiveExample] = useState(false);
  const [showDocumentExample, setShowDocumentExample] = useState(false);

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
          <div className="mt-3 flex items-center gap-2 relative">
            <h3 className="text-sm font-medium">Research Objective:</h3>
            <div className="relative">
              <Info
                size={16}
                className="text-indigo-600 cursor-pointer hover:text-indigo-800"
                onClick={() => setShowObjectiveTooltip(!showObjectiveTooltip)}
              />
              {showObjectiveTooltip && !showObjectiveExample && (
                <div className="absolute left-0 top-6 z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold text-gray-900">Required.</span>{' '}
                    {researchType === 'product'
                      ? "Describe your product and core research questions. Include: product info, research background, core questions, decision needs, and expected outputs."
                      : "Describe the market opportunity and validation goals. Include: business context, core questions to validate, target users, and success criteria."}
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
                <div className="absolute left-0 top-6 z-50 w-[480px] bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-[500px] overflow-y-auto">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    {researchType === 'product' ? 'Product Research Example' : 'Market Research Example'}
                  </h4>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {researchType === 'product'
                      ? `Research Type: Product Research - English Exam Vocabulary App

Product Info:
- Name: Sparkmo
- Positioning: AI-powered exam-focused English vocabulary learning app for Taiwan market
- Core Features: Spaced repetition, exam-specific word lists (TOEFL/IELTS/TOEIC), AI-generated example sentences, progress tracking
- Target Users: Taiwanese students and young professionals preparing for English proficiency exams

Research Background:
- Trigger: Successfully launched in Taiwan, now exploring expansion to French market
- Core Questions:
  • Can our "exam-driven" product model work in France?
  • What are the core pain points for French users preparing for English exams?
  • Which exam types (TOEIC, TOEFL, IELTS, Cambridge) should we prioritize?
  • What features need localization beyond translation?
- Decision Need: Decide whether to invest in French market localization and product development
- Must Collect:
  • Current tools users are using for exam vocabulary prep
  • Top 3 pain points with existing solutions
  • Must-have features for an "ideal exam prep app"
  • Pricing sensitivity and payment willingness (€)
  • Preferred payment model (subscription vs. one-time purchase)
- Ideal Output:
  • Go/No-Go decision recommendation
  • User personas for different exam types
  • Competitive analysis of existing solutions
  • Prioritized feature list for localization`
                      : `Research Type: Market Research - AI Leisure Time Optimization

Business Context:
- Domain: AI applications for individual consumers (consumption, entertainment, self-improvement, productivity)
- Opportunity: AI can reshape leisure experiences through personalized recommendations, content generation, and intelligent interaction, helping users spend leisure time more efficiently and meaningfully
- Strategic Goal: Explore AI breakthrough opportunities in consumer market, identify and validate a product direction with high user value and commercial potential

Core Questions to Validate:
- Market Need Authenticity:
  • Do users have real and strong needs for "optimizing leisure time arrangement"?
  • Do users perceive pain points in current leisure activities (videos, games, reading) that AI can significantly improve?
- Solution Gap:
  • What core pain points exist in mainstream entertainment/productivity apps (Douyin, Bilibili, Xiaohongshu, games)? (e.g., echo chambers, post-binge emptiness, high content filtering costs)
  • What gaps exist in how existing AI tools (ChatGPT, Midjourney) integrate into ordinary people's daily leisure? (e.g., usage barriers, scenario integration, lack of consolidation)
- Product Direction:
  • Which leisure scenario do users most want AI help with? (e.g., AI reading assistant, AI game companion, AI personalized content generator, AI interest mentor)
  • What core features should an ideal AI product have to attract users? (efficiency tool, entertainment partner, or creativity engine?)
- Commercial Viability:
  • Are users willing to pay for "higher quality leisure time"? What payment models? (subscription, pay-per-use, premium features)

Target Users:
- Core: "Active explorers" interested in new tech (especially AI), willing to try new products, motivated to self-improve or pursue quality entertainment
- Secondary: "Efficiency anxious" professionals/students seeking efficient, valuable content consumption
- Geography: Tier 1 & 2 cities in mainland China
- Age: 18-35 years old
- Occupation: University students, internet workers, white-collar workers, content creators

Success Criteria:
- Decision: Whether to launch project in AI leisure consumption domain and determine most promising product direction
- Ideal Output:
  • Detailed user leisure time allocation map (activities, duration, apps used, satisfaction, pain points)
  • Identify and rank 3-5 core pain points users most want solved in leisure scenarios
  • Collect 5-10 user-perspective "ideal AI product" concepts with specific, attractive features
  • Validate payment willingness and acceptable price range for "AI-optimized leisure"
- Must Collect:
  • Time allocation: specific leisure activities and duration (e.g., 2hrs short videos, 1hr gaming, 30min reading)
  • Current solutions and ratings: main apps used for each activity, what they like and hate
  • Core pain points: most frustrating, time-wasting, or unsatisfying aspects of leisure time
  • Open-ended vision: if an all-powerful AI team could build anything, what product would users want for their leisure time? What features? Why important?`}
                  </pre>
                  <button
                    className="text-xs text-indigo-600 hover:text-indigo-800 mt-3 underline"
                    onClick={() => {
                      setShowObjectiveExample(false);
                      setShowObjectiveTooltip(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
          <Textarea
            value={objective}
            className="h-24 mt-2 border-2 border-gray-500 w-[33.2rem]"
            placeholder={researchType === 'product'
              ? "Product Info:\n- Name: [Product Name]\n- Positioning: [One-sentence product positioning]\n- Core Features: [3-5 core features]\n- Target Users: [Main user groups]\n\nResearch Background:\n- Trigger: [Why conduct this research]\n- Core Questions: [1-3 core questions to solve]\n- Decision Need: [What decisions will the research inform]\n- Must Collect: [Required data points, e.g., \"Top 3 highlights and 3 pain points\"]\n- Ideal Output: [Expected research outcomes]"
              : "Business Context:\n- Domain: [Business domain]\n- Opportunity: [Market opportunity hypothesis]\n- Strategic Goal: [Strategic objectives]\n\nCore Questions to Validate:\n- Market Need: [Real pain points?]\n- Solution Gap: [What's missing in existing solutions?]\n- Product Direction: [User expectations?]\n- Commercial Viability: [Willingness to pay?]\n\nTarget Users:\n- Core: [Primary user segment]\n- Geography: [Geographic scope]\n- Characteristics: [User characteristics]\n\nSuccess Criteria:\n- Decision: [Key decision to make]\n- Ideal Output: [Expected validation outcomes]\n- Must Collect: [Required data points]"}
            onChange={(e) => setObjective(e.target.value)}
            onBlur={(e) => setObjective(e.target.value.trim())}
          />
          <div className="mt-2 flex items-center gap-2 relative">
            <h3 className="text-sm font-medium">Additional Documents:</h3>
            <div className="relative">
              <Info
                size={16}
                className="text-indigo-600 cursor-pointer hover:text-indigo-800"
                onClick={() => setShowDocumentTooltip(!showDocumentTooltip)}
              />
              {showDocumentTooltip && !showDocumentExample && (
                <div className="absolute left-0 top-6 z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold text-gray-900">Optional.</span>{' '}
                    {researchType === 'product'
                      ? "Upload detailed product documentation, PRDs, feature specs, user feedback reports, or version release notes to provide additional context."
                      : "Upload market research reports, competitor analysis, user survey data, industry reports, or business plans to supplement your research context."}
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
                <div className="absolute left-0 top-6 z-50 w-96 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    {researchType === 'product' ? 'Product Documentation Examples' : 'Market Research Documentation Examples'}
                  </h4>
                  <div className="text-xs text-gray-700 space-y-2">
                    {researchType === 'product' ? (
                      <>
                        <p><span className="font-semibold">• Product Requirements Document (PRD)</span><br/>
                        Detailed feature specifications, user stories, acceptance criteria</p>
                        <p><span className="font-semibold">• Feature Specifications</span><br/>
                        Technical specs, design mockups, interaction flows</p>
                        <p><span className="font-semibold">• User Feedback Reports</span><br/>
                        Support tickets, user reviews, NPS survey results</p>
                        <p><span className="font-semibold">• Version Release Notes</span><br/>
                        Changelog, new features, bug fixes, known issues</p>
                        <p><span className="font-semibold">• Analytics Reports</span><br/>
                        Usage metrics, feature adoption rates, user behavior data</p>
                      </>
                    ) : (
                      <>
                        <p><span className="font-semibold">• Market Research Reports</span><br/>
                        Industry trends, market size, growth projections</p>
                        <p><span className="font-semibold">• Competitor Analysis</span><br/>
                        Competitive landscape, feature comparison, pricing analysis</p>
                        <p><span className="font-semibold">• User Survey Data</span><br/>
                        Survey results, user interviews, focus group findings</p>
                        <p><span className="font-semibold">• Industry Reports</span><br/>
                        Third-party research, analyst reports, white papers</p>
                        <p><span className="font-semibold">• Business Plans</span><br/>
                        Go-to-market strategy, business model, revenue projections</p>
                      </>
                    )}
                  </div>
                  <button
                    className="text-xs text-indigo-600 hover:text-indigo-800 mt-3 underline"
                    onClick={() => {
                      setShowDocumentExample(false);
                      setShowDocumentTooltip(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
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
