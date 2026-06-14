"use client"

import { useMemo } from "react"
import { KEYBOARD_OPTIONS, escapeCssAttr } from "@/lib/keyboard-config"
import type { Placement } from "@/lib/mathlive-types"

interface MathKeyboardStylesProps {
    effectivePlacement: Placement | "page-bottom"
}

export function MathKeyboardStyles({ effectivePlacement }: MathKeyboardStylesProps) {
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

    return (
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
                --keycap-font-size: ${KEYBOARD_OPTIONS.sizing.keycapFontSizePx}px;
                --keycap-gap: ${KEYBOARD_OPTIONS.sizing.keycapGapPx}px;
                --vk-edge-offset: ${KEYBOARD_OPTIONS.edgeOffsetPx}px;
                --keyboard-padding-horizontal: 10px;
                --keyboard-padding-top: 6px;
                --keyboard-padding-bottom: 4px;
                --keyboard-zindex: 120;
            }

            /* Make keycaps stretch equally to fill the full keyboard width */
            .ML__keyboard .MLK__row,
            .math-vk-inline-host .MLK__row {
                flex: 1;
            }
            .ML__keyboard .MLK__row > div,
            .math-vk-inline-host .MLK__row > div {
                flex: 1 1 0;
                max-width: none !important;
            }

            ${effectivePlacement === "inline"
                ? `.math-vk-inline-host {
                position: relative;
                width: 100%;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                background-color: var(--keyboard-background);
            }

            .math-vk-inline-host .ML__keyboard {
                width: 100%;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
            }

            .math-vk-inline-host .MLK__backdrop {
                border-radius: 12px;
                background-color: transparent !important;
            }`
                : `body > .ML__keyboard {
                position: fixed;
                z-index: 120;
                width: calc(100vw - 1rem);
                left: 0.5rem;
                right: 0.5rem;
                ${KEYBOARD_OPTIONS.placement === "page-top" ? "top: var(--vk-edge-offset);" : "bottom: var(--vk-edge-offset);"}
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
    )
}
