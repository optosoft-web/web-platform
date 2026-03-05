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
import { useAction } from "next-safe-action/hooks";
import { ActionGetProfile } from "@/server/actions/admin/profile.actions";

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
    const [displayName, setDisplayName] = useState<string | null>(null);

    const getProfileAction = useAction(ActionGetProfile, {
        onSuccess: ({ data }) => {
            if (data?.fullName) {
                setDisplayName(data.fullName);
            }
        },
    });

    useEffect(() => {
        const supabaseClient = createClient();
        const { data: authListener } = supabaseClient.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        // Try to get display name from user_metadata immediately
        supabaseClient.auth.getUser().then(({ data }) => {
            const meta = data.user?.user_metadata;
            if (meta?.full_name) setDisplayName(meta.full_name);
        });

        // Fetch profile for the most up-to-date fullName
        getProfileAction.execute();

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const userName = displayName || session?.user.user_metadata?.full_name || session?.user.email?.split("@")[0] || "Usuário";
    const initials = userName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w: string) => w[0].toUpperCase())
        .join("");

    return (
        <header className="w-full h-full border-b @container/main sticky top-0 z-40 bg-background">
            <div className={cn(
                "flex items-center justify-between container mx-auto h-full px-4",
                !isMobile && 'grid grid-cols-3'
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
                <div className="justify-self-end flex gap-1 items-center shrink-0">
                    {!isMobile && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="lg"
                                    variant={'ghost'}
                                    className="py-2"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={''} alt={userName} />
                                        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{userName}</span>
                                        <span className="truncate text-xs">{session?.user.email}</span>
                                    </div>
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
                                            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">{userName}</span>
                                            <span className="truncate text-xs">{session?.user.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => router.push("/billing")}>
                                        <Sparkles />
                                        Gerenciar Assinatura
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => router.push("/admin/profile")}>
                                        <BadgeCheck />
                                        Minha conta
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={async () => {
                                    const supabase = createClient();
                                    await supabase.auth.signOut();
                                    router.push("/");
                                }}>
                                    <LogOut />
                                    Sair
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
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
                            <PopoverContent align="end" className="w-56 p-2">
                                {/* User info */}
                                <div className="flex items-center gap-2 px-2 py-2 text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={''} alt={userName} />
                                        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                                        <span className="truncate font-medium">{userName}</span>
                                        <span className="truncate text-xs text-muted-foreground">{session?.user.email}</span>
                                    </div>
                                </div>
                                <div className="my-1 h-px bg-border" />
                                {/* Navigation */}
                                <nav className="flex flex-col gap-0.5">
                                    {headerNavigationData.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant="ghost"
                                            onClick={() => router.push(link.href)}
                                            className="justify-start w-full text-sm font-medium"
                                        >
                                            {link.label}
                                        </Button>
                                    ))}
                                </nav>
                                <div className="my-1 h-px bg-border" />
                                {/* Account actions */}
                                <nav className="flex flex-col gap-0.5">
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push("/billing")}
                                        className="justify-start w-full text-sm font-medium"
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Gerenciar Assinatura
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push("/admin/profile")}
                                        className="justify-start w-full text-sm font-medium"
                                    >
                                        <BadgeCheck className="h-4 w-4 mr-2" />
                                        Minha conta
                                    </Button>
                                </nav>
                                <div className="my-1 h-px bg-border" />
                                <Button
                                    variant="ghost"
                                    onClick={async () => {
                                        const supabase = createClient();
                                        await supabase.auth.signOut();
                                        router.push("/");
                                    }}
                                    className="justify-start w-full text-sm font-medium text-destructive hover:text-destructive"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sair
                                </Button>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </header>
    )
}