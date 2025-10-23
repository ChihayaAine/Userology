"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";

function SignUpPage() {
  const [clerkReady, setClerkReady] = useState(false);

  useEffect(() => {
    const initClerk = async () => {
      console.log('🔄 开始初始化 Clerk (Sign Up)...');
      
      let attempts = 0;
      while (!(window as any).Clerk && attempts < 100) {
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
      }

      const clerk = (window as any).Clerk;
      
      if (!clerk) {
        console.error('❌ Clerk 未找到');
        return;
      }

      if (!clerk.loaded) {
        try {
          await clerk.load();
          console.log('✅ Clerk 加载完成 (Sign Up)');
        } catch (error) {
          console.error('❌ Clerk 加载失败:', error);
          return;
        }
      }

      setClerkReady(true);
    };

    initClerk();
  }, []);

  if (!clerkReady) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white absolute top-0 left-0 z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-gray-700 font-medium">正在加载注册页面...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen w-full bg-white absolute top-0 left-0 z-50">
      <SignUp forceRedirectUrl="/dashboard" />
    </div>
  );
}

export default SignUpPage;