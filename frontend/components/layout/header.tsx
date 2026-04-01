import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { Title } from "../widget/TitleText"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
    UserIcon,
    UserPen,
    LogOut,
} from "lucide-react"

interface HeaderProps {
    isAuthenticated: boolean;
    onLogout: () => void;
    onProfile: () => void;
    onSignup: () => void;
    onLogin: () => void;
}

export function Header({
    isAuthenticated,
    onLogout, 
    onProfile,
    onSignup,
    onLogin
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="rounded-full"
                          aria-label="Open account menu"
                        >
                          <Avatar className="cursor-pointer">
                              <AvatarImage src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg" />
                              <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {isAuthenticated ? (
                          <>
                            <DropdownMenuItem onClick={onProfile}>
                              <UserIcon />
                              Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onLogout}>
                              <LogOut />
                              Logout
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={onLogin}>
                              <UserIcon />
                              Login
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onSignup}>
                              <UserPen />
                              Sign Up
                            </DropdownMenuItem>
                          </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
