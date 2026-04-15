"use client";

import { Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TrialBannerProps {
    daysRemaining: number;
}

export function TrialBanner({ daysRemaining }: TrialBannerProps) {
    const isUrgent = daysRemaining <= 2;

    return (
        <div
            className={`flex items-center justify-center gap-3 px-4 py-2 text-sm ${
                isUrgent
                    ? "bg-destructive/10 text-destructive border-b border-destructive/20"
                    : "bg-primary/10 text-primary border-b border-primary/20"
            }`}
        >
            <Clock className="h-4 w-4 shrink-0" />
            <span>
                {daysRemaining === 1
                    ? "Último dia do período gratuito!"
                    : `${daysRemaining} dias restantes do período gratuito.`}
            </span>
            <Button asChild size="sm" variant={isUrgent ? "destructive" : "default"} className="h-7 text-xs">
                <Link href="/billing">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Assinar agora
                </Link>
            </Button>
        </div>
    );
}
