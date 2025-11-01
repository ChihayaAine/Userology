"use client";

import React, { useState } from "react";
import { Home, Settings, HelpCircle, ChevronDown, CheckCircle2, Circle, Lock } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useInterviewStore } from "@/store/interview-store";

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const clerk = useClerk();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // 从store获取已完成步骤和访谈ID
  const { completedSteps, interviewId, resetStore } = useInterviewStore();

  // 检查是否在创建调研流程中
  // 1. 在创建调研页面
  // 2. 在访谈详情页面，并且有已完成的步骤（说明是从创建流程进入的）
  const isCreateFlow = pathname?.startsWith('/dashboard/create-interview') || 
    (pathname?.startsWith('/interviews/') && completedSteps.length > 0);
  
  // 确定当前步骤
  const getCurrentStep = () => {
    if (pathname?.startsWith('/interviews/')) return 'analysis';
    if (pathname?.includes('/distribute')) return 'distribute';
    if (pathname?.includes('/edit-outline')) return 'edit';
    if (pathname?.includes('/outline')) return 'generate';
    if (pathname?.includes('/create-interview')) return 'define';
    return null;
  };
  
  const currentStep = getCurrentStep();
  
  // 创建调研的步骤（5步）
  const createSteps = [
    { id: 'define', label: '定义调研', path: '/dashboard/create-interview' },
    { id: 'generate', label: '生成大纲', path: '/dashboard/create-interview/outline' },
    { id: 'edit', label: '编辑大纲', path: '/dashboard/create-interview/edit-outline' },
    { id: 'distribute', label: '分发调研', path: '/dashboard/create-interview/distribute' },
    { id: 'analysis', label: '访谈分析', path: '' }, // path在点击时动态设置
  ];

  // 判断步骤是否可以访问
  const canAccessStep = (stepId: string) => {
    // 定义调研永远可以访问（第一步）
    if (stepId === 'define') return true;
    
    // 只有已经访问过的步骤才能访问（不能跳过步骤）
    return completedSteps.includes(stepId);
  };

  // 处理步骤点击
  const handleStepClick = (step: { id: string; path: string }) => {
    console.log('🔘 Step clicked:', step.id);
    console.log('🔘 InterviewId in store:', interviewId);
    console.log('🔘 Can access?', canAccessStep(step.id));
    
    if (canAccessStep(step.id)) {
      // 如果是访谈分析步骤，需要使用 interviewId
      if (step.id === 'analysis' && interviewId) {
        router.push(`/interviews/${interviewId}`);
      } else if (step.path) {
        console.log('🔘 Navigating to:', step.path);
        router.push(step.path);
      }
    }
  };

  return (
    <div className="z-[10] bg-white border-r border-gray-200 w-[200px] fixed top-[64px] left-0 h-full flex flex-col">
      <div className="flex flex-col gap-1 p-4 flex-1">
        {/* 首页与我的调研 */}
        <div
          className={`flex flex-row items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
            pathname.endsWith("/dashboard") || pathname.includes("/interviews")
              ? "bg-blue-100 text-blue-700"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          onClick={() => {
            // 点击首页时，无论在哪个步骤都重置store并返回首页
            console.log('🏠 Navigating to home, resetting store');
            resetStore();
            router.push("/dashboard");
          }}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium text-sm">首页与我的调研</span>
        </div>

        {/* 创建调研流程步骤 */}
        {isCreateFlow && (
          <div className="mt-4 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs font-semibold text-blue-700 mb-3">创建调研流程</div>
            <div className="space-y-2">
              {createSteps.map((step, index) => {
                const stepIndex = createSteps.findIndex(s => s.id === currentStep);
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = step.id === currentStep;
                const isAccessible = canAccessStep(step.id);
                const isLocked = !isAccessible;
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 text-xs transition-all ${
                      isCurrent ? 'text-blue-700 font-semibold' : 
                      isCompleted ? 'text-green-600' : 
                      isLocked ? 'text-gray-400' : 'text-gray-600'
                    } ${
                      isAccessible ? 'cursor-pointer hover:bg-blue-100 rounded px-2 py-1 -mx-2 -my-1' : 'cursor-not-allowed'
                    }`}
                    onClick={() => handleStepClick(step)}
                  >
                    {isLocked ? (
                      <Lock className="w-4 h-4 flex-shrink-0" />
                    ) : isCompleted && !isCurrent ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <Circle className={`w-4 h-4 flex-shrink-0 ${isCurrent ? 'fill-blue-600 text-blue-600' : ''}`} />
                    )}
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 设置 */}
        <div className="mt-4">
          <div
            className="flex flex-row items-center justify-between gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 text-gray-700 transition-colors"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              <span className="font-medium text-sm">设置</span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`}
            />
          </div>
          {settingsOpen && (
            <div className="ml-8 mt-1 space-y-1">
              <div 
                className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => clerk.openUserProfile()}
              >
                账户设置
              </div>
              <div 
                className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => router.push('/admin')}
              >
                团队管理
              </div>
            </div>
          )}
        </div>

        {/* 帮助与支持 */}
        <div
          className="flex flex-row items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => {}}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium text-sm">帮助与支持</span>
        </div>
      </div>

      {/* 底部版本号 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">U</span>
          </div>
          <span className="text-sm">U-Spark v1.0</span>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
