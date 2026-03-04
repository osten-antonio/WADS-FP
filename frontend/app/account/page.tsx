import { ArrowLeft, ChevronDown, Pencil } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const topics = [
  "Algebra",
  "Calculus 1",
  "Calculus 2",
  "Linear Algebra",
  "Lorem Ipsum",
]

export default function AccountPage() {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full">
        <section className="md:hidden">
          <div className="rounded-3xl border border-slate-900/70 bg-[#5f8696] p-5 text-white shadow-sm">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-24">
                <AvatarFallback className="bg-[#618D9D] text-xl text-white">
                  PP
                </AvatarFallback>
              </Avatar>
              <div className="mt-3 flex items-center gap-2 text-lg font-semibold">
                Pedro Paskal
                <Pencil className="size-4 text-white/80" />
              </div>
              <Button
                size="xs"
                className="mt-2 rounded-full bg-[#5fa2b3] px-4 text-white hover:bg-[#5597a8]"
              >
                Change Password
              </Button>
            </div>

            <div className="mt-4 text-center text-sm font-semibold">History</div>
            <div className="mt-3 h-64 rounded-2xl bg-[#d9d9d9]" />

            <div className="mt-3 flex items-center justify-between">
              <Button
                size="xs"
                className="rounded-full bg-[#2f2f2f] px-4 text-white hover:bg-[#252525]"
              >
                Clear History
              </Button>
              <Button
                size="xs"
                className="rounded-full bg-[#2f2f2f] px-4 text-white hover:bg-[#252525]"
              >
                Filter
              </Button>
            </div>
          </div>
        </section>

        <section className="hidden md:grid md:min-h-screen md:grid-cols-[200px_1fr] md:gap-6">
          <aside className="bg-[#2f4152] px-4 py-5 text-white">
            <div className="text-sm text-white/80">Sample Title</div>
            <button className="mt-3 flex items-center gap-2 text-sm text-white/90">
              <ArrowLeft className="size-4" />
              Back
            </button>

            <div className="mt-6 flex flex-col gap-2">
              {topics.map((topic) => (
                <button
                  key={topic}
                  className="flex items-center justify-between rounded-full bg-[#4d95a7] px-4 py-2 text-xs font-medium text-white"
                >
                  {topic}
                  <ChevronDown className="size-3" />
                </button>
              ))}
            </div>
          </aside>

          <main className="rounded-2xl bg-white py-8 pl-8 pr-30 shadow-sm">
            <div className="flex items-center justify-end">
              <div className="size-9 rounded-full border border-slate-200 bg-white" />
            </div>

            <div className="mt-6 grid grid-cols-[1fr_1.3fr] gap-10">
              <div className="flex flex-col items-center text-center">
                <Avatar className="size-28">
                  <AvatarFallback className="bg-[#618D9D] text-2xl text-white">
                    PP
                  </AvatarFallback>
                </Avatar>
                <div className="mt-4 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                  Pedro Paskal
                  <Pencil className="size-4 text-slate-500" />
                </div>
                <Button
                  size="xs"
                  className="mt-3 rounded-full bg-[#5fa2b3] px-4 text-white hover:bg-[#5597a8]"
                >
                  Change Password
                </Button>
              </div>

              <div>
                <div className="h-[340px] rounded-2xl bg-[#d9d9d9]" />
                <div className="mt-4 flex items-center justify-between">
                  <Button
                    size="xs"
                    className="rounded-full bg-[#2f2f2f] px-4 text-white hover:bg-[#252525]"
                  >
                    Clear History
                  </Button>
                  <Button
                    size="xs"
                    className="rounded-full bg-[#2f2f2f] px-4 text-white hover:bg-[#252525]"
                  >
                    Filter
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </section>
      </div>
    </div>
  )
}
