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
        <header className="w-full h-full border-b sticky">
            <div
                className={cn(
                    "grid grid-cols-2 items-center container mx-auto h-full px-4",
                    !isMobile && "grid-cols-3",
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

                <div className="justify-self-end flex gap-2 items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="lg" variant="ghost" className="py-2">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                </Avatar>
                                {!isMobile && (
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{memberName}</span>
                                        <span className="truncate text-xs">{memberEmail}</span>
                                    </div>
                                )}
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
                            {isMobile && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                                        Vinculado a {ownerName}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {NAV_ITEMS.map((item) => (
                                        <DropdownMenuItem
                                            key={item.href}
                                            onClick={() => router.push(item.href)}
                                        >
                                            {item.label}
                                        </DropdownMenuItem>
                                    ))}
                                </>
                            )}
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
                </div>
            </div>
        </header>
    );
}
