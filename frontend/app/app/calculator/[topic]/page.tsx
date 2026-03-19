import { GenericCalcPage } from "@/components/GenericCalcLayout";
import { CALCULATOR_TOPIC_LABELS, CALCULATOR_TOPIC_OPTIONS } from "@/lib/calculator-topics";

export default async function Page({ params }: { params: Promise<{ topic: string }> }) {
    const { topic } = await params;
    const availableTopics = CALCULATOR_TOPIC_OPTIONS.map((item) => item.slug);
    if(!topic || !availableTopics.includes(topic as (typeof availableTopics)[number])) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-2xl">Invalid topic: {topic}</p>
            </div>
        );
    }
    

    return(
        <>
            <GenericCalcPage topic={CALCULATOR_TOPIC_LABELS[topic as keyof typeof CALCULATOR_TOPIC_LABELS]} SolutionScreen={undefined}/>
        </>
    )
}
