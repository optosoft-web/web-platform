import { AppSidebar } from "@/components/app-sidebar"
import { AppLogo } from "@/components/shared/app-logo/app-logo"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { IconTrendingUp } from "@tabler/icons-react"
import { TabelaDePacientes } from "./_components/data-table"

export const pacientesMock = [
  {
    id: "PAC001",
    nome: "Ana Silva",
    dataNascimento: "1985-05-15",
    ultimaConsulta: "12/09/2024 (1 ano)",
    status: "Ativo",
    contato: "(11) 98765-4321",
  },
  {
    id: "PAC002",
    nome: "Bruno Costa",
    dataNascimento: "1992-11-20",
    ultimaConsulta: "05/01/2023",
    status: "Aguardando Retorno",
    contato: "(21) 91234-5678",
  },
  {
    id: "PAC003",
    nome: "Carla Dias",
    dataNascimento: "1978-02-10",
    ultimaConsulta: "28/07/2024",
    status: "Ativo",
    contato: "(31) 99988-7766",
  },
  {
    id: "PAC004",
    nome: "Daniel Almeida",
    dataNascimento: "2001-08-30",
    ultimaConsulta: "15/03/2022",
    status: "Inativo",
    contato: "(41) 98877-6655",
  },
  {
    id: "PAC005",
    nome: "Eduarda Lima",
    dataNascimento: "1995-12-01",
    ultimaConsulta: "10/10/2024",
    status: "Ativo",
    contato: "(51) 97766-5544",
  },
  {
    id: "PAC006",
    nome: "Fábio Pereira",
    dataNascimento: "1988-07-22",
    ultimaConsulta: "03/04/2023",
    status: "Aguardando Retorno",
    contato: "(61) 96655-4433",
  },
];

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="pr-4">
            <AppLogo />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 @container/main">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            <Card className="col-span-1 @xl/main:col-span-2 @5xl/main:col-span-1">
              <CardHeader>
                <CardDescription>Total de Pacientes</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  $1,250.00
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <IconTrendingUp />
                    +12.5%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Trending up this month <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Visitors for the last 6 months
                </div>
              </CardFooter>
            </Card>
            <Card className="">
              <CardHeader>
                <CardDescription>Total de Óticas</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  $1,250.00
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <IconTrendingUp />
                    +12.5%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Trending up this month <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Visitors for the last 6 months
                </div>
              </CardFooter>
            </Card>
            <Card className="">
              <CardHeader>
                <CardDescription>Prescrições emitidas</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  $1,250.00
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <IconTrendingUp />
                    +12.5%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Trending up this month <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Visitors for the last 6 months
                </div>
              </CardFooter>
            </Card>
          </div>
          {/* <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" /> */}
          <TabelaDePacientes data={pacientesMock} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
