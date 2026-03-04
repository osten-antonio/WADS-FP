"use client"
import { ChevronDown, X } from "lucide-react"
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
        <SidebarCN {...props}>
            <SidebarHeader className="bg-primary-main text-white flex flex-row items-center justify-between p-4">
                <div>
                    <h1 className="font-bold block md:hidden">
                        Menu
                    </h1>
                    <span className="hidden md:block">
                        <Title />
                    </span>
                </div>
                <Button className="md:hidden" variant="ghost" size="icon" onClick={toggleSidebar}>
                    <X className="h-4 w-4" />
                </Button>
            </SidebarHeader>
            <SidebarContent className="bg-primary-dark px-2 pt-2 flex flex-col gap-1">
                <Collapsible className="w-full group/collapsible">
                    <CollapsibleTrigger asChild>
                        <SidebarButton route="" additionalClasses="w-full bg-button-main hover:!bg-button-main/70 transition-opacity">
                            Statistics
                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="ml-3 pl-2 border-l-2 border-primary-light/30 border-borderl flex flex-col gap-1 py-1 mt-2">
                            <SidebarButton route="" additionalClasses="text-sm bg-button-main/70 hover:!bg-button-main/50 transition-opacity">
                                General
                            </SidebarButton>
                            {/* TODO other stat stuff here */}
                            <SidebarButton route="" additionalClasses="text-sm bg-button-main/70 hover:!bg-button-main/50 transition-opacity">
                                Stuff
                            </SidebarButton>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
                <SidebarButton route="">
                    General
                </SidebarButton>
                <SidebarButton route="">
                    Algebra
                </SidebarButton>
                <SidebarButton route="">
                    Proofs and theorem
                </SidebarButton>
                <SidebarButton route="">
                    Linear algebra
                </SidebarButton>
                <SidebarButton route="">
                    Trigonometry
                </SidebarButton>
                <SidebarButton route="">
                    Calculus
                </SidebarButton>
                <SidebarButton route="">
                    Pre-calculus
                </SidebarButton>
            </SidebarContent>
            <SidebarFooter>

            </SidebarFooter>
        </SidebarCN>
    )
}