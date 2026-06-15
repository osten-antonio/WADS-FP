import { SquareArrowRightExit } from "lucide-react";
import { Markdown } from "./Markdown";

export function PracticeBox({ number, question, topicSlug }: { number: number, question: string, questionLtx?: string, topicSlug?: string }){
    const handleRedirect = ()=> {
        localStorage.setItem("practiceQuestion", question)
        const slug = topicSlug || "general"
        const url = slug === "general" ? "/app/calculator" : `/app/calculator/${slug}`
        window.location.href = url
    }

    return (
        <div className="flex items-center justify-between bg-primary-light/30 border-dashed w-full border rounded-md p-2">
            <div className="text-sm">Question {number}: <Markdown content={question} /></div>
            <button
                type="button"
                onClick={handleRedirect}
                className="inline-flex items-center justify-center rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Open in calculator"
            >
                <SquareArrowRightExit className="h-4 w-4"/>
            </button>
        </div>
    )
}