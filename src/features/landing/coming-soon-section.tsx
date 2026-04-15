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
        title: "Gestão financeira",
        description: "Controle receitas, despesas e fluxo de caixa do seu consultório.",
    },
    {
        icon: BarChart3,
        title: "Relatórios avançados",
        description: "Visualize métricas e indicadores importantes para seu negócio.",
    },
    {
        icon: Sparkles,
        title: "Assistente com IA",
        description: "Assistente inteligente para otimizar seu atendimento.",
    },
]

export function ComingSoonSection() {
    return (
        <section id="em-breve" className="py-20 md:py-32 bg-muted/40">
            <div className="container max-w-7xl mx-auto px-4">
                <div className="flex flex-col gap-12">
                    <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
                        <Badge className="w-fit mx-auto" variant="outline">
                            Em breve
                        </Badge>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                            Novos recursos a caminho
                        </h2>
                        <p className="text-lg text-muted-foreground text-pretty">
                            Estamos sempre melhorando. Esses recursos estarão disponíveis nos próximos planos.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mx-auto max-w-6xl">
                        {comingSoonFeatures.map((feature) => (
                            <Card key={feature.title} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                                <CardHeader>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                                        <feature.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
