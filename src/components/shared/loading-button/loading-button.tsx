import { Button, buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner";
import { VariantProps } from "class-variance-authority"

export function LoadingButton({
    variant,
    size,
    isLoading = false,
    defaultText,
    loadingText,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        isLoading?: boolean
        defaultText: string;
        loadingText: string;
    }) {
    return (
        <Button {...props} disabled={isLoading}>
            {isLoading && <Spinner />}
            {isLoading ? loadingText : defaultText}
        </Button>
    )
}