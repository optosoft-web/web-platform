"use client";

import { AppLogo } from "@/components/shared/app-logo/app-logo";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import Link from "next/link";
import { headerNavigationData } from "./header.utils";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BadgeCheck, ChevronsUpDown, LogOut, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useRouter } from "next/navigation";

type HeaderProps = {
    initialSession: Session | null;
}
function HamburgerIcon({ className, ...props }: React.SVGAttributes<SVGElement>) {
    return (
        <svg
            className={cn('pointer-events-none', className)}
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M4 12L20 12"
                className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
            />
            <path
                d="M4 12H20"
                className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
            />
            <path
                d="M4 12H20"
                className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
            />
        </svg>
    )
}

export function Header(props: HeaderProps) {
    const isMobile = useIsMobile();
    const router = useRouter();
    const [session, setSession] = useState(props.initialSession);

    useEffect(() => {
        console.log('render')
        const supabaseClient = createClient();
        const { data: authListener } = supabaseClient.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    return (
        <header className="w-full h-full border-b @container/main sticky">
            <div className={cn(
                "grid grid-cols-2 items-center container mx-auto h-full px-4",
                !isMobile && 'grid-cols-3'
            )}>
                <div><AppLogo /></div>
                {!isMobile && (
                    <div className="justify-self-center">
                        <NavigationMenu>
                            <NavigationMenuList>
                                {headerNavigationData.map((item, idx) => (
                                    <NavigationMenuItem key={idx}>
                                        <NavigationMenuLink asChild>
                                            <Link href={item.href}>{item.label}</Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                )}
                <div className="justify-self-end flex gap-2 items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="lg"
                                variant={'ghost'}
                                className="py-2"
                            >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={''} alt={''} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                {!isMobile && (
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{'User'}</span>
                                        <span className="truncate text-xs">{session?.user.email}</span>
                                    </div>
                                )}
                                <ChevronsUpDown className="ml-auto size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={'bottom'}
                            align="center"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        {/* <AvatarImage src={'dd'} alt={'dd'} /> */}
                                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{'Micael'}</span>
                                        <span className="truncate text-xs">{session?.user.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <Sparkles />
                                    Upgrade to Pro
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <BadgeCheck />
                                    Minha conta
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <LogOut />
                                Sair
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {isMobile && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    className="group h-full"
                                    variant="ghost"
                                >
                                    <HamburgerIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-48 p-2">
                                <NavigationMenu className="max-w-none w-full">
                                    <NavigationMenuList className="flex-col items-start gap-1 w-full">
                                        {headerNavigationData.map((link, index) => (
                                            <NavigationMenuItem key={index} className="w-full">
                                                <Button
                                                    variant={'ghost'}
                                                    onClick={(e) => { e.preventDefault(); router.push(link.href) }}
                                                    className={cn(
                                                        "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer no-underline",
                                                    )}
                                                >
                                                    {link.label}
                                                </Button>
                                            </NavigationMenuItem>
                                        ))}
                                    </NavigationMenuList>
                                </NavigationMenu>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </header>
    )
}