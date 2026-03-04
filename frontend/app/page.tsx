import { StepBox } from "@/components/widget/StepBox";

export default function Home() {
  return (
    <>
      <StepBox 
        step={1}
        summary="This is the summary of step 1."
        expression="x + y = z"
        defaultOpen={true}
        explainBody="This is the explanation for step 1."
        className="mx-auto max-w-2xl"
      />
    </>
  );
}
