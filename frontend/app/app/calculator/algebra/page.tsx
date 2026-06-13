"use client"

import type { CSSProperties } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Camera, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { Result } from "@/components/calculator/Result"
import { FunctionSelector } from "@/components/calculator/FunctionSelector"
import { MathKeyboardStyles } from "@/components/calculator/MathKeyboardStyles"
import { KEYBOARD_OPTIONS } from "@/lib/keyboard-config"
import type { MathFieldElement, MathVirtualKeyboard } from "@/lib/mathlive-types"

export default function AlgebraCalculatorPage() {
    const mf = useRef<MathFieldElement | null>(null)
    const inlineKeyboardHostRef = useRef<HTMLDivElement | null>(null)
    const functionSelectorRef = useRef<HTMLDivElement | null>(null)
    const [inlineKeyboardHeight, setInlineKeyboardHeight] = useState<number | null>(null)
    const [functionSelectorHeight, setFunctionSelectorHeight] = useState<number | null>(null)

    const [expression, setExpression] = useState("")
    const [isSolving, setIsSolving] = useState(false)
    const [hasResult, setHasResult] = useState(false)

    const isMobile = useIsMobile()

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

            ; (keyboard as any).layouts = [
                {
                    label: '123',
                    tooltip: 'Numeric',
                    layers: [{
                        rows: [
                            [
                                { latex: 'x^{2}', label: 'x²' },
                                { latex: 'x^{#?}', label: 'xⁿ' },
                                { latex: '\\left|#?\\right|', label: '|x|' },
                                { latex: 'e', label: 'e' },
                                { latex: '\\ln(#?)', label: 'ln' },
                            ],
                            [
                                { latex: '(', label: '(' },
                                { latex: ')', label: ')' },
                                { latex: '^{#?}', label: '^' },
                                { latex: '\\sqrt{#?}', label: '√x' },
                                { latex: '\\log(#?)', label: 'log' },
                            ],
                            [
                                { latex: '7', label: '7', class: 'number' },
                                { latex: '8', label: '8', class: 'number' },
                                { latex: '9', label: '9', class: 'number' },
                                { latex: '\\frac{#?}{#?}', label: '/' },
                                { latex: '\\sin(#?)', label: 'sin' },
                            ],
                            [
                                { latex: '4', label: '4', class: 'number' },
                                { latex: '5', label: '5', class: 'number' },
                                { latex: '6', label: '6', class: 'number' },
                                { latex: '\\times', label: '×' },
                                { latex: '\\cos(#?)', label: 'cos' },
                            ],
                            [
                                { latex: '1', label: '1', class: 'number' },
                                { latex: '2', label: '2', class: 'number' },
                                { latex: '3', label: '3', class: 'number' },
                                { latex: '-', label: '-' },
                                { latex: '\\tan(#?)', label: 'tan' },
                            ],
                            [
                                { latex: '0', label: '0', class: 'number' },
                                { latex: '.', label: '.' },
                                { latex: '=', label: '=' },
                                { latex: '+', label: '+' },
                                { latex: '\\pi', label: 'π' },
                            ],
                            [
                                '[shift]',
                                '[left]',
                                '[right]',
                                '[backspace]',
                                '[return]',
                            ],
                        ]
                    }]
                },
                'alphabetic',
                'symbols',
                'greek',
            ]

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
                                onClick={() => { }}
                            >
                                <Camera className="h-5 w-5" />
                            </Button>
                        </div>
                    </section>

                    <div className="flex gap-2 w-full h-full">
                        <div className="hidden w-full xl:flex xl:flex-row gap-2" style={{ display: effectivePlacement === "inline" ? 'flex' : 'none' }}>
                            <div ref={functionSelectorRef} className="w-1/3 min-w-[250px] max-w-[400px]">
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
                                style={
                                    !isMobile && functionSelectorHeight
                                        ? { ...inlineKeyboardHostStyle, height: `${functionSelectorHeight}px`, minHeight: undefined }
                                        : inlineKeyboardHostStyle
                                }
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

                <MathKeyboardStyles effectivePlacement={effectivePlacement} />
            </main>
        </div>
    )
}
