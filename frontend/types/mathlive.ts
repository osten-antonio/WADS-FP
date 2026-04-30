import type { DetailedHTMLProps, HTMLAttributes } from "react"

type MathFieldProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
    placeholder?: string
    "math-mode-space"?: string
}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "math-field": MathFieldProps
        }
    }
}

declare module "react/jsx-runtime" {
    namespace JSX {
        interface IntrinsicElements {
            "math-field": MathFieldProps
        }
    }
}

export {}
