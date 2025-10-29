/**
 * SkeletonReview Component
 * 
 * 用于显示和编辑大纲骨架
 * 
 * 功能：
 * - 显示所有 Sessions 的骨架
 * - 支持编辑 Session 标题、目标、背景信息
 * - 确认后生成完整大纲
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SessionCard } from './SessionCard';
import { OutlineSkeleton, SkeletonSession } from '@/types/interview';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface SkeletonReviewProps {
  skeleton: OutlineSkeleton;
  onUpdate: (updatedSkeleton: OutlineSkeleton) => void;
}

export const SkeletonReview: React.FC<SkeletonReviewProps> = ({
  skeleton,
  onUpdate,
}) => {
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(
    new Set([1]) // 默认展开第一个 Session
  );

  // 更新单个 Session
  const handleUpdateSession = (updatedSession: SkeletonSession) => {
    const updatedSessions = skeleton.sessions.map(s =>
      s.session_number === updatedSession.session_number ? updatedSession : s
    );
    
    onUpdate({
      ...skeleton,
      sessions: updatedSessions
    });
  };

  // 切换 Session 展开状态
  const toggleSession = (sessionNumber: number) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionNumber)) {
      newExpanded.delete(sessionNumber);
    } else {
      newExpanded.add(sessionNumber);
    }
    setExpandedSessions(newExpanded);
  };

  // 展开所有 Sessions
  const expandAll = () => {
    setExpandedSessions(new Set(skeleton.sessions.map(s => s.session_number)));
  };

  // 折叠所有 Sessions
  const collapseAll = () => {
    setExpandedSessions(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Review Interview Skeleton</h3>
          <p className="text-sm text-gray-600 mt-1">
            Review and edit the session structure before generating detailed questions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="text-xs"
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="text-xs"
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Sessions:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {skeleton.metadata.total_sessions}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Estimated Duration:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {skeleton.metadata.estimated_duration_minutes} minutes
            </span>
          </div>
          <div>
            <span className="text-gray-600">Language:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {skeleton.metadata.draft_language}
            </span>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="space-y-4">
        {skeleton.sessions.map((session) => (
          <SessionCard
            key={session.session_number}
            session={session}
            onUpdate={handleUpdateSession}
            isExpanded={expandedSessions.has(session.session_number)}
            onToggle={() => toggleSession(session.session_number)}
          />
        ))}
      </div>
    </div>
  );
};

