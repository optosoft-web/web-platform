"use client";

import { createCheckoutSession } from "@/actions/stripe.action";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export function SubscribeButton({priceId}: {priceId: string}) {
  const router = useRouter();
  const { execute, result, status } = useAction(createCheckoutSession, {
    onSuccess: (data) => {
      if (data?.data.url) {
        // Redireciona para a página de checkout da Stripe
        router.push(data.data.url);
      }
    },
    onError: (error) => {
      console.error("Ocorreu um erro:", error);
      alert("Falha ao iniciar o checkout. Tente novamente.");
    },
  });

  const isLoading = status === "executing";

  return (
    <button
      onClick={() => execute({ priceId })}
      disabled={isLoading}
    >
      {isLoading ? "Aguarde..." : "Assinar Agora"}
    </button>
  );
}