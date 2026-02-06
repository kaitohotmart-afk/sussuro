'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <Button
            variant="ghost"
            size="md"
            onClick={handleLogout}
            className="w-full text-error hover:bg-error/10 hover:text-error flex items-center justify-center gap-2"
        >
            <LogOut size={20} />
            Sair da Conta
        </Button>
    )
}
