import { getDailyBattle } from '@/lib/actions/arena'
import { BattleView } from '@/components/arena/BattleView'
import { Swords } from 'lucide-react'

export const metadata = {
    title: 'Arena de Batalha | Sussurro',
    description: 'Vote na melhor história do dia.'
}

export default async function ArenaPage() {
    const battle = await getDailyBattle('historias')

    return (
        <main className="min-h-screen pb-20 px-4">
            {/* Header */}
            <div className="text-center pt-10 pb-12 space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-2 animate-bounce-slow">
                    <Swords size={40} className="text-accent" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                    Batalha Diária
                </h1>
                <p className="text-text-secondary max-w-md mx-auto text-lg">
                    Duas histórias entram, apenas uma sai vencedora. <br />
                    <span className="text-accent font-medium">Quem merece seu voto hoje?</span>
                </p>
            </div>

            {/* Arena Content */}
            {battle ? (
                <BattleView battle={battle} />
            ) : (
                <div className="text-center p-12 bg-surface/50 rounded-2xl border border-dashed border-border max-w-lg mx-auto">
                    <p className="text-xl font-medium mb-2">A Arena está sendo preparada 🏟️</p>
                    <p className="text-text-secondary">
                        Aguardando competidores dignos. Volte mais tarde!
                    </p>
                </div>
            )}
        </main>
    )
}
