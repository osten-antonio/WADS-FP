import {Button} from "@/components/ui/button" 

export function SidebarButton(
    { route, children, additionalClasses, ...props }: 
    { route: string, children: React.ReactNode, additionalClasses?: string } 
    & ComponentPropsWithoutRef<typeof Button>
){
    return(
        <Button className={additionalClasses ?? "w-full"} {...props}>
            {children}
        </Button>
    )
}