import { X } from "lucide-react"
import { Button } from "../ui/button"
import { Sidebar as SidebarCN, SidebarContent, SidebarFooter, SidebarHeader } from "../ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"

export function Sidebar() {
    return (
        <SidebarCN>
            <SidebarHeader>
                <h1>
                    title
                </h1>
                <Button>
                    <X />
                </Button>
            </SidebarHeader>
            <SidebarContent>
                <Collapsible>
                    <CollapsibleTrigger>
                        <Button>
                            Statistics
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <Button>
                        </Button>
                    </CollapsibleContent>
                </Collapsible>
                <Button>Algebra</Button>
                <Button>Proofs and theorem</Button>
                <Button>Linear algebra</Button>
                <Button>Trigonometry</Button>
                <Button>Calculus</Button>
                <Button>Pre-calculus</Button> 
            </SidebarContent>
            <SidebarFooter>

            </SidebarFooter>
        </SidebarCN>
    )
}