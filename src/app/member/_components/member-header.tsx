"use client";

import { AppLogo } from "@/components/shared/app-logo/app-logo";
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MemberHeaderProps {
    ownerName: string;
    memberName: string;
    memberEmail: string;
}

const NAV_ITEMS = [
    { label: "Início", href: "/member" },
    { label: "Pacientes", href: "/member/patients" },
    { label: "Receitas", href: "/member/prescriptions" },
];

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
    );
}

export function MemberHeader({ ownerName, memberName, memberEmail }: MemberHeaderProps) {
    const isMobile = useIsMobile();
    const router = useRouter();
    const pathname = usePathname();

    const initials = memberName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <header className="w-full h-full border-b sticky top-0 z-40 bg-background">
            <div
                className={cn(
                    "flex items-center justify-between container mx-auto h-full px-4",
                    !isMobile && "grid grid-cols-3",
                )}
            >
                <div className="flex items-center gap-4">
                    <AppLogo />
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive =
                                item.href === "/member"
                                    ? pathname === "/member"
                                    : pathname.startsWith(item.href);
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        size="sm"
                                        className="text-sm"
                                    >
                                        {item.label}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {!isMobile && (
                    <div className="justify-self-center">
                        <Badge variant="secondary" className="text-xs font-normal py-1 px-3">
                            Vinculado a {ownerName}
                        </Badge>
                    </div>
                )}

                <div className="justify-self-end flex gap-1 items-center shrink-0">
                    {!isMobile && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="lg" variant="ghost" className="py-2">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{memberName}</span>
                                        <span className="truncate text-xs">{memberEmail}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                side="bottom"
                                align="center"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">{memberName}</span>
                                            <span className="truncate text-xs">{memberEmail}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={async () => {
                                        const supabase = createClient();
                                        await supabase.auth.signOut();
                                        router.push("/");
                                    }}
                                >
                                    <LogOut />
                                    Sair
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {isMobile && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button className="group h-full" variant="ghost">
                                    <HamburgerIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-56 p-2">
                                {/* User info */}
                                <div className="flex items-center gap-2 px-2 py-2 text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                                        <span className="truncate font-medium">{memberName}</span>
                                        <span className="truncate text-xs text-muted-foreground">{memberEmail}</span>
                                    </div>
                                </div>
                                <div className="my-1 h-px bg-border" />
                                {/* Vinculado badge */}
                                <div className="px-2 py-1.5">
                                    <Badge variant="secondary" className="text-xs font-normal py-1 px-3">
                                        Vinculado a {ownerName}
                                    </Badge>
                                </div>
                                <div className="my-1 h-px bg-border" />
                                {/* Navigation */}
                                <nav className="flex flex-col gap-0.5">
                                    {NAV_ITEMS.map((item) => {
                                        const isActive =
                                            item.href === "/member"
                                                ? pathname === "/member"
                                                : pathname.startsWith(item.href);
                                        return (
                                            <Button
                                                key={item.href}
                                                variant={isActive ? "secondary" : "ghost"}
                                                onClick={() => router.push(item.href)}
                                                className="justify-start w-full text-sm font-medium"
                                            >
                                                {item.label}
                                            </Button>
                                        );
                                    })}
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
    );
}
