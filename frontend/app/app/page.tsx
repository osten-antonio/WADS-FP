import Link from "next/link"

export default function HeroPage() {
  return (
    <main className="min-h-screen bg-scan-background flex items-center justify-center px-8 py-16 overflow-hidden relative">
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col">
          <h1 className="text-5xl md:text-6xl font-extrabold text-black leading-tight tracking-tight">
            Student First
          </h1>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
            style={{ color: "#2F4457" }}>
            Learning Calculator
          </h1>
        </div>
        <div className="w-16 h-1 rounded-full" style={{ background: "#2F4457" }} />
        <p className="text-lg text-black/70 max-w-md leading-relaxed"> {/* Subtitle */}
          Where all of your calculation needs are met, studying made easy, practice with us now!
        </p>
        <Link href="/signup">
          <button
            className="mt-2 self-start px-8 py-3.5 rounded-xl 
            text-base font-semibold shadow-lg 
            transition-all duration-200 
            hover:scale-105 hover:shadow-xl 
            active:scale-95"
            style={{ background: "#2F4457", color: "#FFFFFF" }}>
            Register Now
          </button>
        </Link>
      </div>
    </main>
  )
}
