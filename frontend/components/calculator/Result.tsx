'use client'
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { CheckIcon, CopyIcon, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { StepBox } from "../widget/StepBox";
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
            console.log(activeTab);
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(resultValue);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Optionally handle error (e.g., show a message)
        }
    }

    const toggleHidden = () => setHidden((s) => !s)
    return (
        <div className="w-full flex flex-col gap-4 min-h-[400px]">
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
                    <TabsTrigger value="steps" asChild>
                        <Button className="bg-white text-black hover:bg-button-main/20 data-[state=active]:bg-[var(--color-button-main)] data-[state=active]:text-white "> Steps</Button>
                    </TabsTrigger>
                    <TabsTrigger value="hints" asChild>
                        <Button className="bg-white text-black hover:bg-button-main/20 data-[state=active]:bg-[var(--color-button-main)] data-[state=active]:text-white ">Hints</Button>
                    </TabsTrigger>
                    <TabsTrigger value="practices" asChild>
                        <Button className="bg-white text-black hover:bg-button-main/20 data-[state=active]:bg-[var(--color-button-main)] data-[state=active]:text-white ">Practices</Button>
                    </TabsTrigger>
                </TabsList>    
                <TabsContent className="flex gap-2 flex-col min-h-[100px] justify-center" value="steps">
                    {loadingTabs['steps'] ? (
                        <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin" /></div>
                    ) : tabData['steps'] && (
                        <>
                            <StepBox 
                                step={1} 
                                summary="Simplify the expression **$(x + 1)^2$**" 
                                expression="(x + 1)^2"
                                explainBody="Expand using **$(a + b)^2 = a^2 + 2ab + b^2$** where $a = x$ and $b = 1$"
                            />
                            <StepBox 
                                step={2} 
                                summary="Apply the power rule: **$\\frac{d}{dx}[x^n] = nx^{n-1}$**"
                                expression="2x + 2"
                                explainBody="The derivative of **$x^2$** is **$2x$**, derivative of **$2x$** is **$2$**, derivative of **$1$** is **$0$**"
                            />
                            <StepBox 
                                step={3} 
                                summary="Evaluate the derivative: **$f'(x) = 2x + 2$**"
                                expression="2x + 2"
                                explainBody="The final derivative is **$2x + 2$**. This represents the instantaneous rate of change at any point $x$."
                            />
                        </>
                    )}
                </TabsContent>
                <TabsContent className="flex gap-2 flex-col min-h-[100px] h-full justify-center" value="hints">
                    {loadingTabs['hints'] ? (
                        <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin" /></div>
                    ) : tabData['hints'] && (
                        <div className="rounded-2xl drop-shadow-2xl p-1 border-dashed border">
                            <div className="bg-primary-light/30 rounded-xl p-2">
                                <h1 className="text-left font-bold">Hints</h1>
                                <Separator />
                                <p className="text-justify">The solution involves applying standard rules of calculus. Consider the following hints to help you understand the process.</p>
                            </div>
                            <div className="bg-primary-light/30 rounded-xl mt-2 p-2 text-left">
                                <HintBox number={1} hint="The derivative of **$x^2$** is **$2x$** (power rule)." />
                                <HintBox number={2} hint="Use the power rule: **$\\frac{d}{dx}[x^n] = nx^{n-1}$** for each term." />
                                <HintBox number={3} hint="Apply the **constant multiple rule**: **$\\frac{d}{dx}[c \\cdot f(x)] = c \\cdot f'(x)$** and **sum rule**: **$\\frac{d}{dx}[f(x) + g(x)] = f'(x) + g'(x)$**." />
                            </div>
                        </div>
                    )}
                </TabsContent>
                <TabsContent className="flex gap-2 flex-col min-h-[100px] justify-center" value="practices">
                    {loadingTabs['practices'] ? (
                        <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin" /></div>
                    ) : tabData['practices'] && (
                        <div className="flex gap-2 flex-col">
                            <PracticeBox number={1} question="Find derivative of $(x + 2)^2$" questionLtx="\\frac{d}{dx}[(x + 2)^2]" />
                            <PracticeBox number={2} question="Find derivative of $3x^2 - 6x$" questionLtx="\\frac{d}{dx}[3x^2 - 6x]" />
                            <PracticeBox number={3} question="Find derivative of $x^3 + 3x^2$" questionLtx="\\frac{d}{dx}[x^3 + 3x^2]" />
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
        
    )
}