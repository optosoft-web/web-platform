import { GalleryVerticalEnd } from 'lucide-react'
import { FormForgotPassword } from './_components/form.forgot-password'
import { AppLogo } from '@/components/shared/app-logo/app-logo'

export default function ForgotPasswordPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className='w-full flex justify-center'>
                    <AppLogo />
                </div>
                <FormForgotPassword />
            </div>
        </div>
    )
}