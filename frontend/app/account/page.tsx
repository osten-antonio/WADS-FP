"use client"

import * as React from "react"
import { Check, Pencil, X } from "lucide-react"

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

type ProfileResponse = {
  user: {
    firebaseUID: string
    displayName: string
  }
  history: HistoryItem[]
}

type HistoryResponse = {
  items: HistoryItem[]
}

const ALL_TOPICS_VALUE = "__all_topics__"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000"
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID?.trim() || undefined
const DEV_BEARER_TOKEN = process.env.NEXT_PUBLIC_DEV_BEARER_TOKEN?.trim() || undefined

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

function NameEditor({
  isEditingName,
  name,
  draftName,
  setDraftName,
  startEditing,
  commitName,
  cancelEditing,
  handleNameKeyDown,
}: {
  isEditingName: boolean
  name: string
  draftName: string
  setDraftName: React.Dispatch<React.SetStateAction<string>>
  startEditing: () => void
  commitName: () => void
  cancelEditing: () => void
  handleNameKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="mt-3 flex items-center gap-2 text-lg font-semibold">
      {isEditingName ? (
        <>
          <Input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={handleNameKeyDown}
            className="h-8 w-40 bg-white text-slate-900"
          />
          <button
            type="button"
            onClick={commitName}
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
          <span>{name}</span>
          <button
            type="button"
            onClick={startEditing}
            className="rounded-full p-1 text-white/80 hover:text-white"
            aria-label="Edit name"
          >
            <Pencil className="size-4" />
          </button>
        </>
      )}
    </div>
  )
}

