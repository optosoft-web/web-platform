import { Toaster } from "@/components/ui/sonner"
import { AuthModal } from "@/features/landing/modals/auth-modal"
import { Analytics } from "@vercel/analytics/next"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import type { Metadata } from "next"
import type React from "react"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Optosoft - Software para Optometristas Autônomos",
  description:
    "Gerencie pacientes, receitas e clientes em um só lugar. O software que simplifica a vida do optometrista autônomo.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
        <AuthModal />
        <Toaster />
      </body>
    </html>
  )
}
