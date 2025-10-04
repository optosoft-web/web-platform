import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="container py-20 md:py-32 max-w-7xl mx-auto">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="flex flex-col gap-8 items-center text-center lg:items-start lg:text-left">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              O software que simplifica a vida do optometrista autônomo
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty">
              Gerencie pacientes, receitas e clientes em um só lugar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-base font-semibold group">
              Comece agora por R$49,99/mês
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="text-base font-semibold bg-transparent">
              Saiba mais
            </Button>
          </div>
        </div>

        <div className="relative aspect-[4/3] lg:aspect-square mx-auto max-w-xl w-full">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-success/20 blur-3xl" />
          <div className="relative h-full rounded-2xl border bg-card p-8 shadow-2xl">
            <Image
              src="/modern-optometry-dashboard-interface-with-patient-.jpg"
              alt="Dashboard Optosoft"
              width={800}
              height={600}
              className="rounded-lg object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
