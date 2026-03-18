"use client"
import { ChevronDown, X, ChevronLeft } from "lucide-react"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Sidebar as SidebarCN, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "../ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import React from "react"
import { Title } from "../widget/TitleText"
import { SidebarButton } from "@/components/widget/SidebarButton"

export function Sidebar({ ...props }: React.ComponentProps<typeof SidebarCN>) {
    const { toggleSidebar } = useSidebar()
    return (
        <SidebarCN className="bg-primary-dark" {...props}>
            <SidebarHeader className="bg-primary-main text-white flex flex-row items-center justify-between p-4 py-4">
                <div>
                    <h1 className="font-bold block md:hidden">
                        Menu
                    </h1>
                    <span className="hidden md:block">
                        <Title />
                    </span>
                </div>
                <div className="flex gap-2">
                    <Button className="hidden md:flex" variant="ghost" size="icon" onClick={toggleSidebar}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button className="md:hidden" variant="ghost" size="icon" onClick={toggleSidebar}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-primary-dark px-2 pt-2 flex flex-1 flex-col gap-1">
                <SidebarButton route="/app">
                    Scan
                </SidebarButton>
                <Collapsible className="w-full group/collapsible">
                    <CollapsibleTrigger asChild>
                        <SidebarButton route="" additionalClasses="w-full bg-button-main hover:!bg-button-main/70 transition-opacity">
                            Statistics
                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="ml-3 pl-2 border-l-2 border-primary-light/30 border-borderl flex flex-col gap-1 py-1 mt-2">
                            <SidebarButton route="/app/calculator/statistics/probability" additionalClasses="text-sm bg-button-main/70 hover:!bg-button-main/50 transition-opacity">
                                Probability
                            </SidebarButton>
                            <SidebarButton route="/app/calculator/statistics/counting" additionalClasses="text-sm bg-button-main/70 hover:!bg-button-main/50 transition-opacity">
                                Counting
                            </SidebarButton>
                            <SidebarButton route="/app/calculator/statistics/inference" additionalClasses="text-sm bg-button-main/70 hover:!bg-button-main/50 transition-opacity">
                                Inference
                            </SidebarButton>
                            <SidebarButton route="/app/calculator/statistics/data" additionalClasses="text-sm bg-button-main/70 hover:!bg-button-main/50 transition-opacity">
                                Data
                            </SidebarButton>
                            <SidebarButton route="/app/calculator/statistics/reference" additionalClasses="text-sm bg-button-main/70 hover:!bg-button-main/50 transition-opacity">
                                Reference
                            </SidebarButton>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
                <SidebarButton route="/app/calculator">
                    General
                </SidebarButton>
                <SidebarButton route="/app/calculator">
                    Algebra
                </SidebarButton>
                <SidebarButton route="/app/calculator">
                    Proofs and theorem
                </SidebarButton>
                <SidebarButton route="/app/calculator">
                    Linear algebra
                </SidebarButton>
                <SidebarButton route="/app/calculator">
                    Trigonometry
                </SidebarButton>
                <SidebarButton route="/app/calculator">
                    Calculus
                </SidebarButton>
                <SidebarButton route="/app/calculator">
                    Pre-calculus
                </SidebarButton>
            </SidebarContent>
            <SidebarFooter className="bg-primary-dark">

            </SidebarFooter>
        </SidebarCN>
    )
}
