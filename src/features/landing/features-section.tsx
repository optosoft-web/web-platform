import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Store, UserPlus, Printer, Shield } from "lucide-react"

const features = [
    {
        icon: Users,
        title: "Gestão de pacientes",
        description:
            "Cadastre pacientes com nome, CPF, RG, telefone e data de nascimento. Acesse o histórico completo a qualquer momento.",
    },
    {
        icon: FileText,
        title: "Receitas oftalmológicas",
        description:
            "Crie receitas com grau esférico, cilíndrico, eixo, DNP e adição. Visualize e imprima com um clique.",
    },
    {
        icon: Store,
        title: "Múltiplas óticas",
        description:
            "Trabalhe em diversas óticas e organize pacientes e receitas por estabelecimento de forma independente.",
    },
    {
        icon: UserPlus,
        title: "Equipe de colaboradores",
        description:
            "Convide membros da equipe e controle quais óticas cada um pode acessar, com permissões restritas.",
    },
    {
        icon: Printer,
        title: "Impressão profissional",
        description:
            "Gere receitas prontas para impressão com layout limpo e profissional, incluindo assinatura do optometrista.",
    },
    {
        icon: Shield,
        title: "Segurança na nuvem",
        description:
            "Seus dados ficam seguros com criptografia e backups automáticos. Acesse de qualquer lugar com internet.",
    },
]

export function FeaturesSection() {
    return (
        <section id="funcionalidades" className="container py-20 md:py-32 max-w-7xl mx-auto px-4">
            <div className="flex flex-col gap-12">
                <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                        Funcionalidades
                    </p>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                        Tudo que você precisa em um só lugar
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Ferramentas pensadas para o dia a dia do optometrista autônomo
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-6xl">
                    {features.map((feature) => (
                        <Card
                            key={feature.title}
                            className="group border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                        >
                            <CardHeader>
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base leading-relaxed">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
