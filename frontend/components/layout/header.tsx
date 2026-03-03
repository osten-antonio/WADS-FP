import { JSX } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Hamburger } from "lucide-react";


export function Header(
    onToggle: () => void, 
    onLogout: () => void, 
    onPFPClick: () => void
): JSX.Element {
    const username = 'aaa';
    return (
        <header className="justify-between items-center p-4 bg-black text-white">
            <Button onClick={onToggle}><Hamburger/></Button>
            <h1>Calculator name</h1>
            <div>
                <Button className="hidden" onClick={onLogout}>Logout</Button>
                <Avatar onClick={onPFPClick}>
                    <AvatarImage src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg" />
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}