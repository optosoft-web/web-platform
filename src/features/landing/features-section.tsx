import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Briefcase } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Gerenciamento de pacientes",
    description: "Organize todos os dados dos seus pacientes de forma segura e acessível.",
  },
  {
    icon: FileText,
    title: "Gerenciamento de receitas",
    description: "Crie, edite e armazene receitas oftalmológicas com facilidade.",
  },
  {
    icon: Briefcase,
    title: "Gerenciamento de clientes",
    description: "Mantenha um relacionamento próximo com seus clientes e histórico completo.",
  },
]

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="container py-20 md:py-32 max-w-7xl mx-auto">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Funcionalidades atuais
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Tudo que você precisa para gerenciar seu consultório com eficiência
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-6xl">
          {features.map((feature) => (
            <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
