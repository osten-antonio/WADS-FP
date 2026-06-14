"use client"

import type { CSSProperties } from "react"
import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Camera, Send, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile, useIsBelowXl } from "@/hooks/use-mobile"
import { FunctionSelector } from "@/components/calculator/FunctionSelector"
import { ShortcutBar, getShortcutsForTopic } from "@/components/calculator/ShortcutBar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MathKeyboardStyles } from "@/components/calculator/MathKeyboardStyles"
import { KEYBOARD_OPTIONS } from "@/lib/keyboard-config"
import type { MathFieldElement, MathVirtualKeyboard } from "@/lib/mathlive-types"
import { useRouter } from "next/navigation"

export function GenericCalcPage({
  SolutionScreen,
  topic,
  topicSlug,
}: {
  SolutionScreen?: React.ReactNode
  topic: string
  topicSlug?: string
}) {
  const router = useRouter();
  const mf = useRef<MathFieldElement | null>(null)
  const inlineKeyboardHostRef = useRef<HTMLDivElement | null>(null)
  const functionSelectorRef = useRef<HTMLDivElement | null>(null)
  const [inlineKeyboardHeight, setInlineKeyboardHeight] = useState<number | null>(null)
  const [functionSelectorHeight, setFunctionSelectorHeight] = useState<number | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [mobileKeyboardHeight, setMobileKeyboardHeight] = useState(0)

  const [expression, setExpression] = useState("")
  const [isSolving, setIsSolving] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [isFunctionsOpen, setIsFunctionsOpen] = useState(false)

  const isMobile = useIsMobile()
  const isBelowXl = useIsBelowXl()

  const shortcuts = useMemo(() => getShortcutsForTopic(topic), [topic])

  const handleShortcutInsert = useCallback((latex: string) => {
    if (mf.current) {
      mf.current.executeCommand(["insert", latex])
      mf.current.focus()
    }
  }, [])

  const handleOpenFunctions = useCallback(() => {
    setIsFunctionsOpen(true)
  }, [])

  useEffect(() => {
    if (isMobile || !functionSelectorRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setFunctionSelectorHeight(Math.ceil(entry.contentRect.height))
      }
    })
    observer.observe(functionSelectorRef.current)
    return () => observer.disconnect()
  }, [isMobile])

  const effectivePlacement =
    isBelowXl && KEYBOARD_OPTIONS.placement === "inline"
      ? "page-bottom"
      : KEYBOARD_OPTIONS.placement

  const keyboardVars = useMemo(
    () =>
      ({
        "--keyboard-background": KEYBOARD_OPTIONS.colors.keyboardBackground,
        "--keyboard-accent-color": KEYBOARD_OPTIONS.colors.keyboardAccent,
        "--keycap-background": KEYBOARD_OPTIONS.colors.keyBackground,
        "--keycap-text": KEYBOARD_OPTIONS.colors.keyText,
        "--keycap-border-bottom": KEYBOARD_OPTIONS.colors.keyBorderBottom,
        "--keycap-height": `${KEYBOARD_OPTIONS.sizing.keycapHeightPx}px`,
        "--keycap-font-size": `${KEYBOARD_OPTIONS.sizing.keycapFontSizePx}px`,
        "--keycap-gap": `${KEYBOARD_OPTIONS.sizing.keycapGapPx}px`,
        "--vk-edge-offset": `${KEYBOARD_OPTIONS.edgeOffsetPx}px`,
      }) as CSSProperties,
    []
  )

  const inlineKeyboardHostStyle = useMemo(
    () =>
      ({
        ...keyboardVars,
        height: inlineKeyboardHeight ? `${inlineKeyboardHeight}px` : "auto",
        minHeight: inlineKeyboardHeight ? undefined : "250px",
      }) as CSSProperties,
    [inlineKeyboardHeight, keyboardVars]
  )

  useEffect(() => {
    let isCancelled = false
    let cleanupListeners: (() => void) | undefined

    const syncInlineKeyboardHeight = () => {
      if (effectivePlacement !== "inline") {
        setInlineKeyboardHeight(null)
        return
      }

      const keyboard = window.mathVirtualKeyboard as MathVirtualKeyboard | undefined
      if (!keyboard) {
        return
      }

      const measuredHeight = keyboard.boundingRect?.height
      if (typeof measuredHeight === "number" && measuredHeight > 0) {
        setInlineKeyboardHeight(Math.ceil(measuredHeight))
      }
    }

    const initializeMathlive = async () => {
      await import("mathlive")

      if (isCancelled || !mf.current) {
        return
      }

      mf.current.mathVirtualKeyboardPolicy = "manual"

      // @ts-ignore
      mf.current.mathModeSpace = "\\ "

      mf.current.addEventListener("input", (ev) => {
        setExpression((ev.target as MathFieldElement).value)
      })

      const handleFocusIn = () => {
        setIsFocused(true)
        if (effectivePlacement !== "inline") {
          const keyboard = window.mathVirtualKeyboard as MathVirtualKeyboard | undefined
          keyboard?.show()
        }
        syncInlineKeyboardHeight()
      }

      const handleFocusOut = () => {
        setIsFocused(false)
        if (effectivePlacement !== "inline") {
          const keyboard = window.mathVirtualKeyboard as MathVirtualKeyboard | undefined
          keyboard?.hide()
          setMobileKeyboardHeight(0)
        }
      }

      mf.current.addEventListener("focusin", handleFocusIn)
      mf.current.addEventListener("focusout", handleFocusOut)

      const keyboard = window.mathVirtualKeyboard as MathVirtualKeyboard | undefined
      if (!keyboard) {
        return
      }

      ;(keyboard as MathVirtualKeyboard & { layouts: unknown[] }).layouts = [
        {
          label: "123",
          tooltip: "Numeric",
          layers: [
            {
              rows: [
                [
                  { latex: "x^{2}", label: "x²" },
                  { latex: "x^{#?}", label: "xⁿ" },
                  { latex: "\\left|#?\\right|", label: "|x|" },
                  { latex: "e", label: "e" },
                  { latex: "\\ln(#?)", label: "ln" },
                ],
                [
                  { latex: "(", label: "(" },
                  { latex: ")", label: ")" },
                  { latex: "^{#?}", label: "^" },
                  { latex: "\\sqrt{#?}", label: "√x" },
                  { latex: "\\log(#?)", label: "log" },
                ],
                [
                  { latex: "7", label: "7", class: "number" },
                  { latex: "8", label: "8", class: "number" },
                  { latex: "9", label: "9", class: "number" },
                  { latex: "\\frac{#?}{#?}", label: "/" },
                  { latex: "\\sin(#?)", label: "sin" },
                ],
                [
                  { latex: "4", label: "4", class: "number" },
                  { latex: "5", label: "5", class: "number" },
                  { latex: "6", label: "6", class: "number" },
                  { latex: "\\times", label: "×" },
                  { latex: "\\cos(#?)", label: "cos" },
                ],
                [
                  { latex: "1", label: "1", class: "number" },
                  { latex: "2", label: "2", class: "number" },
                  { latex: "3", label: "3", class: "number" },
                  { latex: "-", label: "-" },
                  { latex: "\\tan(#?)", label: "tan" },
                ],
                [
                  { latex: "0", label: "0", class: "number" },
                  { latex: ".", label: "." },
                  { latex: "=", label: "=" },
                  { latex: "+", label: "+" },
                  { latex: "\\pi", label: "π" },
                ],
                ["[shift]", "[left]", "[right]", "[backspace]", "[return]"],
              ],
            },
          ],
        },
        "alphabetic",
        "symbols",
        "greek",
      ]

      const targetHost =
        effectivePlacement === "inline" ? inlineKeyboardHostRef.current : document.body

      if (targetHost) {
        keyboard.container = targetHost
      }

      const handleGeometryChange = () => {
        syncInlineKeyboardHeight()
        if (effectivePlacement !== "inline") {
          const rect = keyboard.boundingRect
          if (
            rect &&
            typeof rect === "object" &&
            "height" in rect &&
            typeof rect.height === "number" &&
            rect.height > 0
          ) {
            setMobileKeyboardHeight(Math.ceil(rect.height))
          }
        }
      }

      keyboard.addEventListener("geometrychange", handleGeometryChange)
      window.addEventListener("resize", handleGeometryChange)
      window.addEventListener("orientationchange", handleGeometryChange)

      cleanupListeners = () => {
        keyboard.removeEventListener("geometrychange", handleGeometryChange)
        window.removeEventListener("resize", handleGeometryChange)
        window.removeEventListener("orientationchange", handleGeometryChange)
        mf.current?.removeEventListener("focusin", handleFocusIn)
        mf.current?.removeEventListener("focusout", handleFocusOut)
      }

      if (effectivePlacement === "inline") {
        requestAnimationFrame(() => {
          keyboard.show()
          syncInlineKeyboardHeight()
        })
      }
    }

    void initializeMathlive()

    return () => {
      isCancelled = true
      window.mathVirtualKeyboard?.hide()
      cleanupListeners?.()
      setInlineKeyboardHeight(null)
    }
  }, [effectivePlacement])

  useEffect(() => {
    if (typeof window !== "undefined" && window.mathVirtualKeyboard) {
      const keyboard = window.mathVirtualKeyboard as MathVirtualKeyboard
      const targetHost =
        effectivePlacement === "inline" ? inlineKeyboardHostRef.current : document.body

      if (targetHost) {
        keyboard.container = targetHost
      }
    }
  }, [effectivePlacement])

  const handleSolve = async () => {
    if (!expression.trim()) return
    setIsSolving(true)
    setHasResult(false)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSolving(false)
    setHasResult(true)
  }

  return (
    <div className="flex flex-col min-h-screen h-full bg-slate-50/10">
      <main className="flex flex-col xl:flex-row p-4 gap-6 max-w-7xl mx-auto w-full">
        <div className="flex-2 flex flex-col gap-4">
          <section className="flex flex-col gap-4 p-4 bg-white rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">{topic}</h2>
            <div className="group gap-2 flex flex-row items-end">
              <div className="flex-1 flex flex-row items-end gap-2">
                <math-field
                  ref={mf}
                  className="flex-1 w-full rounded-lg border border-primary-light bg-scan-background px-3 py-2 text-lg min-h-[50px]"
                  placeholder="x^2 - 2x + 1 = 0"
                  math-mode-space="\ "
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSolve()
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  disabled={!expression.trim() || isSolving}
                  className="hover:bg-slate-100 aspect-square border h-12 w-12 text-slate-500 transition-colors shrink-0 p-0"
                  onClick={handleSolve}
                >
                  {isSolving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                className="hover:bg-slate-100 aspect-square border h-12 w-12 text-slate-500 transition-colors shrink-0 p-0"
                onClick={() => {
                  router.push(`/app?topic=${ topicSlug || 'general'}`)
                }}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>
          </section>

          {effectivePlacement === "inline" && (
            <div className="flex gap-2 w-full h-full">
              <div className="w-full flex flex-row gap-2">
                <div ref={functionSelectorRef} className="hidden xl:block w-1/3 min-w-[250px] max-w-[400px]">
                  <FunctionSelector
                    onSelect={(f) => {
                      if (mf.current) {
                        mf.current.executeCommand(["insert", f])
                        mf.current.focus()
                      }
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col min-h-0 max-w-[500px]">
                  <ShortcutBar
                    shortcuts={shortcuts}
                    onInsert={handleShortcutInsert}
                    mathFieldRef={mf}
                  />
                  <div
                    ref={inlineKeyboardHostRef}
                    className="math-vk-inline-host flex-1 shadow-sm rounded-xl overflow-hidden"
                    style={
                      !isMobile && functionSelectorHeight
                        ? {
                            ...inlineKeyboardHostStyle,
                            height: `${functionSelectorHeight}px`,
                            minHeight: undefined,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                          }
                        : {
                            ...inlineKeyboardHostStyle,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                          }
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={
            "flex-1 flex flex-col min-h-100 h-full items-center justify-center p-8 border border-dashed rounded-xl text-center text-slate-400 font-medium " +
            (hasResult ? " bg-white" : "bg-slate-100")
          }
        >
          {isSolving ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-zinc-300" />
              <p className="text-zinc-400 animate-pulse">Calculating steps...</p>
            </div>
          ) : hasResult ? (
            <div className="w-full text-slate-900 h-full">{SolutionScreen}</div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-lg">Enter a problem to be solved</p>
              <p className="text-sm opacity-60">Click the send button or press Enter</p>
            </div>
          )}
        </div>

        <MathKeyboardStyles effectivePlacement={effectivePlacement} />
      </main>

      {isBelowXl && isFocused && mobileKeyboardHeight > 0 && (
        <div
          className="fixed left-0 right-0 z-[130] pointer-events-auto"
          style={{ bottom: `${mobileKeyboardHeight}px` }}
        >
          <ShortcutBar
            shortcuts={shortcuts}
            onInsert={handleShortcutInsert}
            mathFieldRef={mf}
            onOpenFunctions={handleOpenFunctions}
            showFunctionsButton
            variant="keyboard"
          />
        </div>
      )}

      <Sheet open={isFunctionsOpen} onOpenChange={setIsFunctionsOpen}>
        <SheetContent
          side="bottom"
          className="h-[60vh] sm:max-w-xl mx-auto p-0 flex flex-col bg-slate-50 rounded-t-3xl shadow-2xl overflow-hidden border-none"
        >
          <SheetHeader className="p-6 border-b bg-white flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-slate-900">Function Library</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => setIsFunctionsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetHeader>
          <div className="flex-1 overflow-hidden p-4">
            <FunctionSelector
              onSelect={(f) => {
                if (mf.current) {
                  mf.current.executeCommand(["insert", f])
                  mf.current.focus()
                  setIsFunctionsOpen(false)
                }
              }}
              onClose={() => setIsFunctionsOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
