"use client"

import type { CSSProperties } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Camera, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { Result } from "@/components/calculator/Result"
import { FunctionSelector } from "@/components/calculator/FunctionSelector"

type MathFieldElement = HTMLElement & {
    mathVirtualKeyboardPolicy: "manual" | "auto" | "sandboxed"
    value: string
    executeCommand: (command: string | [string, ...any[]]) => boolean
}

type MathVirtualKeyboard = {
    container: HTMLElement | null
    boundingRect?: DOMRectReadOnly
    show: () => void
    hide: () => void
    addEventListener: (type: string, listener: () => void) => void
    removeEventListener: (type: string, listener: () => void) => void
}

type Placement = "page-bottom" | "page-top" | "inline"
type Alignment = "left" | "center" | "right"

const KEYBOARD_OPTIONS = {
    placement: "inline" as Placement,
    alignment: "center" as Alignment,
    edgeOffsetPx: 12,
    sizing: {
        keycapHeightPx: 52,
        keycapWidthPx: 82,
        keycapFontSizePx: 20,
        keycapGapPx: 8
    },
    colors: {
        keyboardBackground: "#2F4457",
        keyboardAccent: "#FFFFFF",
        keyBackground: "#4C9DB3",
        keyText: "#FFFFFF",
        keyBorderBottom: "#9da7b4",
        numberKeys: "#1088AA",
        operatorKeys: "#ffe6cc",
        actionKeys: "#10AAA2"
    },
    perKeyColors: [
        { keyValue: "(", color: "#fce7f3" },
        { keyValue: ")", color: "#fce7f3" },
        { keyValue: "\\sqrt", color: "#ede9fe" },
        { keyValue: "=", color: "#fef3c7" }
    ]
}

