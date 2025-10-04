import Link from "next/link"
import { Eye } from "lucide-react"

export function Footer() {
  return (
    <footer id="contato" className="border-t bg-muted/30">
      <div className="container py-12 md:py-16 max-w-7xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Eye className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">Optosoft</span>
            </Link>
            <p className="text-sm text-muted-foreground">Simplificando a gestão para optometristas autônomos.</p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold">Produto</h3>
            <Link
              href="#funcionalidades"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Funcionalidades
            </Link>
            <Link href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold">Empresa</h3>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sobre
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold">Legal</h3>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Termos de Uso
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Optosoft. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
