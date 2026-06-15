export type MathFieldElement = HTMLElement & {
    mathVirtualKeyboardPolicy: "manual" | "auto" | "sandboxed"
    value: string
    executeCommand: (command: string | [string, ...unknown[]]) => boolean
    setOptions: (options: Record<string, unknown>) => void
    focused: boolean
}

export type MathVirtualKeyboard = {
    container: HTMLElement | null
    boundingRect?: DOMRectReadOnly
    show: () => void
    hide: () => void
    addEventListener: (type: string, listener: () => void) => void
    removeEventListener: (type: string, listener: () => void) => void
}

export type Placement = "page-bottom" | "page-top" | "inline"
export type Alignment = "left" | "center" | "right"
