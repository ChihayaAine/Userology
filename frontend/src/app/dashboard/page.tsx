"use client";

import React, { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { useInterviews } from "@/contexts/interviews.context";
import Modal from "@/components/dashboard/Modal";
import { 
  Gem, 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  MessageCircle,
  TrendingUp,
  Search,
  Sparkles,
  AlertTriangle,
  Users,
  BarChart3,
  Lightbulb,
  MoreVertical,
  Target,
  PlayCircle
} from "lucide-react";
import Image from "next/image";
import Footer from "@/components/layout/Footer";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "ongoing" | "completed">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    totalInterviews: 0
  });

  // Debug logging
  useEffect(() => {
    console.log('📊 Dashboard - Interviews state:', {
      interviewsCount: interviews.length,
      interviewsLoading,
      interviews: interviews.map(i => ({ id: i.id, name: i.name }))
    });
  }, [interviews, interviewsLoading]);

  // Calculate statistics
  useEffect(() => {
    const ongoing = interviews.filter(i => i.is_active).length;
    const completed = interviews.filter(i => !i.is_active).length;
    const totalInterviews = interviews.reduce((sum, i) => {
      const count = typeof i.response_count === 'bigint' 
        ? Number(i.response_count) 
        : (i.response_count || 0);
      return sum + count;
    }, 0);
    
    setStats({
      total: interviews.length,
      ongoing,
      completed,
      totalInterviews
    });
  }, [interviews]);

  function InterviewsLoader() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-200" />
        ))}
        </div>
    );
  }

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
            if (data.plan === "free_trial_over") {
              setIsModalOpen(true);
            }
          }
          if (data?.allowed_responses_count) {
            setAllowedResponsesCount(data.allowed_responses_count);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  useEffect(() => {
    const fetchResponsesCount = async () => {
      if (!organization || currentPlan !== "free") {
        return;
      }

      setLoading(true);
      try {
        const totalResponses =
          await ResponseService.getResponseCountByOrganizationId(
            organization.id,
          );
        const hasExceededLimit = totalResponses >= allowedResponsesCount;
        if (hasExceededLimit) {
          setCurrentPlan("free_trial_over");
          await InterviewService.deactivateInterviewsByOrgId(organization.id);
          await ClientService.updateOrganization(
            { plan: "free_trial_over" },
            organization.id,
          );
        }
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponsesCount();
  }, [organization, currentPlan, allowedResponsesCount]);

  // Filter interviews based on search and status
  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const isOngoing = interview.is_active;
    const matchesFilter = 
      filterStatus === "all" || 
      (filterStatus === "ongoing" && isOngoing) ||
      (filterStatus === "completed" && !isOngoing);
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInterviews = filteredInterviews.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  return (
    <>
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-6">
      {/* Dashboard Overview Statistics */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Research Studies */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">总调研数</h3>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <span className="text-sm opacity-90">+{Math.floor(stats.total * 0.2)} 本月</span>
            </div>
          </div>

          {/* Ongoing Projects */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">进行中</h3>
                <p className="text-3xl font-bold mt-2">{stats.ongoing}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <AlertTriangle className="w-4 h-4 text-yellow-300" />
              <span className="text-sm opacity-90">{Math.ceil(stats.ongoing * 0.6)}个待处理</span>
            </div>
          </div>

          {/* Completed Projects */}
          <div className="bg-gradient-to-br from-red-400 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">已完成</h3>
                <p className="text-3xl font-bold mt-2">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-sm opacity-90">100% 成功率</span>
            </div>
          </div>

          {/* Total Interviews */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">总访谈数</h3>
                <p className="text-3xl font-bold mt-2">{stats.totalInterviews}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <span className="text-sm opacity-90">+{Math.floor(stats.totalInterviews * 0.25)} 本周</span>
            </div>
          </div>
        </div>
      </section>

      {/* Start New Research CTA */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">立即开始新的调研</h2>
              <p className="text-lg opacity-90 mb-6">
                借助AI赋能，快速开启您的用户洞察之旅
              </p>
              <button 
                onClick={() => router.push('/dashboard/create-interview')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                开始新调研
              </button>
            </div>
            <div className="flex-shrink-0">
              <div className="w-72 h-48 bg-white/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-24 h-24 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research List with Filters */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Title and Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">我的调研项目</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search Box */}
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="搜索调研项目..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-300 rounded-l-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
              {/* Filter Buttons */}
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 transition-colors ${
                    filterStatus === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setFilterStatus("ongoing")}
                  className={`px-4 py-2 border-x border-gray-300 transition-colors ${
                    filterStatus === "ongoing"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  进行中
                </button>
                <button
                  onClick={() => setFilterStatus("completed")}
                  className={`px-4 py-2 transition-colors ${
                    filterStatus === "completed"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  已完成
                </button>
              </div>
            </div>
                </div>

          {/* Research Projects List */}
          {interviewsLoading || loading ? (
            <InterviewsLoader />
          ) : filteredInterviews.length > 0 ? (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginatedInterviews.map((interview) => {
                const isOngoing = interview.is_active;
                const responseCount = typeof interview.response_count === 'bigint' 
                  ? Number(interview.response_count) 
                  : (interview.response_count || 0);
                const progress = responseCount && interview.question_count 
                  ? Math.min((responseCount / (interview.question_count * 5)) * 100, 100)
                  : 0;

                return (
                  <div
                    key={interview.id}
                    className="bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer p-6"
                    onClick={() => router.push(`/interviews/${interview.id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold flex-1">
                        {interview.name || "未命名调研"}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isOngoing
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isOngoing ? "进行中" : "已完成"}
                      </span>
                      <span className="text-sm text-gray-500">
                        创建于 {new Date(interview.created_at || "").toLocaleDateString('zh-CN')}
                      </span>
                    </div>

                    <div className="mb-4 flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{responseCount}个访谈</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/interviews/${interview.id}`);
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        进入调研
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/interviews/${interview.id}`);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    const showEllipsis = 
                      (page === currentPage - 2 && currentPage > 3) ||
                      (page === currentPage + 2 && currentPage < totalPages - 2);
                    
                    if (showEllipsis) {
                      return <span key={page} className="px-2 py-2 text-gray-400">...</span>;
                    }
                    
                    if (!showPage) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
                
                <span className="ml-4 text-sm text-gray-600">
                  共 {filteredInterviews.length} 个项目，第 {currentPage}/{totalPages} 页
                </span>
              </div>
            )}
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无调研项目</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Section: Recent Activity & Usage Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-500" />
            近期活动
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">创建了新调研项目</p>
                <p className="text-sm text-gray-600">
                  {interviews[0]?.name || "新项目"}
                </p>
                <p className="text-xs text-gray-400 mt-1">2小时前</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">完成了访谈</p>
                <p className="text-sm text-gray-600">用户体验调研 - 访谈#8</p>
                <p className="text-xs text-gray-400 mt-1">1天前</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">AI生成了新洞察</p>
                <p className="text-sm text-gray-600">产品优化项目</p>
                <p className="text-xs text-gray-400 mt-1">2天前</p>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-red-400" />
            使用指引与AI洞察
          </h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-200 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">新手入门</h3>
                  <p className="text-sm text-gray-600">快速了解平台功能</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-200 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold">发现新功能</h3>
                  <p className="text-sm text-gray-600">AI智能分析已上线</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-red-200 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">AI推荐洞察</h3>
                  <p className="text-sm text-gray-600">基于您的调研历史</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Upgrade Modal */}
              {isModalOpen && (
                <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-center text-indigo-600">
                      <Gem />
                    </div>
                    <h3 className="text-xl font-semibold text-center">
                      Upgrade to Pro
                    </h3>
                    <p className="text-l text-center">
                      You have reached your limit for the free trial. Please
                      upgrade to pro to continue using our features.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex justify-center items-center">
                        <Image
                          src={"/premium-plan-icon.png"}
                          alt="Graphic"
                          width={299}
                          height={300}
                        />
                      </div>

                      <div className="grid grid-rows-2 gap-2">
                        <div className="p-4 border rounded-lg">
                          <h4 className="text-lg font-medium">Free Plan</h4>
                          <ul className="list-disc pl-5 mt-2">
                            <li>10 User Interviews</li>
                            <li>Basic Support</li>
                            <li>Limited Features</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="text-lg font-medium">Pro Plan</h4>
                          <ul className="list-disc pl-5 mt-2">
                            <li>Flexible Pay-Per-Interview</li>
                            <li>Priority Support</li>
                            <li>All Features</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <p className="text-l text-center">
                      Contact{" "}
                      <span className="font-semibold">founders@userology.co</span>{" "}
                      to upgrade your plan.
                    </p>
                  </div>
                </Modal>
              )}
      </div>
    </main>
    <Footer />
    </>
  );
}

export default Interviews;
