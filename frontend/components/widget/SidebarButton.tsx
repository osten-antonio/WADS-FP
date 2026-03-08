"use client"

import {Button} from "@/components/ui/button" 
import { ComponentPropsWithoutRef } from "react"
import { useRouter } from "next/navigation"

export function SidebarButton(
    { route, children, additionalClasses, ...props }: 
    { route: string, children: React.ReactNode, additionalClasses?: string } 
    & ComponentPropsWithoutRef<typeof Button>
){
    const router = useRouter()
    const handleClick = () => {
        if (route) {
            router.push(route)
        }
    }

    return(
        <Button
            className={additionalClasses ?? "w-full bg-button-main hover:bg-button-main/70! transition-opacity"}
            onClick={handleClick}
            {...props}
        >
            {children}
        </Button>
    )
}