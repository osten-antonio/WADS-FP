"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserIcon, UserPen } from "lucide-react"

export default function HeroPage() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-scan-background flex flex-col overflow-hidden">
      <header className="bg-primary-main relative z-20 flex justify-between items-center p-4 py-4.5 text-white w-full">
        <Link href="/">
          <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity">
            AIMS
          </h1>
        </Link>
        <Link href="/app">
          <h1 className="text-xl cursor-pointer hover:opacity-80 transition-opacity">
            Scan Image
          </h1>
        </Link>
        <Link href="/app/calculator">
          <h1 className="text-xl cursor-pointer hover:opacity-80 transition-opacity">
            Questions
          </h1>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full"
              aria-label="Open account menu"
            >
              <Avatar className="cursor-pointer">
                <AvatarImage src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push("/login")}>
              <UserIcon className="mr-2 h-4 w-4" />
              Login
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/signup")}>
              <UserPen className="mr-2 h-4 w-4" />
              Sign Up
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <section className="flex-1 flex items-center justify-start px-16 py-16">
        <div className="flex-1 flex flex-col gap-6 max-w-xl">
          <div className="flex flex-col">
            <h1 className="text-5xl md:text-6xl font-extrabold text-black leading-tight tracking-tight">
              Student First
            </h1>
            <h1
              className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
              style={{ color: "#2F4457" }}
            >
              Learning Calculator
            </h1>
          </div>

          <div className="w-16 h-1 rounded-full" style={{ background: "#2F4457" }} />

          <p className="text-lg text-black/70 max-w-md leading-relaxed">
            Where all of your calculation needs are met, studying made easy,
            practice with us now!
          </p>

          <Link href="/signup">
            <button
              className="mt-2 self-start px-8 py-3.5 rounded-xl text-base font-semibold shadow-lg
                         transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
              style={{ background: "#2F4457", color: "#FFFFFF" }}
            >
              Register Now
            </button>
          </Link>
        </div>
      </section>
    </main>
  )
}
