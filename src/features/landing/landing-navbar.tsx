"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const WHATSAPP_URL =
    "https://wa.me/5519983530073?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Optosoft%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.";

const navLinks = [
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Em breve", href: "#em-breve" },
    { label: "Planos", href: "#planos" },
    { label: "Contato", href: WHATSAPP_URL, external: true },
];

export function LandingNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container flex h-16 max-w-7xl mx-auto items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Eye className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        <span className="text-primary">Opto</span>soft
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) =>
                        link.external ? (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        )
                    )}
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/auth/sign-in">Entrar</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/auth/sign-up">Criar conta</Link>
                    </Button>
                </div>

                {/* Mobile toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Menu"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Mobile menu */}
            <div
                className={cn(
                    "md:hidden overflow-hidden transition-all duration-300 border-t",
                    mobileOpen ? "max-h-80" : "max-h-0 border-t-0"
                )}
            >
                <div className="container max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
                    {navLinks.map((link) =>
                        link.external ? (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setMobileOpen(false)}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        )
                    )}
                    <div className="flex flex-col gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/auth/sign-in">Entrar</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/auth/sign-up">Criar conta</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
