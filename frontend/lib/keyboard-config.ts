import type { Placement, Alignment } from "@/lib/mathlive-types"

export const KEYBOARD_OPTIONS = {
    placement: "inline" as Placement,
    alignment: "center" as Alignment,
    edgeOffsetPx: 12,
    sizing: {
        keycapHeightPx: 52,
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

export function escapeCssAttr(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}
