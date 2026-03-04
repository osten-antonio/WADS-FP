'use client'
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { CheckIcon, CopyIcon, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { StepBox } from "../widget/StepBox";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { HintBox } from "../widget/HintBox";
import { PracticeBox } from "../widget/PracticeBox";

export function Result(){
    const [copied, setCopied] = useState(false)
    const [hidden, setHidden] = useState(false)
    
    const resultValue = "x^2"
    const maskedValue = resultValue.replace(/./g, "•")

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(resultValue);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Optionally handle error (e.g., show a message)
        }
    }

    const toggleHidden = () => setHidden((s) => !s)
    return (
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-xl text-left font-bold">Solution</h1>
            <InputGroup className="w-full">
                <InputGroupInput value={hidden ? maskedValue : resultValue} readOnly />
                <InputGroupAddon align="inline-end">
                    <div className="flex items-center gap-1">
                        <InputGroupButton aria-label="Copy" onClick={handleCopy} size="icon-xs">
                            {copied ? <CheckIcon /> : <CopyIcon />}
                        </InputGroupButton>
                        <InputGroupButton aria-label={hidden ? "Unhide" : "Hide"} onClick={toggleHidden} size="icon-xs">
                            {hidden ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                    </div>
                </InputGroupAddon>
            </InputGroup>
            <Tabs className="w-full flex flex-col gap-2">
                <TabsList className="flex flex-row gap-2">
                    {/* TODO STYLE IT */}
                    <TabsTrigger value="steps" asChild><Button> Steps</Button></TabsTrigger>
                    <TabsTrigger value="hints" asChild><Button>Hints</Button></TabsTrigger>
                    <TabsTrigger value="practices" asChild><Button>Practices</Button></TabsTrigger>
                </TabsList>    
                <TabsContent className="flex gap-2 flex-col" value="steps">
                    <StepBox step={1} summary="Simplify the expression" />
                    <StepBox step={2} summary="Apply the power rule" />
                    <StepBox step={3} summary="Evaluate the derivative" />
                </TabsContent>
                <TabsContent className="flex gap-2 flex-col" value="hints">
                    <Card>
                        <CardHeader>
                            <h1 className="text-left font-bold">Hints</h1>
                            <Separator />
                            <p className="text-justify">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Temporibus reprehenderit aut voluptate sunt illo! Nobis iste officia fuga distinctio obcaecati quod voluptatum nam ad animi iusto. Assumenda, quia necessitatibus. Voluptates.</p>
                        </CardHeader>
                        <CardContent>
                            <HintBox number={1} hint="The derivative of x^2 is 2x." />
                            <HintBox number={2} hint="Use the power rule: d/dx[x^n] = nx^(n-1)." />
                            <HintBox number={3} hint="Apply the constant multiple rule if needed." />

                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent className="flex gap-2 flex-col" value="practices">
                    <div className="flex gap-2 flex-col">
                        <PracticeBox number={1} question="Simplify x^2 + 2x + 1" questionLtx="x^2 + 2x + 1" />
                        <PracticeBox number={1} question="Simplify x^2 + 2x + 1" questionLtx="x^2 + 2x + 1" />
                        <PracticeBox number={1} question="Simplify x^2 + 2x + 1" questionLtx="x^2 + 2x + 1" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
        
    )
}