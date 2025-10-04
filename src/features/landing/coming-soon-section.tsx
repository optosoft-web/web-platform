import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, BarChart3, Sparkles } from "lucide-react"

const comingSoonFeatures = [
  {
    icon: Calendar,
    title: "Integração de agenda",
    description: "Agende consultas e gerencie seu tempo de forma inteligente.",
  },
  {
    icon: DollarSign,
    title: "Sistema de gestão financeira",
    description: "Controle receitas, despesas e fluxo de caixa do seu consultório.",
  },
  {
    icon: BarChart3,
    title: "Dashboards customizados",
    description: "Visualize métricas e indicadores importantes para seu negócio.",
  },
  {
    icon: Sparkles,
    title: "Integração com IA",
    description: "Assistente inteligente para otimizar seu atendimento.",
  },
]

export function ComingSoonSection() {
  return (
    <section className="container py-20 md:py-32 bg-muted/30 max-w-7xl mx-auto">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
          <Badge className="w-fit mx-auto bg-accent text-accent-foreground">Em breve</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Novos recursos a caminho
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">Disponível em breve em novos planos</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mx-auto max-w-6xl">
          {comingSoonFeatures.map((feature) => (
            <Card key={feature.title} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-transparent rounded-bl-full" />
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 mb-4">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
