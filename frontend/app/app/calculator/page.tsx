import { Result } from "@/components/calculator/Result";
import { GenericCalcPage } from "@/components/GenericCalcLayout";
import { StepBox } from "@/components/widget/StepBox";

export default function Page(){
  return(
    <>
      <GenericCalcPage topic="General" SolutionScreen={(<Result/>)}/>
    </>
  )
}