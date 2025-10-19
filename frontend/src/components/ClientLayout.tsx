"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import SideMenu from "@/components/sideMenu";

interface ClientLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function ClientLayout({ children, className }: ClientLayoutProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // 确保组件已经在客户端挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = pathname.includes("/sign-in") || pathname.includes("/sign-up");

  return (
    <div className={cn("antialiased overflow-hidden min-h-screen", className)}>
      {/* 总是渲染Navbar和SideMenu，但在未挂载时使用透明度隐藏 */}
      {!isAuthPage && (
        <div className={mounted ? "opacity-100" : "opacity-0"}>
          <Navbar />
        </div>
      )}
      <div className="flex flex-row h-screen">
        {!isAuthPage && (
          <div className={mounted ? "opacity-100" : "opacity-0"}>
            <SideMenu />
          </div>
        )}
        <div className={cn(
          "h-full overflow-y-auto flex-grow transition-all duration-200",
          !isAuthPage && "ml-[200px] pt-[64px]"
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}
