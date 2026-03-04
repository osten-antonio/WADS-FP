import {Button} from "@/components/ui/button" 
import { ComponentPropsWithoutRef } from "react"

export function SidebarButton(
    { route, children, additionalClasses, ...props }: 
    { route: string, children: React.ReactNode, additionalClasses?: string } 
    & ComponentPropsWithoutRef<typeof Button>
){
    return(
        <Button className={additionalClasses ?? "w-full bg-button-main hover:!bg-button-main/70 transition-opacity"} {...props}>
            {children}
        </Button>
    )
}