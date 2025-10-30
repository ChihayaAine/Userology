import { useState } from "react";
import { useClerk, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { InterviewBase } from "@/types/interview";
import { useInterviews } from "@/contexts/interviews.context";
import { useInterviewStore } from "@/store/interview-store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Copy, Check, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/services/api";
import { LanguageCode } from "@/lib/languages";

interface Props {
  interviewData: InterviewBase;
  setProceed: (proceed: boolean) => void;
  setOpen: (open: boolean) => void;
  outlineDebugLanguage?: LanguageCode | '';
  selectedLanguage?: LanguageCode | '';
  localizedQuestions: any[] | null;
  draftQuestions: any[];
}

function DistributePopup({ 
  interviewData, 
  setProceed, 
  setOpen,
  outlineDebugLanguage,
  selectedLanguage,
  localizedQuestions,
  draftQuestions
}: Props) {
  const router = useRouter();
  const { user } = useClerk();
  const { organization } = useOrganization();
  const { fetchInterviews } = useInterviews();
  const { interviewId, addCompletedStep } = useInterviewStore();
  const [isCreating, setIsCreating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<'draft' | 'localized'>(
    localizedQuestions && localizedQuestions.length > 0 ? 'localized' : 'draft'
  );

  // 生成访谈链接（使用真实的interview ID）
  const interviewLink = interviewId 
    ? `https://userology.xin/call/${interviewId}` 
    : `https://userology.xin/interview/preview`;

  // 复制链接
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(interviewLink);
      setCopiedLink(true);
      toast.success("链接已复制到剪贴板");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast.error("复制失败，请手动复制");
    }
  };

  // 确认并完成分发
  const onConfirmAndDistribute = async () => {
    if (!interviewId) {
      toast.error("访谈ID不存在，请返回重新保存");
      return;
    }

    try {
      setIsCreating(true);
      
      // 根据选择的版本更新 questions 和 draft 字段
      const updatePayload: any = {
        draft: selectedVersion, // 保存选择的版本：'draft' 或 'localized'
      };
      
      if (selectedVersion === 'localized' && localizedQuestions) {
        // 本地化版本：使用本地化的问题
        updatePayload.questions = localizedQuestions;
        console.log('📝 Using localized version (questions + description)');
      } else {
        // 初稿版本：使用初稿问题
        updatePayload.questions = draftQuestions;
        console.log('📝 Using draft version (questions + description)');
      }
      
      await apiClient.patch(`/interviews/${interviewId}`, updatePayload);
      
      console.log('✅ Interview updated with draft field:', selectedVersion);
      toast.success("访谈已准备就绪，可以分发了！");
    } catch (error) {
      console.error("Error updating interview:", error);
      toast.error("更新访谈失败");
      return;
    } finally {
      setIsCreating(false);
    }

    fetchInterviews();
    addCompletedStep('analysis');
    router.push(`/interviews/${interviewId}`);
  };

  return (
    <div className="w-full bg-transparent">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">访谈分发</h1>
        <p className="text-sm text-gray-600">
          在这里，您可以预览访谈问题，选择访谈大纲版本，然后启动分发。
        </p>
      </div>

      {/* Interview Overview Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">访谈名称</div>
            <div className="text-base font-semibold text-gray-900">
              {interviewData.name || "未命名访谈"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">调研目标</div>
            <div className="text-base font-semibold text-gray-900">
              {interviewData.objective || "无"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">预计会话时长</div>
            <div className="text-base font-semibold text-gray-900">
              {interviewData.time_duration || "15-20 分钟"}
            </div>
          </div>
        </div>
      </div>

      {/* Interview Link Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">访谈链接</h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600">已访问:</span>
            <span className="badge badge-success badge-lg">0</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
          >
            换链接
          </Button>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm text-gray-600">分享此链接给受访者</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={interviewLink}
              readOnly
              className="input input-bordered flex-1 bg-gray-50"
            />
            <Button
              onClick={handleCopyLink}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  复制链接
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Version Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">选择访谈大纲版本</h2>
        <p className="text-sm text-gray-600 mb-4">
          选择要用于此次访谈的大纲版本
        </p>

        <div className="space-y-3">
          {/* Draft Version */}
          <label className={`card cursor-pointer transition-all ${
            selectedVersion === 'draft' 
              ? 'bg-blue-50 border-2 border-blue-500' 
              : 'bg-white border-2 border-gray-200 hover:border-gray-300'
          }`}>
            <div className="card-body p-4">
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="version"
                  className="radio radio-primary mt-1"
                  checked={selectedVersion === 'draft'}
                  onChange={() => setSelectedVersion('draft')}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">初稿版本</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    AI生成的原始大纲，使用{outlineDebugLanguage || '简体中文'}编写
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>语言: {outlineDebugLanguage || '简体中文'}</span>
                  </div>
                </div>
              </div>
            </div>
          </label>

          {/* Localized Version */}
          {localizedQuestions && localizedQuestions.length > 0 && (
            <label className={`card cursor-pointer transition-all ${
              selectedVersion === 'localized' 
                ? 'bg-blue-50 border-2 border-blue-500' 
                : 'bg-white border-2 border-gray-200 hover:border-gray-300'
            }`}>
              <div className="card-body p-4">
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="version"
                    className="radio radio-primary mt-1"
                    checked={selectedVersion === 'localized'}
                    onChange={() => setSelectedVersion('localized')}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">本地化版本</h3>
                      <span className="badge badge-primary badge-sm">推荐</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      根据访谈语言本地化后的大纲，表达更自然流畅
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>目标语言: {selectedLanguage || '简体中文'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex justify-center items-center gap-4 pt-6 mt-6 border-t border-gray-200">
        <Button
          variant="outline"
          className="px-8 py-6 h-12 text-base"
          onClick={() => setProceed(true)} // 这里设为true会回到QuestionsPopup
          disabled={isCreating}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          返回编辑大纲
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 h-12 text-base shadow-sm"
          onClick={onConfirmAndDistribute}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <span className="loading loading-spinner loading-sm mr-2"></span>
              创建中...
            </>
          ) : (
            <>
              确认并分发 →
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default DistributePopup;

