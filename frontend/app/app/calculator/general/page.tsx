"use client"

import type { CSSProperties } from "react"
import { useEffect, useMemo, useRef } from "react"

type MathFieldElement = HTMLElement & {
    mathVirtualKeyboardPolicy: "manual" | "auto" | "sandboxed"
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

export default function GeneralCalculatorPage() {
    const mf = useRef<MathFieldElement | null>(null)
    const inlineKeyboardHostRef = useRef<HTMLDivElement | null>(null)

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

        const initializeMathlive = async () => {
            await import("mathlive")

            if (isCancelled || !mf.current) {
                return
            }

            mf.current.mathVirtualKeyboardPolicy = "manual"

            const keyboard = window.mathVirtualKeyboard
            if (!keyboard) {
                return
            }

            const targetHost =
                KEYBOARD_OPTIONS.placement === "inline"
                    ? inlineKeyboardHostRef.current
                    : document.body

            if (targetHost) {
                keyboard.container = targetHost
            }

            const handleFocusIn = () => {
                keyboard.show()
            }

            mf.current.addEventListener("focusin", handleFocusIn)
            mf.current.focus()

            requestAnimationFrame(() => {
                keyboard.show()
            })

            return () => {
                mf.current?.removeEventListener("focusin", handleFocusIn)
            }
        }

        let cleanup: (() => void) | undefined
        void initializeMathlive().then((dispose) => {
            cleanup = dispose
        })

        return () => {
            isCancelled = true
            window.mathVirtualKeyboard?.hide()
            mf.current?.removeEventListener("focusin", handleFocusIn)
        }
    }, [])

    return (
        <main className="min-h-screen bg-scan-background p-6 md:p-10">
            <section className="mx-auto w-full max-w-5xl space-y-5 rounded-xl border border-primary-light/40 bg-white p-4 md:p-6">
                <h1 className="text-xl font-semibold text-primary-dark">Math Fields Calculator</h1>

                <math-field
                    ref={mf}
                    className="w-full rounded-lg border border-primary-light bg-scan-background px-3 py-2 text-lg"
                    placeholder="Me Thinks..."
                    math-mode-space="\,"
                />
            </section>

            <section className="mx-auto w-full max-w-5xl space-y-5 rounded-xl border border-primary-light/40 bg-white p-4 md:p-6 mt-4">
                {KEYBOARD_OPTIONS.placement === "inline" ? (
                    <div ref={inlineKeyboardHostRef} className="math-vk-inline-host" style={keyboardVars} />
                ) : null}
            </section>

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

                ${KEYBOARD_OPTIONS.placement === "inline"
                    ? `.math-vk-inline-host {
                    position: relative;
                    width: 100%;
                    height: 40vh;
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
    )
}
