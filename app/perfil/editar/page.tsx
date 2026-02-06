import { createClient } from '@/lib/supabase/server'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { Card } from '@/components/ui/Card'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EditProfilePage() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch current profile
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-surface border-b border-border px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href={`/perfil/${profile.username}`} className="text-text-secondary hover:text-text-primary">
                        ← Voltar
                    </Link>
                    <h1 className="text-lg font-bold">Editar Perfil</h1>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-md mx-auto p-4">
                <Card>
                    <EditProfileForm user={user} profile={profile} />
                </Card>
            </main>
        </div>
    )
}