function escapeCssAttr(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

export default function AlgebraCalculatorPage() {
  const mf = useRef<MathFieldElement | null>(null)
  const inlineKeyboardHostRef = useRef<HTMLDivElement | null>(null)
  const [inlineKeyboardHeight, setInlineKeyboardHeight] = useState<number | null>(null)
  
  const [expression, setExpression] = useState("")
  const [isSolving, setIsSolving] = useState(false)
  const [hasResult, setHasResult] = useState(false)

  const isMobile = useIsMobile()

  const effectivePlacement = isMobile && KEYBOARD_OPTIONS.placement === "inline"
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
              "--keycap-max-width": `${KEYBOARD_OPTIONS.sizing.keycapWidthPx}px`,
              "--keycap-font-size": `${KEYBOARD_OPTIONS.sizing.keycapFontSizePx}px`,
              "--keycap-gap": `${KEYBOARD_OPTIONS.sizing.keycapGapPx}px`,
              "--vk-edge-offset": `${KEYBOARD_OPTIONS.edgeOffsetPx}px`
          }) as CSSProperties,
      []
  )

  const inlineKeyboardHostStyle = useMemo(
      () =>
          ({
              ...keyboardVars,
              height: inlineKeyboardHeight ? `${inlineKeyboardHeight}px` : "auto",
              minHeight: inlineKeyboardHeight ? undefined : "250px"
          }) as CSSProperties,
      [inlineKeyboardHeight, keyboardVars]
  )

  const perKeyCss = useMemo(
      () =>
          KEYBOARD_OPTIONS.perKeyColors
              .filter((rule) => rule.keyValue.trim().length > 0)
              .map(
                  (rule) =>
                      `.ML__keyboard .MLK__row > div[data-keycap-value="${escapeCssAttr(rule.keyValue)}"] { background: ${rule.color}; }`
              )
              .join("\n"),
      []
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

          mf.current.addEventListener('input', (ev) => {
             setExpression((ev.target as MathFieldElement).value)
          })

          const keyboard = window.mathVirtualKeyboard as MathVirtualKeyboard | undefined
          if (!keyboard) {
              return
          }

          const targetHost =
              effectivePlacement === "inline"
                  ? inlineKeyboardHostRef.current
                  : document.body

          if (targetHost) {
              keyboard.container = targetHost
          }

          const handleFocusIn = () => {
              keyboard.show()
              syncInlineKeyboardHeight()
          }

          mf.current.addEventListener("focusin", handleFocusIn)
          mf.current.focus()

          if (effectivePlacement === "inline") {
              const handleGeometryChange = () => {
                  syncInlineKeyboardHeight()
              }

              keyboard.addEventListener("geometrychange", handleGeometryChange)
              window.addEventListener("resize", handleGeometryChange)
              window.addEventListener("orientationchange", handleGeometryChange)

              cleanupListeners = () => {
                  keyboard.removeEventListener("geometrychange", handleGeometryChange)
                  window.removeEventListener("resize", handleGeometryChange)
                  window.removeEventListener("orientationchange", handleGeometryChange)
                  mf.current?.removeEventListener("focusin", handleFocusIn)
              }
          } else {
              cleanupListeners = () => {
                  mf.current?.removeEventListener("focusin", handleFocusIn)
              }
          }

          requestAnimationFrame(() => {
              keyboard.show()
              syncInlineKeyboardHeight()
          })
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
              effectivePlacement === "inline"
                  ? inlineKeyboardHostRef.current
                  : document.body

          if (targetHost) {
              keyboard.container = targetHost
          }
      }
  }, [effectivePlacement])

  const handleSolve = async () => {
    if (!expression.trim()) return;
    setIsSolving(true);
    setHasResult(false);
    
    // Simulate backend delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsSolving(false);
    setHasResult(true);
  };

  return (
    <div className="flex flex-col min-h-screen h-full bg-slate-50/10">
      <main className="flex flex-col xl:flex-row p-4 gap-6 max-w-7xl mx-auto w-full">
        <div className="flex-2 flex flex-col gap-4">
          <section className="flex flex-col gap-4 p-4 bg-white rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Algebra</h2>
            <div className="group gap-2 flex flex-row items-end">
              <div className="flex-1 relative">
                <math-field
                    ref={mf}
                    className="w-full rounded-lg border border-primary-light bg-scan-background px-3 py-2 text-lg min-h-[50px]"
                    placeholder="x^2 - 2x + 1 = 0"
                    math-mode-space="\ "
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSolve();
                      }
                    }}
                />
                
                <div className="absolute right-2 bottom-2 flex flex-row gap-2 z-10">
                  <Button 
                    variant='ghost'
                    disabled={!expression.trim() || isSolving}
                    className="aspect-square h-10 w-10 shrink-0 p-0 rounded-lg hover:bg-slate-200"
                    onClick={handleSolve}
                  >
                    {isSolving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="hover:bg-slate-100 aspect-square border h-12 w-12 text-slate-500 transition-colors shrink-0 p-0"
                onClick={() => {}}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>
          </section>
        
          <div className="flex gap-2 w-full h-full">
              <div className="hidden w-full xl:flex xl:flex-row gap-2" style={{ display: effectivePlacement === "inline" ? 'flex' : 'none' }}>
                  <div className="w-1/3 min-w-[250px] max-w-[400px]">
                      <FunctionSelector 
                          onSelect={(f) => {
                              if (mf.current) {
                                  mf.current.executeCommand(['insert', f])
                                  mf.current.focus()
                              }
                          }} 
                      />
                  </div>
                  <div
                      ref={inlineKeyboardHostRef}
                      className="math-vk-inline-host flex-1 shadow-sm rounded-xl overflow-hidden"
                      style={inlineKeyboardHostStyle}
                  />
              </div>
          </div>
        </div>
        
        <div className={"flex-1 flex flex-col min-h-100 h-full items-center justify-center p-8 border border-dashed rounded-xl text-center text-slate-400 font-medium " + (hasResult ? " bg-white" : "bg-slate-100")}>
          {isSolving ? (
             <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-zinc-300" />
                <p className="text-zinc-400 animate-pulse">Calculating steps...</p>
             </div>
          ) : hasResult ? (
            <div className="w-full text-slate-900 h-full">
               <Result />
            </div>
          ) : (
             <div className="flex flex-col items-center gap-2">
                <p className="text-lg">Enter a problem to be solved</p>
                <p className="text-sm opacity-60">Click the send button or press Enter</p>
             </div>
          )}
        </div>

        <style jsx global>{`
            math-field::part(virtual-keyboard-toggle) {
                display: none;
            }

            :root,
            .math-vk-inline-host {
                --keyboard-background: ${KEYBOARD_OPTIONS.colors.keyboardBackground};
                --keyboard-accent-color: ${KEYBOARD_OPTIONS.colors.keyboardAccent};
                --keycap-background: ${KEYBOARD_OPTIONS.colors.keyBackground};
                --keycap-text: ${KEYBOARD_OPTIONS.colors.keyText};
                --keycap-border-bottom: ${KEYBOARD_OPTIONS.colors.keyBorderBottom};
                --keycap-height: ${KEYBOARD_OPTIONS.sizing.keycapHeightPx}px;
                --keycap-max-width: ${KEYBOARD_OPTIONS.sizing.keycapWidthPx}px;
                --keycap-font-size: ${KEYBOARD_OPTIONS.sizing.keycapFontSizePx}px;
                --keycap-gap: ${KEYBOARD_OPTIONS.sizing.keycapGapPx}px;
                --vk-edge-offset: ${KEYBOARD_OPTIONS.edgeOffsetPx}px;
                --keyboard-padding-horizontal: 0px;
                --keyboard-padding-top: 6px;
                --keyboard-padding-bottom: 4px;
                --keyboard-zindex: 120;
            }

            ${effectivePlacement === "inline"
                ? `.math-vk-inline-host {
                position: relative;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .math-vk-inline-host .MLK__backdrop {
                border-radius: 12px;
            }`
                : `body > .ML__keyboard {
                position: fixed;
                z-index: 120;
                width: min(960px, calc(100vw - 1rem));
                ${KEYBOARD_OPTIONS.placement === "page-top" ? "top: var(--vk-edge-offset);" : "bottom: var(--vk-edge-offset);"}
                ${KEYBOARD_OPTIONS.alignment === "left" ? "left: 0.5rem;" : ""}
                ${KEYBOARD_OPTIONS.alignment === "center" ? "left: 50%; transform: translateX(-50%);" : ""}
                ${KEYBOARD_OPTIONS.alignment === "right" ? "right: 0.5rem;" : ""}
            }

            body > .ML__keyboard .MLK__backdrop {
                border-radius: 12px;
                box-shadow: 0 10px 28px rgba(15, 30, 52, 0.2);
            }`}

            .ML__keyboard .MLK__row > div[data-keycap-value="0"],
            .ML__keyboard .MLK__row > div[data-keycap-value="1"],
            .ML__keyboard .MLK__row > div[data-keycap-value="2"],
            .ML__keyboard .MLK__row > div[data-keycap-value="3"],
            .ML__keyboard .MLK__row > div[data-keycap-value="4"],
            .ML__keyboard .MLK__row > div[data-keycap-value="5"],
            .ML__keyboard .MLK__row > div[data-keycap-value="6"],
            .ML__keyboard .MLK__row > div[data-keycap-value="7"],
            .ML__keyboard .MLK__row > div[data-keycap-value="8"],
            .ML__keyboard .MLK__row > div[data-keycap-value="9"] {
                background: ${KEYBOARD_OPTIONS.colors.numberKeys};
            }

            .ML__keyboard .MLK__row > div[data-keycap-value="+"],
            .ML__keyboard .MLK__row > div[data-keycap-value="-"],
            .ML__keyboard .MLK__row > div[data-keycap-value="="],
            .ML__keyboard .MLK__row > div[data-keycap-value="\\times"],
            .ML__keyboard .MLK__row > div[data-keycap-value="\\div"],
            .ML__keyboard .MLK__row > div[data-keycap-value="\\cdot"],
            .ML__keyboard .MLK__row > div[data-keycap-value="/"],
            .ML__keyboard .MLK__row > div[data-keycap-value="*"] {
                background: ${KEYBOARD_OPTIONS.colors.operatorKeys};
            }

            .ML__keyboard .MLK__row > div.action,
            .ML__keyboard .MLK__row > div.shift,
            .ML__keyboard .MLK__row > div[data-command*="delete"],
            .ML__keyboard .MLK__row > div[data-command*="moveTo"],
            .ML__keyboard .MLK__row > div[data-command*="hideVirtualKeyboard"] {
                background: ${KEYBOARD_OPTIONS.colors.actionKeys};
            }

            ${perKeyCss}
        `}</style>
      </main>
    </div>
  )
}
