import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { Title } from "../widget/TitleText"

interface HeaderProps {
    onToggle: () => void;
    onLogout: () => void;
    onPFPClick: () => void;
}

export function Header({
    onToggle, 
    onLogout, 
    onPFPClick
}: HeaderProps){
    const username = 'aaa';
    return (
        <header className="bg-primary-main relative z-20 flex justify-between items-center p-4 text-white w-full py-4.5">
            <SidebarTrigger className="md:hidden">
                <Menu />
            </SidebarTrigger>
            <span className="md:invisible">
                <Title />
            </span>
            <div className="flex items-center gap-4">
                <Button className="hidden" onClick={onLogout}>Logout</Button>
                <Avatar onClick={onPFPClick} className="cursor-pointer">
                    <AvatarImage src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg" />
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}