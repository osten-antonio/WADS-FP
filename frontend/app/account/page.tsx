"use client"

import * as React from "react"
import { Check, Pencil, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type UserProfileResponse = {
  user: {
    firebaseUID: string;
    displayName: string;
  };
  history: Array<{
    id: string;
    inputMode: "TEXT" | "IMAGE";
    category: string;
    type: string;
    subtype: string | null;
    text: string;
    createdAt: string;
  }>;
};

export default function AccountPage() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [draftName, setDraftName] = React.useState(name)
  const [isEditingName, setIsEditingName] = React.useState(false)
  const [loadingProfile, setLoadingProfile] = React.useState(true)
  const [savingName, setSavingName] = React.useState(false)

  React.useEffect(() => {
    let alive = true
    const controller = new AbortController()

    const loadProfile = async () => {
      try {
        setLoadingProfile(true)
        const res = await fetch("/user/profile", {
          cache: "no-store",
          credentials: "include",
          signal: controller.signal,
        })

        if (res.status === 401) {
          router.push("/login")
          router.refresh()
          return
        }

        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as { message?: string } | null
          throw new Error(payload?.message || "Failed to load profile")
        }

        const payload = (await res.json()) as UserProfileResponse
        const displayName = payload.user.displayName?.trim() || "User"
        if (!alive) return
        setName(displayName)
        setDraftName(displayName)
      } catch (error) {
        if (!alive) return
        console.error(error)
        const message = error instanceof Error ? error.message : "Failed to load profile"
        toast.error(message)
      } finally {
        if (alive) {
          setLoadingProfile(false)
        }
      }
    }

    void loadProfile()

    return () => {
      alive = false
      controller.abort()
    }
  }, [router])

  const startEditing = () => {
    if (loadingProfile || savingName) return
    setDraftName(name)
    setIsEditingName(true)
  }

  const commitName = async () => {
    const next = draftName.trim()
    if (!next) {
      toast.error("Name cannot be empty")
      return
    }

    if (next === name) {
      setIsEditingName(false)
      return
    }

    try {
      setSavingName(true)

      const res = await fetch("/user/update-username", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: next }),
      })

      if (res.status === 401) {
        router.push("/login")
        router.refresh()
        return
      }

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { message?: string } | null
        throw new Error(payload?.message || "Failed to update name")
      }

      const payload = (await res.json()) as UserProfileResponse
      const updatedDisplayName = payload.user.displayName?.trim() || next
      setName(updatedDisplayName)
      setDraftName(updatedDisplayName)
      setIsEditingName(false)
      toast.success("Name updated")
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : "Failed to update name"
      toast.error(message)
    } finally {
      setSavingName(false)
    }
  }

  const cancelEditing = () => {
    setDraftName(name)
    setIsEditingName(false)
  }

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      void commitName()
    }
    if (event.key === "Escape") {
      event.preventDefault()
      cancelEditing()
    }
  }

  const shownName = loadingProfile ? "Loading..." : (name || "User")

  return (
    <div className="w-full h-full">
      <section className="md:hidden">
        <div className=" h-screen m--5 border border-slate-900/70 bg-primary-main p-5 text-white shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Avatar className="size-24">
              <AvatarFallback className="bg-primary-dark text-xl text-white">
                PP
              </AvatarFallback>
            </Avatar>
            <div className="mt-3 flex items-center gap-2 text-lg font-semibold">
              {isEditingName ? (
                <>
                  <Input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    onKeyDown={handleNameKeyDown}
                    disabled={savingName}
                    className="h-8 w-40 bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void commitName()
                    }}
                    disabled={savingName}
                    className="rounded-full p-1 text-white/80 hover:text-white"
                    aria-label="Save name"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded-full p-1 text-white/80 hover:text-white"
                    aria-label="Cancel edit"
                  >
                    <X className="size-4" />
                  </button>
                </>
              ) : (
                <>
                  <span>{shownName}</span>
                  <button
                    type="button"
                    onClick={startEditing}
                    disabled={loadingProfile}
                    className="rounded-full p-1 text-white/80 hover:text-white"
                    aria-label="Edit name"
                  >
                    <Pencil className="size-4" />
                  </button>
                </>
              )}
            </div>
            <Button
              className="mt-2 rounded-lg bg-primary-dark/50 px-4 text-white hover:bg-primary-dark/80"
            >
              Change Password
            </Button>
          </div>

          <div className="mt-4 text-center text-sm font-semibold">History</div>
          <div className="mt-3 h-64 rounded-2xl bg-[#d9d9d9]" />

          <div className="mt-3 flex items-center justify-between">
            <Button
              className="rounded-lg h-7 bg-accent-main/60 px-4 text-white hover:bg-accent-main/80"
            >
              Clear History
            </Button>
            <Button
              className="rounded-lg h-7 bg-accent-main/60 px-4 text-white hover:bg-accent-main/80"
            >
              Filter
            </Button>
          </div>
        </div>
      </section>

      <section className="hidden md:block px-4 py-8 w-full">
        <div className="rounded-2xl bg-white py-8 pl-8 pr-30 shadow-sm w-full">

          <div className="mt-6 flex flex-row flex-wrap w-full gap-10">
            <div className="flex flex-col items-center flex-1 text-center min-w-60">
              <Avatar className="size-28">
                <AvatarFallback className="bg-[#618D9D] text-2xl text-white">
                  PP
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                {isEditingName ? (
                  <>
                    <Input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      onKeyDown={handleNameKeyDown}
                      disabled={savingName}
                      className="h-9 w-52 bg-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void commitName()
                      }}
                      disabled={savingName}
                      className="rounded-full p-1 text-slate-500 hover:text-slate-700"
                      aria-label="Save name"
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="rounded-full p-1 text-slate-500 hover:text-slate-700"
                      aria-label="Cancel edit"
                    >
                      <X className="size-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span>{shownName}</span>
                    <button
                      type="button"
                      onClick={startEditing}
                      disabled={loadingProfile}
                      className="rounded-full p-1 text-slate-500 hover:text-slate-700"
                      aria-label="Edit name"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </>
                )}
              </div>
              <Button
                size="xs"
                className="mt-3 rounded-full bg-[#5fa2b3] px-4 text-white hover:bg-[#5597a8]"
              >
                Change Password
              </Button>
            </div>

            <div className="flex-3 min-w-80 m-auto">
              <div className="text-center text-md font-semibold">History</div>
              <div className="h-[340px] rounded-2xl bg-[#d9d9d9] mt-3" />
              <div className="mt-4 flex items-center justify-between">
                <Button
                  className="rounded-lg h-7 bg-button-main/60 px-4 text-white hover:bg-button-main/80"
                >
                  Clear History
                </Button>
                <Button
                  className="rounded-lg h-7 bg-button-main/60 px-4 text-white hover:bg-button-main/80"
                >
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
