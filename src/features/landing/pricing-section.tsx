import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Básico",
    price: "R$ 49,99",
    period: "/mês",
    description: "Perfeito para começar",
    features: [
      "Gerenciamento de pacientes",
      "Gerenciamento de receitas",
      "Gerenciamento de clientes",
      "Suporte por email",
      "Armazenamento seguro",
    ],
    available: true,
    highlighted: true,
  },
  {
    name: "Profissional",
    price: "Em breve",
    period: "",
    description: "Para consultórios em crescimento",
    features: [
      "Tudo do plano Básico",
      "Integração de agenda",
      "Gestão financeira",
      "Dashboards customizados",
      "Suporte prioritário",
    ],
    available: false,
    highlighted: false,
  },
  {
    name: "Premium",
    price: "Em breve",
    period: "",
    description: "Solução completa",
    features: [
      "Tudo do plano Profissional",
      "Integração com IA",
      "Relatórios avançados",
      "API personalizada",
      "Suporte dedicado 24/7",
    ],
    available: false,
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="planos" className="container py-20 md:py-32 max-w-7xl mx-auto">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">Planos e preços</h2>
          <p className="text-lg text-muted-foreground text-pretty">Escolha o plano ideal para o seu consultório</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${plan.highlighted ? "border-primary border-2 shadow-lg" : ""}`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Disponível agora
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  disabled={!plan.available}
                >
                  {plan.available ? "Começar agora" : "Em breve"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
