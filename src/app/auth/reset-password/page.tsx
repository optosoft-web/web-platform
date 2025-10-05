import { AppLogo } from '@/components/shared/app-logo/app-logo'
import { FormResetPassword } from './_components/form.reset-password'

export default function ResetPasswordPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className='w-full flex justify-center'>
                    <AppLogo />
                </div>
                <FormResetPassword />
            </div>
        </div>
    )
}