"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import SearchComponent from "./search";
import SideBar from "@/components/header/navbar";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b backdrop-blur">
      <div className="flex h-16 w-full items-center gap-4 px-2">
      <SideBar />

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image 
            src="/images/logo_long.png" 
            alt="Logo" 
            width={166} 
            height={52}
            className="w-32 h-auto md:w-40"
          />
        </Link>

        <div className="flex-1 md:hidden block"></div>

        <div className="ml-2">
          <SearchComponent />
        </div>

      <div className="flex-1 hidden md:block"></div>

      <div>
       <Button className="h-10 md:h-11 rounded-none px-2 md:px-5 font-bold bg-primary">
          Login
        </Button> 
      </div>
      </div>
    </header>
  );
}
