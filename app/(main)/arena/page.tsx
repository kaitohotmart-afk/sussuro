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
        <main className="min-h-screen pb-20 px-4 bg-background/50">
            {/* Header */}
            <div className="text-center pt-16 pb-20 space-y-6">
                <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full scale-150 animate-pulse-slow" />
                    <div className="relative p-5 bg-white/5 border border-white/10 rounded-full shadow-2xl">
                        <Swords size={48} className="text-accent filter drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase italic">
                        Arena <span className="text-accent">Sussurro</span>
                    </h1>
                    <p className="text-text-secondary max-w-lg mx-auto text-xl font-medium leading-relaxed">
                        Duas histórias entram, apenas uma sai vitoriosa. <br />
                        <span className="text-accent/80">Quem ganha seu voto hoje?</span>
                    </p>
                </div>
            </div>

            {/* Arena Content */}
            <div className="max-w-6xl mx-auto">
                {battle ? (
                    <BattleView battle={battle} />
                ) : (
                    <div className="text-center p-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10 max-w-2xl mx-auto">
                        <div className="text-4xl mb-6 opacity-30">🏟️</div>
                        <p className="text-2xl font-black text-white mb-2 uppercase tracking-tight">A Arena está em Silêncio</p>
                        <p className="text-text-secondary font-medium">
                            Aguardando sussurros dignos de uma batalha. Volte mais tarde!
                        </p>
                    </div>
                )}
            </div>
        </main>
    )
}