export default function AccountPage() {
  const [name, setName] = React.useState("User")
  const [draftName, setDraftName] = React.useState(name)
  const [isEditingName, setIsEditingName] = React.useState(false)

  const [selectedTopic, setSelectedTopic] = React.useState(ALL_TOPICS_VALUE)
  const [historyItems, setHistoryItems] = React.useState<HistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(true)
  const [isClearingHistory, setIsClearingHistory] = React.useState(false)
  const [historyError, setHistoryError] = React.useState<string | null>(null)
  const [activeUserId, setActiveUserId] = React.useState<string | null>(DEV_USER_ID ?? null)
  const skipFirstFilteredFetch = React.useRef(true)

  const startEditing = () => {
    setDraftName(name)
    setIsEditingName(true)
  }

  const commitName = () => {
    const next = draftName.trim()
    if (next) setName(next)
    setIsEditingName(false)
  }

  const cancelEditing = () => {
    setDraftName(name)
    setIsEditingName(false)
  }

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      commitName()
    }
    if (event.key === "Escape") {
      event.preventDefault()
      cancelEditing()
    }
  }

  const authHeaders = React.useMemo(() => {
    const headers: Record<string, string> = {}
    if (DEV_BEARER_TOKEN) {
      headers.Authorization = `Bearer ${DEV_BEARER_TOKEN}`
      return headers
    }

    // Dev-only fallback when backend ALLOW_DEV_USER_ID_HEADER=true
    if (DEV_USER_ID) {
      headers["x-user-id"] = DEV_USER_ID
    }
    return headers
  }, [])

  const requestJson = React.useCallback(async <T,>(pathname: string, query?: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value) params.set(key, value)
      }
    }

    const queryString = params.toString()
    const url = `${API_BASE_URL}${pathname}${queryString ? `?${queryString}` : ""}`
    const response = await fetch(url, {
      cache: "no-store",
      headers: authHeaders,
    })

    if (!response.ok) {
      let message = "Request failed."
      try {
        const body = (await response.json()) as { message?: string }
        if (body.message) message = body.message
      } catch {
        message = `Request failed with status ${response.status}`
      }
      throw new Error(message)
    }

    return (await response.json()) as T
  }, [authHeaders])

  React.useEffect(() => {
    let isCancelled = false

    const loadInitialProfile = async () => {
      try {
        setIsLoadingHistory(true)
        setHistoryError(null)
        const profile = await requestJson<ProfileResponse>("/users/profile")

        if (isCancelled) return
        setActiveUserId(profile.user.firebaseUID)
        setName(profile.user.displayName)
        setDraftName(profile.user.displayName)
        setHistoryItems(profile.history)
      } catch (error) {
        if (isCancelled) return
        const message = error instanceof Error ? error.message : "Failed to load account history."
        setHistoryError(message)
      } finally {
        if (!isCancelled) {
          setIsLoadingHistory(false)
        }
      }
    }

    void loadInitialProfile()

    return () => {
      isCancelled = true
    }
  }, [requestJson])

  React.useEffect(() => {
    if (!activeUserId) return
    if (skipFirstFilteredFetch.current) {
      skipFirstFilteredFetch.current = false
      return
    }

    let isCancelled = false

    const loadFilteredHistory = async () => {
      try {
        setIsLoadingHistory(true)
        setHistoryError(null)
        const category = selectedTopic === ALL_TOPICS_VALUE ? undefined : selectedTopic
        const history = await requestJson<HistoryResponse>("/users/filter-history", { category })
        if (isCancelled) return
        setHistoryItems(history.items)
      } catch (error) {
        if (isCancelled) return
        const message = error instanceof Error ? error.message : "Failed to filter history."
        setHistoryError(message)
      } finally {
        if (!isCancelled) {
          setIsLoadingHistory(false)
        }
      }
    }

    void loadFilteredHistory()

    return () => {
      isCancelled = true
    }
  }, [activeUserId, requestJson, selectedTopic])

  const handleClearHistory = async () => {
    if (!activeUserId) return
    if (historyItems.length === 0) return

    const confirmed = window.confirm("Clear all history for this user?")
    if (!confirmed) return

    try {
      setIsClearingHistory(true)
      setHistoryError(null)
      const url = `${API_BASE_URL}/users/delete-history`
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          submissionIds: [],
        }),
      })

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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to clear history."
      setHistoryError(message)
    } finally {
      setIsClearingHistory(false)
    }
  }

  return (
    <div className="w-full h-full">
      <section className="md:hidden">
        <div className="h-screen border border-slate-900/70 bg-primary-main p-5 text-white shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Avatar className="size-24">
              <AvatarFallback className="bg-primary-dark text-xl text-white">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <NameEditor
              isEditingName={isEditingName}
              name={name}
              draftName={draftName}
              setDraftName={setDraftName}
              startEditing={startEditing}
              commitName={commitName}
              cancelEditing={cancelEditing}
              handleNameKeyDown={handleNameKeyDown}
            />
            <Button className="mt-2 rounded-lg bg-primary-dark/50 px-4 text-white hover:bg-primary-dark/80">
              Change Password
            </Button>
          </div>

          <div className="mt-4 text-center text-sm font-semibold">History</div>
          <div className="mt-3 h-64 overflow-y-auto rounded-2xl bg-[#d9d9d9] p-3 text-slate-900">
            {isLoadingHistory ? <p className="text-sm">Loading history...</p> : null}
            {!isLoadingHistory && historyError ? <p className="text-sm text-red-700">{historyError}</p> : null}
            {!isLoadingHistory && !historyError && historyItems.length === 0 ? (
              <p className="text-sm text-slate-700">No history found.</p>
            ) : null}
            {!isLoadingHistory && !historyError
              ? historyItems.map((item) => (
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
              disabled={isLoadingHistory || isClearingHistory || historyItems.length === 0}
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
                <AvatarFallback className="bg-[#618D9D] text-2xl text-white">{getInitials(name)}</AvatarFallback>
              </Avatar>
              <div className="mt-4 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                {isEditingName ? (
                  <>
                    <Input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      onKeyDown={handleNameKeyDown}
                      className="h-9 w-52 bg-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={commitName}
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
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={startEditing}
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
                {isLoadingHistory ? <p className="text-sm">Loading history...</p> : null}
                {!isLoadingHistory && historyError ? <p className="text-sm text-red-700">{historyError}</p> : null}
                {!isLoadingHistory && !historyError && historyItems.length === 0 ? (
                  <p className="text-sm text-slate-700">No history found.</p>
                ) : null}
                {!isLoadingHistory && !historyError
                  ? historyItems.map((item) => (
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
                  disabled={isLoadingHistory || isClearingHistory || historyItems.length === 0}
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
