import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-30" />
            </div>

            <div className="container max-w-7xl mx-auto px-4 py-24 md:py-36 lg:py-44">
                <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
                    <Badge
                        variant="secondary"
                        className="px-4 py-1.5 text-sm font-medium"
                    >
                        Plataforma para optometristas
                    </Badge>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
                        Gerencie seu consultório{" "}
                        <span className="text-primary">de forma simples</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty leading-relaxed">
                        Pacientes, receitas, óticas e equipe — tudo em uma plataforma pensada
                        exclusivamente para o optometrista autônomo.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                        <Button size="lg" className="text-base font-semibold group h-12 px-8" asChild>
                            <Link href="/auth/sign-up">
                                Comece agora
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-base font-semibold h-12 px-8"
                            asChild
                        >
                            <Link href="#funcionalidades">Ver funcionalidades</Link>
                        </Button>
                    </div>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-8 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            Sem contrato de fidelidade
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            Suporte incluso
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            Dados seguros na nuvem
                        </div>
                    </div>
                </div>

                {/* Dashboard preview card */}
                <div className="mt-16 md:mt-24 relative max-w-5xl mx-auto">
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
                    <div className="relative rounded-2xl border bg-card shadow-2xl overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-md px-3 py-1">
                                    <Eye className="h-3 w-3" />
                                    app.optosoft.com.br
                                </div>
                            </div>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {[
                                    { label: "Pacientes", value: "247" },
                                    { label: "Receitas", value: "1.023" },
                                    { label: "Óticas", value: "5" },
                                    { label: "Este mês", value: "+34" },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-lg border bg-background p-4 text-center"
                                    >
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 rounded-lg border bg-background p-4 h-32 flex items-end gap-1">
                                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 bg-primary/20 rounded-t"
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                                <div className="rounded-lg border bg-background p-4 space-y-3">
                                    {["Maria Silva", "João Santos", "Ana Costa"].map((name) => (
                                        <div key={name} className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                {name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{name}</p>
                                                <p className="text-xs text-muted-foreground">Paciente recente</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

