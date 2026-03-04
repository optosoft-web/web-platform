"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
    Store,
    Users,
    FileText,
    UserPlus,
    TrendingUp,
    TrendingDown,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";

type DashboardData = {
    totals: {
        opticalShops: number;
        patients: number;
        prescriptions: number;
        teamMembers: number;
    };
    thisMonth: {
        patients: number;
        prescriptions: number;
    };
    lastMonth: {
        patients: number;
        prescriptions: number;
    };
    recentPrescriptions: {
        id: string;
        patientName: string;
        opticalShopName: string;
        prescriptionDate: string;
        rightEyeSpherical: string | null;
        leftEyeSpherical: string | null;
        createdAt: Date;
    }[];
    recentPatients: {
        id: string;
        fullName: string;
        phone: string | null;
        createdAt: Date;
    }[];
    prescriptionsPerMonth: {
        month: string;
        value: number;
    }[];
};

type Props = {
    data: DashboardData | null;
};

const monthNames: Record<string, string> = {
    "01": "Jan",
    "02": "Fev",
    "03": "Mar",
    "04": "Abr",
    "05": "Mai",
    "06": "Jun",
    "07": "Jul",
    "08": "Ago",
    "09": "Set",
    "10": "Out",
    "11": "Nov",
    "12": "Dez",
};

function formatMonthLabel(yyyymm: string) {
    const [, mm] = yyyymm.split("-");
    return monthNames[mm] ?? mm;
}

function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function calcChange(current: number, previous: number): { pct: number; positive: boolean } {
    if (previous === 0) return { pct: current > 0 ? 100 : 0, positive: current > 0 };
    const pct = Math.round(((current - previous) / previous) * 100);
    return { pct: Math.abs(pct), positive: pct >= 0 };
}

function formatValue(v: string | null) {
    if (v === null || v === undefined) return "-";
    const n = parseFloat(v);
    if (isNaN(n)) return "-";
    return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
}

const chartConfig = {
    prescriptions: {
        label: "Receitas",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

export function DashboardClient({ data }: Props) {
    if (!data) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-muted-foreground">Seus dados ainda são insuficientes para gerar um dashboard, continue utilizando a plataforma, e logo menos verá aqui.</p>
            </div>
        );
    }

    const patientChange = calcChange(data.thisMonth.patients, data.lastMonth.patients);
    const rxChange = calcChange(data.thisMonth.prescriptions, data.lastMonth.prescriptions);

    const chartData = data.prescriptionsPerMonth.map((item) => ({
        month: formatMonthLabel(item.month),
        prescriptions: item.value,
    }));

    return (
        <div className="flex flex-col gap-6 py-6">
            {/* Page title */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                    Visão geral da sua conta
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardDescription className="text-sm font-medium">Óticas</CardDescription>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totals.opticalShops}</div>
                        <p className="text-xs text-muted-foreground">cadastradas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardDescription className="text-sm font-medium">Pacientes</CardDescription>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totals.patients}</div>
                        <div className="flex items-center gap-1 text-xs">
                            {patientChange.positive ? (
                                <TrendingUp className="h-3 w-3 text-emerald-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span className={patientChange.positive ? "text-emerald-500" : "text-red-500"}>
                                {patientChange.pct}%
                            </span>
                            <span className="text-muted-foreground">vs. mês anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardDescription className="text-sm font-medium">Receitas</CardDescription>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totals.prescriptions}</div>
                        <div className="flex items-center gap-1 text-xs">
                            {rxChange.positive ? (
                                <TrendingUp className="h-3 w-3 text-emerald-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span className={rxChange.positive ? "text-emerald-500" : "text-red-500"}>
                                {rxChange.pct}%
                            </span>
                            <span className="text-muted-foreground">vs. mês anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardDescription className="text-sm font-medium">Membros</CardDescription>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totals.teamMembers}</div>
                        <p className="text-xs text-muted-foreground">na equipe</p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly summary row */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Pacientes este mês</CardTitle>
                        <CardDescription>Novos pacientes cadastrados no mês atual</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.thisMonth.patients}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {data.lastMonth.patients} no mês anterior
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Receitas este mês</CardTitle>
                        <CardDescription>Receitas emitidas no mês atual</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.thisMonth.prescriptions}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {data.lastMonth.prescriptions} no mês anterior
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart + Recent prescriptions */}
            <div className="grid gap-4 lg:grid-cols-7">
                {/* Chart */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Receitas por mês</CardTitle>
                        <CardDescription>Últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <BarChart data={chartData} accessibilityLayer>
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        allowDecimals={false}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar
                                        dataKey="prescriptions"
                                        fill="var(--color-prescriptions)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                                Nenhuma receita nos últimos 6 meses
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent prescriptions */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Últimas receitas</CardTitle>
                        <CardDescription>As 5 receitas mais recentes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.recentPrescriptions.length > 0 ? (
                            <div className="space-y-4">
                                {data.recentPrescriptions.map((rx) => (
                                    <div key={rx.id} className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{rx.patientName}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {rx.opticalShopName} &middot; {formatDate(rx.prescriptionDate)}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-mono">
                                                OD {formatValue(rx.rightEyeSpherical)}
                                            </p>
                                            <p className="text-xs font-mono">
                                                OE {formatValue(rx.leftEyeSpherical)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma receita encontrada</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent patients table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Pacientes recentes</CardTitle>
                        <CardDescription>Últimos pacientes cadastrados</CardDescription>
                    </div>
                    <Link
                        href="/admin/patients"
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                        Ver todos <ArrowRight className="h-3 w-3" />
                    </Link>
                </CardHeader>
                <CardContent>
                    {data.recentPatients.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead className="text-right">Cadastro</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.recentPatients.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell className="font-medium">{patient.fullName}</TableCell>
                                        <TableCell>{patient.phone ?? "-"}</TableCell>
                                        <TableCell className="text-right">
                                            {formatDate(patient.createdAt)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nenhum paciente cadastrado</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
