import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
     
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Eye className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">Optosoft</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#funcionalidades"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Funcionalidades
          </Link>
          <Link
            href="#planos"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Planos
          </Link>
          <Link
            href="#contato"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Contato
          </Link>
        </nav>

        <Button size="sm" className="font-medium">
          Teste grátis
        </Button>
      </div>
    </header>
  )
}
