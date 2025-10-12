import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { iOpticalShopCardProps, iTopicProps } from "./card-optical-shop.types";
import { Button } from "@/components/ui/button";
import { EllipsisVertical } from "lucide-react";

function Topic(props: iTopicProps) {
    return (
        <div>
            <div className="text-muted-foreground">{props.label}</div>
            <div className="truncate" title={String(props.value)}>{props.value}</div>
        </div>
    )
}

export function OpticalShopCard(props: iOpticalShopCardProps) {
    return (
        <Card className="w-full shadow-none p-0">
            <CardHeader className="flex flex-row items-center justify-between pt-6">
                <CardTitle className="flex justify-between w-full">
                    <h2 className="font-semibold text-xl">{props.name}</h2>
                    <div>
                        <Button variant={'ghost'}>
                            <EllipsisVertical />
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="px-6 space-y-2">
                    <Topic label="Total de Pacientes" value={props.totalPatients} />
                    <Topic label="Endereço" value={props.address ?? '-'} />
                </div>
            </CardContent>
            <CardFooter className="border-t flex px-6 pb-0 py-2!">
                <div className="flex gap-1 text-sm">
                    <div className="text-muted-foreground">Criado em</div>
                    <div className="">{props.createdAt}</div>
                </div>
            </CardFooter>
        </Card>
    );
}