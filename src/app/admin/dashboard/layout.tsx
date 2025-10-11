import { Toaster } from "@/components/ui/sonner"
import { getUserSubscription } from "@/server/actions/admin/subscription.action"
import { Analytics } from "@vercel/analytics/next"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
    title: "Dashboard - Optosoft",
    description: "Home page of Optosoft",
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const subscription = await getUserSubscription();

    const invalidStatus = [
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
    ];

    const currentStatus = subscription.data?.status;

    if (currentStatus && invalidStatus.indexOf(currentStatus) !== -1) {
        console.log("A assinatura tem um status inválido:", currentStatus);
    }

    return (
        <html lang="pt-BR">
            <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased dark`}>
                <div className="flex items-center justify-center min-h-screen">
                    {children}
                </div>
                <Analytics />
                <Toaster />
            </body>
        </html>
    )
}