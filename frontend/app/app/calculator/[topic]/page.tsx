import { GenericCalcPage } from "@/components/GenericCalcLayout";

export default async function Page({ params }: { params: Promise<{ topic: string }> }) {
    const { topic } = await params;
    const availableTopics = [
        "general", "algebra", "calculus", 
        "trigonometry", "statistics",
        "proofs", "linalg", 
        "precalc"
    ];
    const topicIdLabel: Record<string, string> = {
        "general": "General Math",
        "algebra": "Algebra",
        "calculus": "Calculus",
        "trigonometry": "Trigonometry",
        "statistics": "Statistics",
        "proofs": "Proofs and Theorems",
        "linalg": "Linear Algebra",
        "precalc": "Pre-Calculus"
    };
    if(!topic || !availableTopics.includes(topic)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-2xl">Invalid topic: {topic}</p>
            </div>
        );
    }
    

    return(
        <>
            <GenericCalcPage topic={topicIdLabel[topic]} SolutionScreen={undefined}/>
        </>
    )
}