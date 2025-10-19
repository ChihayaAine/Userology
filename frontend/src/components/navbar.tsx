import Link from "next/link";
import React from "react";
// import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

function Navbar() {
  return (
    <div className="fixed inset-x-0 top-0 bg-slate-100  z-[10] h-fit  py-4 ">
      <div className="flex items-center justify-between h-full gap-2 px-8 mx-auto">
        <div className="flex flex-row gap-3 justify-center">
          <Link href={"/dashboard"} className="flex items-center gap-2">
            <p className="px-2 py-1 text-2xl font-bold text-black">
              User<span className="text-indigo-600">ology</span>{" "}
              <span className="text-[8px]">Beta</span>
            </p>
          </Link>
          {/* OrganizationSwitcher temporarily disabled - Organization feature not enabled in Clerk */}
          {/* 
          <p className="my-auto text-xl">/</p>
          <div className="my-auto">
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/dashboard"
              hidePersonal={true}
              afterSelectOrganizationUrl="/dashboard"
              afterLeaveOrganizationUrl="/dashboard"
              appearance={{
                variables: {
                  fontSize: "0.9rem",
                },
              }}
            />
          </div>
          */}
        </div>
        <div className="flex items-center">
          <UserButton signInUrl="/sign-in" />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
