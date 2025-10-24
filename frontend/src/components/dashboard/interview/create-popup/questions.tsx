import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "@/services/api";
import { useClerk, useOrganization } from "@clerk/nextjs";
import { InterviewBase, Question } from "@/types/interview";
import { useInterviews } from "@/contexts/interviews.context";
import { useInterviewers } from "@/contexts/interviewers.context";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionCard from "@/components/dashboard/interview/create-popup/questionCard";
import { Button } from "@/components/ui/button";
import { Plus, Globe } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { LanguageCode } from "@/lib/languages";

interface Props {
  interviewData: InterviewBase;
  setProceed: (proceed: boolean) => void;
  setOpen: (open: boolean) => void;
  outlineDebugLanguage?: LanguageCode | ''; // 大纲调试语言
  selectedLanguage?: LanguageCode | ''; // 访谈语言
}

function QuestionsPopup({ interviewData, setProceed, setOpen, outlineDebugLanguage, selectedLanguage }: Props) {
  const { user } = useClerk();
  const { organization } = useOrganization();
  const { interviewers } = useInterviewers();
  const [isClicked, setIsClicked] = useState(false);
  const [isLocalizing, setIsLocalizing] = useState(false);

  const [questions, setQuestions] = useState<Question[]>(
    interviewData.questions,
  );
  const [localizedQuestions, setLocalizedQuestions] = useState<Question[] | null>(null); // 本地化版本
  const [showLocalized, setShowLocalized] = useState(false); // 是否显示本地化版本
  const [description, setDescription] = useState<string>(
    interviewData.description.trim(),
  );
  const { fetchInterviews } = useInterviews();

  // 检测是否为深度访谈模式（David 面试官）
  const selectedInterviewer = interviewers.find(
    (interviewer) => Number(interviewer.id) === Number(interviewData.interviewer_id)
  );
  const isDeepDiveMode = selectedInterviewer?.name?.includes('David') || 
                         selectedInterviewer?.name?.includes('Deep Dive');

  const endOfListRef = useRef<HTMLDivElement>(null);
  const prevQuestionLengthRef = useRef(questions.length);

  const handleInputChange = (id: string, newQuestion: Question) => {
    setQuestions(
      questions.map((question) =>
        question.id === id ? { ...question, ...newQuestion } : question,
      ),
    );
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length === 1) {
      setQuestions(
        questions.map((question) => ({
          ...question,
          question: "",
          follow_up_count: 1,
        })),
      );

      return;
    }
    setQuestions(questions.filter((question) => question.id !== id));
  };

  const handleAddQuestion = () => {
    if (questions.length < interviewData.question_count) {
      setQuestions([
        ...questions,
        { id: uuidv4(), question: "", follow_up_count: 1 },
      ]);
    }
  };

  // 本地化大纲
  const onLocalize = async () => {
    if (!selectedLanguage || !outlineDebugLanguage) {
      toast.error("请先选择访谈语言和大纲调试语言");
      return;
    }

    if (selectedLanguage === outlineDebugLanguage) {
      toast.info("访谈语言和调试语言相同，无需本地化");
      return;
    }

    setIsLocalizing(true);
    try {
      console.log('🌐 Starting localization...', {
        targetLanguage: selectedLanguage,
        debugLanguage: outlineDebugLanguage,
        draftOutline: questions
      });

      const response = await apiClient.post(
        '/localize-outline',
        {
          draftOutline: questions,
          targetLanguage: selectedLanguage,
          researchObjective: interviewData.objective,
          studyName: interviewData.name,
          description: interviewData.description
        },
        { timeout: 120000 } // 120秒超时
      );

      console.log('✅ Localization response:', response.data);

      const localizedData = JSON.parse(response.data.response);

      // 详细日志：检查 OpenAI 返回的数据结构
      console.log('📊 Localized Data Structure:', {
        hasQuestions: !!localizedData.questions,
        questionsCount: localizedData.questions?.length || 0,
        hasDescription: !!localizedData.description,
        descriptionValue: localizedData.description || 'MISSING'
      });

      // 保持ID一致，只更新question内容
      const localizedQuestionsWithIds = localizedData.questions.map((q: any, index: number) => ({
        id: questions[index]?.id || uuidv4(),
        question: q.question,
        follow_up_count: q.follow_up_count || 1
      }));

      setLocalizedQuestions(localizedQuestionsWithIds);

      // 如果有本地化的 description，也更新
      if (localizedData.description) {
        console.log('✅ Updating description:', localizedData.description);
        // 🔧 修复：同时更新状态变量和 interviewData
        setDescription(localizedData.description); // 更新状态变量（用于保存）
        interviewData.description = localizedData.description; // 更新 interviewData（用于显示）
      } else {
        console.warn('⚠️ No description in localized data, keeping original');
      }

      setShowLocalized(true);
      toast.success("本地化完成！");
    } catch (error: any) {
      console.error('❌ Localization error:', error);
      toast.error("本地化失败: " + (error.response?.data?.details || error.message));
    } finally {
      setIsLocalizing(false);
    }
  };

  const onSave = async () => {
    try {
      console.log('🚀 Starting interview save process...');

      interviewData.user_id = user?.id || "";
      interviewData.organization_id = organization?.id || "";

      // 如果有本地化版本，保存本地化版本到questions字段（用于实际访谈）
      // 同时保存初稿和本地化版本到各自的字段
      interviewData.questions = localizedQuestions || questions;
      interviewData.description = description;

      // Convert BigInts to strings if necessary
      const sanitizedInterviewData = {
        ...interviewData,
        interviewer_id: interviewData.interviewer_id.toString(),
        response_count: interviewData.response_count.toString(),
        logo_url: organization?.imageUrl || null, // 使用null而不是空字符串
        // 添加大纲版本字段
        draft_outline: questions, // 初稿（调试语言版本）
        localized_outline: localizedQuestions || null, // 本地化版本（如果存在）
        outline_debug_language: outlineDebugLanguage || null,
        outline_interview_language: selectedLanguage || null,
      };

      console.log('📋 Interview data to save:', {
        organizationName: organization?.name,
        interviewData: sanitizedInterviewData,
        hasDraftOutline: !!questions,
        hasLocalizedOutline: !!localizedQuestions,
      });

      const response = await apiClient.post("/interviews", {
        organizationName: organization?.name,
        interviewData: sanitizedInterviewData,
      });

      console.log('✅ Interview created successfully:', response.data);
      setIsClicked(false);
      fetchInterviews();
      setOpen(false);
    } catch (error) {
      console.error("Error creating interview:", error);
    }
  };

  useEffect(() => {
    if (questions.length > prevQuestionLengthRef.current) {
      endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevQuestionLengthRef.current = questions.length;
  }, [questions.length]);

  return (
    <div>
      <div
        className={`text-center px-1 flex flex-col justify-top items-center w-[38rem] ${
          interviewData.question_count > 1 ? "h-[29rem]" : ""
        } `}
      >
        <div className="relative flex justify-center w-full">
          <ChevronLeft
            className="absolute left-0 opacity-50 cursor-pointer hover:opacity-100 text-gray-600 mr-36"
            size={30}
            onClick={() => {
              setProceed(false);
            }}
          />
          <h1 className="text-2xl font-semibold">Create Interview</h1>
        </div>
        <div className="my-3 text-left w-[96%] text-sm">
          {isDeepDiveMode
            ? "We will be using these session outlines during the deep dive interviews. Each session will be explored thoroughly before moving to the next. Please make sure they are ok."
            : "We will be using these questions during the interviews. Please make sure they are ok."
          }
        </div>

        {/* 版本切换和本地化按钮 */}
        {isDeepDiveMode && outlineDebugLanguage && selectedLanguage && outlineDebugLanguage !== selectedLanguage && (
          <div className="flex justify-between items-center w-full mb-3 px-2">
            <div className="flex gap-2">
              <Button
                variant={!showLocalized ? "default" : "outline"}
                size="sm"
                onClick={() => setShowLocalized(false)}
              >
                初稿 ({outlineDebugLanguage})
              </Button>
              {localizedQuestions && (
                <Button
                  variant={showLocalized ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowLocalized(true)}
                >
                  本地化版本 ({selectedLanguage})
                </Button>
              )}
            </div>
            {!localizedQuestions && (
              <Button
                onClick={onLocalize}
                disabled={isLocalizing}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Globe className="w-4 h-4 mr-2" />
                {isLocalizing ? "本地化中..." : "一键本地化"}
              </Button>
            )}
          </div>
        )}

        <ScrollArea className="flex flex-col justify-center items-center w-full mt-3">
          {(showLocalized && localizedQuestions ? localizedQuestions : questions).map((question, index) => (
            <QuestionCard
              key={question.id}
              questionNumber={index + 1}
              questionData={question}
              onDelete={showLocalized ? () => {} : handleDeleteQuestion} // 本地化版本不可删除
              onQuestionChange={showLocalized ? () => {} : handleInputChange} // 本地化版本不可编辑
              isDeepDiveMode={isDeepDiveMode}
            />
          ))}
          <div ref={endOfListRef} />
        </ScrollArea>
        {questions.length < interviewData.question_count ? (
          <div
            className="border-indigo-600 opacity-75 hover:opacity-100 w-fit  rounded-full"
            onClick={handleAddQuestion}
          >
            <Plus
              size={45}
              strokeWidth={2.2}
              className="text-indigo-600  cursor-pointer"
            />
          </div>
        ) : (
          <></>
        )}
      </div>
      <p className="mt-3 mb-1 ml-2 font-medium">
        Interview Description{" "}
        <span
          style={{ fontSize: "0.7rem", lineHeight: "0.66rem" }}
          className="font-light text-xs italic w-full text-left block"
        >
          Note: Interviewees will see this description.
        </span>
      </p>
      <textarea
        value={description}
        className="h-fit mt-3 mx-2 py-2 border-2 rounded-md px-2 w-full border-gray-400"
        placeholder="Enter your interview description."
        rows={3}
        onChange={(e) => {
          setDescription(e.target.value);
        }}
        onBlur={(e) => {
          setDescription(e.target.value.trim());
        }}
      />
      <div className="flex flex-row justify-end items-end w-full">
        <Button
          disabled={
            isClicked ||
            questions.length === 0 ||
            description.trim() === "" ||
            questions.some((question) => question.question.trim() === "")
          }
          className="bg-indigo-600 hover:bg-indigo-800 mr-5 mt-2"
          onClick={() => {
            setIsClicked(true);
            onSave();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
export default QuestionsPopup;
