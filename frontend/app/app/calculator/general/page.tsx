"use client"

import { useEffect } from "react"

export default function GeneralCalculatorPage() {
    useEffect(() => {
        void import("mathlive")
    }, [])

    return (
        <main className="min-h-screen bg-scan-background p-6 md:p-10">
            <section className="mx-auto w-full max-w-4xl rounded-xl border border-primary-light/40 bg-white p-4 md:p-6">
                <h1 className="mb-4 text-xl font-semibold text-primary-dark">Math Fields Calculator</h1>
                <math-field
                    className="w-full rounded-lg border border-primary-light bg-scan-background px-3 py-2 text-lg"
                    placeholder="Me Thinks..."
                />
            </section>
        </main>
    )
}
