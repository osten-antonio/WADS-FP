"use client"

import * as React from "react"
import { Check, Pencil, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { CALCULATOR_TOPIC_OPTIONS } from "@/lib/calculator-topics"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type HistoryItem = {
  id: string
  inputMode: "TEXT" | "IMAGE"
  category: string
  type: string
  subtype: string | null
  text: string
  createdAt: string
}

type UserProfileResponse = {
  user: {
    firebaseUID: string
    displayName: string
  }
  history: HistoryItem[]
}

const ALL_TOPICS_VALUE = "__all_topics__"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "U"
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
}

function formatHistoryDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function matchesTopic(item: HistoryItem, topic: string): boolean {
  const normalizedTopic = topic.trim().toLowerCase()
  return item.category.toLowerCase() === normalizedTopic || item.type.toLowerCase() === normalizedTopic
}

export default function AccountPage() {
  const router = useRouter()

  const [name, setName] = React.useState("")
  const [draftName, setDraftName] = React.useState("")
  const [isEditingName, setIsEditingName] = React.useState(false)
  const [loadingProfile, setLoadingProfile] = React.useState(true)
  const [savingName, setSavingName] = React.useState(false)

  const [selectedTopic, setSelectedTopic] = React.useState(ALL_TOPICS_VALUE)
  const [historyItems, setHistoryItems] = React.useState<HistoryItem[]>([])
  const [isClearingHistory, setIsClearingHistory] = React.useState(false)
  const [historyError, setHistoryError] = React.useState<string | null>(null)

  const redirectToLogin = React.useCallback(() => {
    router.push("/login")
    router.refresh()
  }, [router])

  React.useEffect(() => {
    let alive = true
    const controller = new AbortController()

    const loadProfile = async () => {
      try {
        setLoadingProfile(true)
        setHistoryError(null)

        const res = await fetch("/user/profile", {
          cache: "no-store",
          credentials: "include",
          signal: controller.signal,
        })

        if (res.status === 401) {
          redirectToLogin()
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
        setHistoryItems(payload.history ?? [])
      } catch (error) {
        if (!alive) return
        console.error(error)
        const message = error instanceof Error ? error.message : "Failed to load profile"
        setHistoryError(message)
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
  }, [redirectToLogin])

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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: next }),
      })

      if (res.status === 401) {
        redirectToLogin()
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
      setHistoryItems(payload.history ?? [])
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

  const handleClearHistory = async () => {
    if (historyItems.length === 0) return

    const confirmed = window.confirm("Clear all history for this user?")
    if (!confirmed) return

    try {
      setIsClearingHistory(true)
      setHistoryError(null)

      const response = await fetch("/user/delete-history", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionIds: [],
        }),
      })

      if (response.status === 401) {
        redirectToLogin()
        return
      }

      if (!response.ok) {
        let message = "Failed to clear history."
        try {
          const body = (await response.json()) as { message?: string }
          if (body.message) message = body.message
        } catch {
          message = `Failed to clear history. Status: ${response.status}`
        }
        throw new Error(message)
      }

      setHistoryItems([])
      toast.success("History cleared")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to clear history."
      setHistoryError(message)
      toast.error(message)
    } finally {
      setIsClearingHistory(false)
    }
  }

  const shownName = loadingProfile ? "Loading..." : (name || "User")

  const visibleHistoryItems = React.useMemo(() => {
    if (selectedTopic === ALL_TOPICS_VALUE) return historyItems
    return historyItems.filter((item) => matchesTopic(item, selectedTopic))
  }, [historyItems, selectedTopic])

  return (
    <div className="w-full h-full">
      <section className="md:hidden">
        <div className="h-screen border border-slate-900/70 bg-primary-main p-5 text-white shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Avatar className="size-24">
              <AvatarFallback className="bg-primary-dark text-xl text-white">{getInitials(name || "User")}</AvatarFallback>
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
            <Button className="mt-2 rounded-lg bg-primary-dark/50 px-4 text-white hover:bg-primary-dark/80">
              Change Password
            </Button>
          </div>

          <div className="mt-4 text-center text-sm font-semibold">History</div>
          <div className="mt-3 h-64 overflow-y-auto rounded-2xl bg-[#d9d9d9] p-3 text-slate-900">
            {loadingProfile ? <p className="text-sm">Loading history...</p> : null}
            {!loadingProfile && historyError ? <p className="text-sm text-red-700">{historyError}</p> : null}
            {!loadingProfile && !historyError && visibleHistoryItems.length === 0 ? (
              <p className="text-sm text-slate-700">No history found.</p>
            ) : null}
            {!loadingProfile && !historyError
              ? visibleHistoryItems.map((item) => (
                  <article key={item.id} className="mb-2 rounded-lg bg-white p-2 last:mb-0">
                    <p className="text-xs font-semibold text-slate-800">{item.category}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-700">{item.text || "(no text input saved)"}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{formatHistoryDate(item.createdAt)}</p>
                  </article>
                ))
              : null}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <Button
              onClick={handleClearHistory}
              disabled={loadingProfile || isClearingHistory || historyItems.length === 0}
              className="rounded-lg h-7 bg-accent-main/60 px-4 text-white hover:bg-accent-main/80"
            >
              {isClearingHistory ? "Clearing..." : "Clear History"}
            </Button>
            <select
              value={selectedTopic}
              onChange={(event) => setSelectedTopic(event.target.value)}
              className="h-7 rounded-lg bg-accent-main/60 px-2 text-xs text-white outline-none"
              aria-label="Filter history by topic"
            >
              <option value={ALL_TOPICS_VALUE}>All Topics</option>
              {CALCULATOR_TOPIC_OPTIONS.map((topic) => (
                <option key={topic.slug} value={topic.label} className="text-slate-900">
                  {topic.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="hidden md:block px-4 py-8 w-full">
        <div className="rounded-2xl bg-white py-8 pl-8 pr-30 shadow-sm w-full">
          <div className="mt-6 flex flex-row flex-wrap w-full gap-10">
            <div className="flex flex-col items-center flex-1 text-center min-w-60">
              <Avatar className="size-28">
                <AvatarFallback className="bg-[#618D9D] text-2xl text-white">{getInitials(name || "User")}</AvatarFallback>
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
              <Button size="xs" className="mt-3 rounded-full bg-[#5fa2b3] px-4 text-white hover:bg-[#5597a8]">
                Change Password
              </Button>
            </div>

            <div className="flex-3 min-w-80 m-auto">
              <div className="text-center text-md font-semibold">History</div>
              <div className="h-[340px] rounded-2xl bg-[#d9d9d9] mt-3 overflow-y-auto p-3 text-slate-900">
                {loadingProfile ? <p className="text-sm">Loading history...</p> : null}
                {!loadingProfile && historyError ? <p className="text-sm text-red-700">{historyError}</p> : null}
                {!loadingProfile && !historyError && visibleHistoryItems.length === 0 ? (
                  <p className="text-sm text-slate-700">No history found.</p>
                ) : null}
                {!loadingProfile && !historyError
                  ? visibleHistoryItems.map((item) => (
                      <article key={item.id} className="mb-2 rounded-lg bg-white p-3 last:mb-0">
                        <p className="text-xs font-semibold text-slate-800">
                          {item.category} · {item.inputMode}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-700">{item.text || "(no text input saved)"}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatHistoryDate(item.createdAt)}</p>
                      </article>
                    ))
                  : null}
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <Button
                  onClick={handleClearHistory}
                  disabled={loadingProfile || isClearingHistory || historyItems.length === 0}
                  className="rounded-lg h-7 bg-button-main/60 px-4 text-white hover:bg-button-main/80"
                >
                  {isClearingHistory ? "Clearing..." : "Clear History"}
                </Button>
                <select
                  value={selectedTopic}
                  onChange={(event) => setSelectedTopic(event.target.value)}
                  className="h-8 rounded-lg bg-button-main/60 px-3 text-sm text-white outline-none"
                  aria-label="Filter history by topic"
                >
                  <option value={ALL_TOPICS_VALUE}>All Topics</option>
                  {CALCULATOR_TOPIC_OPTIONS.map((topic) => (
                    <option key={topic.slug} value={topic.label} className="text-slate-900">
                      {topic.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
