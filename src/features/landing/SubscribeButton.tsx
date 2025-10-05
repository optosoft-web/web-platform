"use client";

import { createCheckoutSession } from "@/actions/stripe.action";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; 
import { useAuthModalStore } from "@/stores/auth-modal-store";
import { useUser } from "@/hooks/use-user";

interface SubscribeButtonProps {
  priceId: string;
  isFeatured?: boolean;
}

export function SubscribeButton({ priceId, isFeatured = false }: SubscribeButtonProps) {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { open: openAuthModal, setPriceId } = useAuthModalStore();

  const { execute, status } = useAction(createCheckoutSession, {
    onSuccess: (data) => {
      if (data?.data?.url) {
        router.push(data.data.url);
      }
    },
    onError: (error) => {
      console.error("Erro ao criar sessão de checkout:", error);
      alert("Falha ao iniciar o checkout. Por favor, tente novamente.");
    },
  });

  const isLoading = status === "executing" || isUserLoading;

  const handleSubscription = () => {
    if (user) {
      execute({ priceId });
    } else {
      setPriceId(priceId);
      openAuthModal();
    }
  };

  const baseClasses = "w-full py-3 px-6 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const featuredClasses = "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary";
  const defaultClasses = "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary";
  const disabledClasses = "bg-gray-400 cursor-not-allowed";

  const buttonClasses = `${baseClasses} ${
    isLoading
      ? disabledClasses
      : isFeatured
      ? featuredClasses
      : defaultClasses
  }`;

  return (
    <button
      onClick={handleSubscription}
      disabled={isLoading}
      className={buttonClasses}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Aguarde...
        </span>
      ) : (
        "Assinar Agora"
      )}
    </button>
  );
}