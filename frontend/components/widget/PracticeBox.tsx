import { SquareArrowRightExit } from "lucide-react";
import { InputGroupButton } from "../ui/input-group";
import { useState } from "react";
import { Button } from "../ui/button";

export function PracticeBox({ number, question, questionLtx }: { number: number, question: string, questionLtx: string }){
    
    const handleRedirect = ()=> {}

    return (
        <div className="flex items-center justify-between w-full border rounded-md p-2">
            <div className="text-sm">Question {number}: { question }</div>
            <InputGroupButton onClick={handleRedirect} size="icon-xs">
                <Button variant='ghost'>
                    <SquareArrowRightExit/>
                </Button>
            </InputGroupButton>
        </div>
    )
}