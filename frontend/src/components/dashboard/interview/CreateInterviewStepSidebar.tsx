"use client";

import React from "react";
import { Check, Lock, FileEdit, ClipboardList, Share2, Users, BarChart3 } from "lucide-react";

interface Step {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface CreateInterviewStepSidebarProps {
  currentStep: 'define' | 'outline' | 'distribute' | 'collect' | 'analyze';
  completedSteps: string[];
}

export default function CreateInterviewStepSidebar({ 
  currentStep, 
  completedSteps 
}: CreateInterviewStepSidebarProps) {
  const steps: Step[] = [
    {
      id: 'define',
      title: '调研创建',
      icon: <FileEdit className="w-5 h-5" />,
      description: '定义调研目标和参数',
    },
    {
      id: 'outline',
      title: '编辑大纲',
      icon: <ClipboardList className="w-5 h-5" />,
      description: '设计访谈问题',
    },
    {
      id: 'distribute',
      title: '分发访谈',
      icon: <Share2 className="w-5 h-5" />,
      description: '分享访谈链接',
    },
    {
      id: 'collect',
      title: '数据收集',
      icon: <Users className="w-5 h-5" />,
      description: '等待用户反馈',
    },
    {
      id: 'analyze',
      title: '结果分析',
      icon: <BarChart3 className="w-5 h-5" />,
      description: '查看分析报告',
    },
  ];

  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    
    // 检查是否可以访问（前面的步骤都完成了）
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex <= currentIndex) return 'accessible';
    
    return 'locked';
  };

  const renderStepIcon = (step: Step) => {
    const status = getStepStatus(step.id);
    
    if (status === 'completed') {
      return (
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
          <Check className="w-5 h-5" />
        </div>
      );
    }
    
    if (status === 'current') {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
          {step.icon}
        </div>
      );
    }
    
    if (status === 'accessible') {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
          {step.icon}
        </div>
      );
    }
    
    // locked
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
        <Lock className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 fixed top-[64px] left-[200px] h-[calc(100vh-64px)] overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">创建调研流程</h2>
        <p className="text-sm text-gray-500">按照步骤完成调研创建</p>
      </div>

      <div className="space-y-1">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="relative">
              <div
                className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                  status === 'current'
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : status === 'completed'
                    ? 'bg-green-50 border border-green-200'
                    : status === 'accessible'
                    ? 'bg-gray-50 border border-gray-200'
                    : 'bg-gray-50 border border-gray-100 opacity-60'
                }`}
              >
                <div className="flex-shrink-0">
                  {renderStepIcon(step)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-semibold ${
                        status === 'current'
                          ? 'text-blue-900'
                          : status === 'completed'
                          ? 'text-green-900'
                          : status === 'accessible'
                          ? 'text-gray-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </h3>
                    {status === 'locked' && (
                      <Lock className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      status === 'current'
                        ? 'text-blue-600'
                        : status === 'completed'
                        ? 'text-green-600'
                        : status === 'accessible'
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* 连接线 */}
              {!isLast && (
                <div className="flex justify-start ml-[30px] h-4">
                  <div
                    className={`w-0.5 h-full ${
                      completedSteps.includes(step.id)
                        ? 'bg-green-300'
                        : step.id === currentStep
                        ? 'bg-blue-300'
                        : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-sm font-bold">💡</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">提示</h4>
            <p className="text-xs text-blue-700">
              完成每个步骤后会自动解锁下一步。您可以随时返回修改已完成的步骤。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

