'use client'
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { CheckIcon, CopyIcon, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { StepBox } from "../widget/StepBox";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { HintBox } from "../widget/HintBox";
import { PracticeBox } from "../widget/PracticeBox";

export function Result(){
    const [copied, setCopied] = useState(false)
    const [hidden, setHidden] = useState(false)
    const [activeTab, setActiveTab] = useState<string | null>(null)
    const [loadingTabs, setLoadingTabs] = useState<Record<string, boolean>>({})
    const [tabData, setTabData] = useState<Record<string, boolean>>({})
    
    const resultValue = "x^2"
    const maskedValue = resultValue.replace(/./g, "•")

    const handleTabChange = async (value: string) => {
        setActiveTab(value);
        if (!tabData[value]) {
            setLoadingTabs(prev => ({ ...prev, [value]: true }));
            // Simulate dynamic fetch
            await new Promise(resolve => setTimeout(resolve, 1500));
            setLoadingTabs(prev => ({ ...prev, [value]: false }));
            setTabData(prev => ({ ...prev, [value]: true }));
        }
    }

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
            <Tabs className="w-full flex flex-col gap-2" value={activeTab || ""} onValueChange={handleTabChange}>
                <TabsList className="flex flex-row gap-2">
                    {/* TODO STYLE IT */}
                    <TabsTrigger value="steps" asChild><Button variant={activeTab === 'steps' ? 'default' : 'outline'}> Steps</Button></TabsTrigger>
                    <TabsTrigger value="hints" asChild><Button variant={activeTab === 'hints' ? 'default' : 'outline'}>Hints</Button></TabsTrigger>
                    <TabsTrigger value="practices" asChild><Button variant={activeTab === 'practices' ? 'default' : 'outline'}>Practices</Button></TabsTrigger>
                </TabsList>    
                <TabsContent className="flex gap-2 flex-col min-h-[100px] justify-center" value="steps">
                    {loadingTabs['steps'] ? (
                        <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin" /></div>
                    ) : tabData['steps'] && (
                        <>
                            <StepBox step={1} summary="Simplify the expression" />
                            <StepBox step={2} summary="Apply the power rule" />
                            <StepBox step={3} summary="Evaluate the derivative" />
                        </>
                    )}
                </TabsContent>
                <TabsContent className="flex gap-2 flex-col min-h-[100px] justify-center" value="hints">
                    {loadingTabs['hints'] ? (
                        <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin" /></div>
                    ) : tabData['hints'] && (
                        <Card>
                            <CardHeader>
                                <h1 className="text-left font-bold">Hints</h1>
                                <Separator />
                                <p className="text-justify">The solution involves applying standard rules of calculus. Consider the following hints to help you understand the process.</p>
                            </CardHeader>
                            <CardContent>
                                <HintBox number={1} hint="The derivative of x^2 is 2x." />
                                <HintBox number={2} hint="Use the power rule: d/dx[x^n] = nx^(n-1)." />
                                <HintBox number={3} hint="Apply the constant multiple rule if needed." />
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                <TabsContent className="flex gap-2 flex-col min-h-[100px] justify-center" value="practices">
                    {loadingTabs['practices'] ? (
                        <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin" /></div>
                    ) : tabData['practices'] && (
                        <div className="flex gap-2 flex-col">
                            <PracticeBox number={1} question="Simplify x^2 + 2x + 1" questionLtx="x^2 + 2x + 1" />
                            <PracticeBox number={2} question="Simplify 2x^2 - 4x" questionLtx="2x^2 - 4x" />
                            <PracticeBox number={3} question="Simplify x^3 + 3x^2" questionLtx="x^3 + 3x^2" />
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
        
    )
}