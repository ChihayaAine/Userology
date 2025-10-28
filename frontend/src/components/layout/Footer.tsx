'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 左侧：Logo和描述 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-xl font-bold text-gray-900">U-Spark</span>
            </div>
            <p className="text-sm text-gray-600">
              智能用户调研解决方案
            </p>
            <p className="text-sm text-gray-500">
              利用AI技术为企业提供高效、智能的用户调研服务，帮助您深入了解用户需求，做出更好的产品决策。
            </p>
          </div>

          {/* 产品功能 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">产品功能</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  智能调研设计
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  AI访谈生成
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  数据智能分析
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  洞察自动生成
                </Link>
              </li>
            </ul>
          </div>

          {/* 帮助支持 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">帮助支持</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  使用指南
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  API文档
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  最佳实践
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  技术支持
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  联系我们
                </Link>
              </li>
            </ul>
          </div>

          {/* 相关链接 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">相关链接</h3>
            <ul className="space-y-3 mb-6">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  隐私政策
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  服务条款
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  安全保障
                </Link>
              </li>
            </ul>
            
            {/* 联系方式 */}
            <div className="space-y-2">
              <a 
                href="mailto:support@airesearch.com" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Mail size={16} />
                <span>support@airesearch.com</span>
              </a>
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <MessageCircle size={16} />
                <span>在线客服</span>
              </button>
            </div>
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="flex flex-wrap items-center gap-2">
              <span>Copyright © 2025 U-Spark.</span>
              <span>保留所有权利。</span>
              <Link href="#" className="hover:text-blue-600 transition-colors">
                京ICP备12345678号-1
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>AI赋能: 正常运行</span>
              <span className="ml-4">最后更新: {new Date().toLocaleString('zh-CN', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              }).replace(/\//g, '-')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

