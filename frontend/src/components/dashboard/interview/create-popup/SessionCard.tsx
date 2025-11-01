/**
 * SessionCard Component
 * 
 * 用于显示和编辑大纲骨架中的单个 Session
 * 
 * 功能：
 * - 显示 Session 编号、标题、目标
 * - 可折叠的背景信息列表
 * - 支持编辑所有字段
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Check, X, Plus, Trash2, Info } from 'lucide-react';
import { SkeletonSession, SessionDepthLevel } from '@/types/interview';

interface SessionCardProps {
  session: SkeletonSession;
  onUpdate: (updatedSession: SkeletonSession) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onUpdate,
  isExpanded = false,
  onToggle
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [showDepthLevelInfo, setShowDepthLevelInfo] = useState(false);
  const [editedTitle, setEditedTitle] = useState(session.session_title);
  const [editedGoal, setEditedGoal] = useState(session.session_goal);
  const [editingBackgroundIndex, setEditingBackgroundIndex] = useState<number | null>(null);
  const [editedBackground, setEditedBackground] = useState('');
  const [editingMustAskIndex, setEditingMustAskIndex] = useState<number | null>(null);
  const [editedMustAsk, setEditedMustAsk] = useState('');

  // 保存标题
  const handleSaveTitle = () => {
    onUpdate({
      ...session,
      session_title: editedTitle
    });
    setIsEditingTitle(false);
  };

  // 保存目标
  const handleSaveGoal = () => {
    onUpdate({
      ...session,
      session_goal: editedGoal
    });
    setIsEditingGoal(false);
  };

  // 保存背景信息
  const handleSaveBackground = (index: number) => {
    const newBackgroundInfo = [...session.background_information];
    newBackgroundInfo[index] = editedBackground;
    onUpdate({
      ...session,
      background_information: newBackgroundInfo
    });
    setEditingBackgroundIndex(null);
    setEditedBackground('');
  };

  // 删除背景信息
  const handleDeleteBackground = (index: number) => {
    const newBackgroundInfo = session.background_information.filter((_, i) => i !== index);
    onUpdate({
      ...session,
      background_information: newBackgroundInfo
    });
  };

  // 添加新的背景信息
  const handleAddBackground = () => {
    const newBackgroundInfo = [...session.background_information, ''];
    onUpdate({
      ...session,
      background_information: newBackgroundInfo
    });
    setEditingBackgroundIndex(newBackgroundInfo.length - 1);
    setEditedBackground('');
  };

  // 保存必问问题
  const handleSaveMustAsk = (index: number) => {
    const newMustAskQuestions = [...(session.must_ask_questions || [])];
    newMustAskQuestions[index] = editedMustAsk;
    onUpdate({
      ...session,
      must_ask_questions: newMustAskQuestions
    });
    setEditingMustAskIndex(null);
    setEditedMustAsk('');
  };

  // 删除必问问题
  const handleDeleteMustAsk = (index: number) => {
    const newMustAskQuestions = (session.must_ask_questions || []).filter((_, i) => i !== index);
    onUpdate({
      ...session,
      must_ask_questions: newMustAskQuestions
    });
  };

  // 添加新的必问问题
  const handleAddMustAsk = () => {
    const newMustAskQuestions = [...(session.must_ask_questions || []), ''];
    onUpdate({
      ...session,
      must_ask_questions: newMustAskQuestions
    });
    setEditingMustAskIndex(newMustAskQuestions.length - 1);
    setEditedMustAsk('');
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Session Number and Title */}
            <div className="flex items-center gap-3 mb-2">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-sm">
                {session.session_number}
              </span>
              
              {isEditingTitle ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') {
                        setEditedTitle(session.session_title);
                        setIsEditingTitle(false);
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditedTitle(session.session_title);
                      setIsEditingTitle(false);
                    }}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-2 group">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {session.session_title}
                  </h3>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-opacity"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Session Goal */}
            {isEditingGoal ? (
              <div className="flex items-start gap-2 mt-2">
                <textarea
                  value={editedGoal}
                  onChange={(e) => setEditedGoal(e.target.value)}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setEditedGoal(session.session_goal);
                      setIsEditingGoal(false);
                    }
                  }}
                />
                <div className="flex flex-col gap-1">
                  <button
                    onClick={handleSaveGoal}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditedGoal(session.session_goal);
                      setIsEditingGoal(false);
                    }}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="group flex items-start gap-2">
                <p className="text-sm text-gray-600 flex-1">
                  <span className="font-medium">Goal:</span> {session.session_goal}
                </p>
                <button
                  onClick={() => setIsEditingGoal(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-opacity"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}

            {/* Depth Level Selector */}
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Depth Level:</span>
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as SessionDepthLevel[]).map((level) => {
                    const currentDepthLevel = session.depth_level || 'medium'; // 默认 medium
                    const isSelected = currentDepthLevel === level;
                    const colors = {
                      low: isSelected ? 'bg-gray-200 text-gray-800 border-gray-300' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
                      medium: isSelected ? 'bg-blue-200 text-blue-800 border-blue-300' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
                      high: isSelected ? 'bg-purple-200 text-purple-800 border-purple-300' : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
                    };
                    const labels = {
                      low: '2-4 Qs',
                      medium: '4-5 Qs',
                      high: '5-6 Qs'
                    };

                    return (
                      <button
                        key={level}
                        onClick={() => onUpdate({ ...session, depth_level: level })}
                        className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${colors[level]}`}
                        title={`${level.charAt(0).toUpperCase() + level.slice(1)} priority - ${labels[level]}`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)} ({labels[level]})
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-gray-400 ml-1">
                  (AI suggested: {session.ai_suggested_depth_level || session.depth_level || 'medium'})
                </span>
                {/* Info Button */}
                <button
                  onClick={() => setShowDepthLevelInfo(!showDepthLevelInfo)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="了解 Depth Level 的作用"
                >
                  <Info size={14} />
                </button>
              </div>

              {/* Depth Level Info Tooltip */}
              {showDepthLevelInfo && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-700">
                  <p className="font-semibold text-blue-900 mb-1">💡 Depth Level 不仅关乎问题数量</p>
                  <p className="mb-2">Depth Level 会影响访谈执行时的多个维度：</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li><strong>问题数量</strong>：High (5-6), Medium (4-5), Low (2-4)</li>
                    <li><strong>追问深度</strong>：High 会进行多层次追问（L1→L2→L3），Low 仅基础追问</li>
                    <li><strong>时间分配</strong>：AI 会在 High 优先级 Session 上分配更多时间</li>
                    <li><strong>重视程度</strong>：High 优先级的 Session 会更深入探索用户痛点和需求</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={onToggle}
            className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Background Information (Collapsible) */}
      {isExpanded && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Background Information</h4>
            <button
              onClick={handleAddBackground}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          <ul className="space-y-2">
            {session.background_information.map((info, index) => (
              <li key={index} className="group flex items-start gap-2">
                {editingBackgroundIndex === index ? (
                  <>
                    <textarea
                      value={editedBackground}
                      onChange={(e) => setEditedBackground(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditingBackgroundIndex(null);
                          setEditedBackground('');
                        }
                      }}
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleSaveBackground(index)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingBackgroundIndex(null);
                          setEditedBackground('');
                        }}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400 mt-2"></span>
                    <p className="flex-1 text-sm text-gray-700">{info}</p>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingBackgroundIndex(index);
                          setEditedBackground(info);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteBackground(index)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          {session.background_information.length === 0 && (
            <p className="text-sm text-gray-400 italic">No background information yet. Click "Add" to create one.</p>
          )}

          {/* Must-Ask Questions Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">必问问题</h4>
              <button
                onClick={handleAddMustAsk}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Plus size={14} />
                Add
              </button>
            </div>

            <ul className="space-y-2">
              {(session.must_ask_questions || []).map((question, index) => (
                <li key={index} className="group flex items-start gap-2">
                  {editingMustAskIndex === index ? (
                    <>
                      <textarea
                        value={editedMustAsk}
                        onChange={(e) => setEditedMustAsk(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditingMustAskIndex(null);
                            setEditedMustAsk('');
                          }
                        }}
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleSaveMustAsk(index)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingMustAskIndex(null);
                            setEditedMustAsk('');
                          }}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400 mt-2"></span>
                      <p className="flex-1 text-sm text-gray-700">{question}</p>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingMustAskIndex(index);
                            setEditedMustAsk(question);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteMustAsk(index)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {(!session.must_ask_questions || session.must_ask_questions.length === 0) && (
              <p className="text-sm text-gray-400 italic">No must-ask questions yet. Click "Add" to create one.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

