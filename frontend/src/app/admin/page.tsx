"use client";

import React, { useState } from "react";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Search,
  Plus,
  Upload,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [usageFilter, setUsageFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Mock data
  const stats = {
    totalUsers: 1248,
    activeUsers: 1156,
    pendingUsers: 92,
    totalRevenue: 89400
  };

  const users = [
    {
      id: 1,
      name: "张三",
      phone: "13812345678",
      email: "zhangsan@company.com",
      company: "科技创新有限公司",
      department: "技术部门",
      status: "active",
      statusLabel: "已启用",
      credit: 1250,
      creditNote: "领会额度"
    },
    {
      id: 2,
      name: "李四",
      phone: "13987654321",
      email: "lisi@enterprise.com",
      company: "智能制造集团",
      department: "市场部",
      status: "pending",
      statusLabel: "待审核",
      credit: 500,
      creditNote: "初始额度"
    },
    {
      id: 3,
      name: "王五",
      phone: "13611223344",
      email: "wangwu@corp.com",
      company: "数字化咨询公司",
      department: "咨询团队",
      status: "disabled",
      statusLabel: "已禁用",
      credit: 0,
      creditNote: "账户冻结"
    }
  ];

  const totalPages = 25;

  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "bg-green-500";
      case "pending": return "bg-orange-500";
      case "disabled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <a href="/dashboard" className="hover:text-blue-600">首页</a>
          <span>›</span>
          <span className="text-gray-900">管理员</span>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">管理员仪表盘</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">总用户数</span>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">系统注册用户总数</div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">活跃用户</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.activeUsers.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">当前活跃用户数量</div>
          </div>

          {/* Pending Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">待审核用户</span>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600">{stats.pendingUsers}</div>
            <div className="text-xs text-gray-500 mt-2">等待审核的用户</div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">总收益金额</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">¥{stats.totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">所有用户累计消费</div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">用户管理</h2>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索用户名称或公司名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">全部状态</option>
                <option value="active">已启用</option>
                <option value="pending">待审核</option>
                <option value="disabled">已禁用</option>
              </select>

              <select
                value={usageFilter}
                onChange={(e) => setUsageFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">全部使用</option>
                <option value="high">高频使用</option>
                <option value="medium">中频使用</option>
                <option value="low">低频使用</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                添加用户
              </Button>
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                <Upload className="w-4 h-4 mr-2" />
                批量注册
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    用户信息 ↑↓
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    公司信息 ↑↓
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    账户状态 ↑↓
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    信用余额 ↑↓
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${
                          user.status === 'active' ? 'bg-blue-500' : 
                          user.status === 'pending' ? 'bg-green-500' : 
                          'bg-red-500'
                        } flex items-center justify-center text-white font-semibold`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{user.company}</div>
                      <div className="text-sm text-gray-500">{user.department}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)} text-white`}>
                        {user.statusLabel}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">¥{user.credit.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{user.creditNote}</div>
                    </td>
                    <td className="py-4 px-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">已选择 {selectedUsers.length} 个用户</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  批量启用
                </button>
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  批量禁用
                </button>
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  批量审核通过
                </button>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <ChevronLeft className="w-4 h-4 -ml-3" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-1">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span className="w-8 h-8 flex items-center justify-center">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
                <ChevronRight className="w-4 h-4 -ml-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

