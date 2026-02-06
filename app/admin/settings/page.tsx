'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Save, AlertTriangle, Moon, Sun, Bell } from 'lucide-react'

export default function AdminSettingsPage() {
    const [systemMessage, setSystemMessage] = useState('')
    const [maintenanceMode, setMaintenanceMode] = useState(false)

    const handleSave = () => {
        // Mock save functionality
        alert('Configurações salvas (Simulação)')
    }

    return (
        <div className="p-8 space-y-8 max-w-4xl">
            <h1 className="text-2xl font-bold text-text-primary">Configurações do Sistema</h1>

            {/* System Announcement */}
            <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <Bell className="text-accent" />
                    <h2 className="text-lg font-bold text-text-primary">Anúncio Global</h2>
                </div>
                <p className="text-sm text-text-secondary">
                    Mensagem que aparecerá no topo do feed para todos os usuários.
                </p>
                <div className="space-y-4">
                    <Input
                        label="Mensagem do Sistema"
                        value={systemMessage}
                        onChange={(e) => setSystemMessage(e.target.value)}
                        placeholder="Ex: Manutenção programada para as 22h..."
                    />
                    <Button onClick={handleSave}>
                        <Save size={16} className="mr-2" />
                        Atualizar Anúncio
                    </Button>
                </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="text-red-500" />
                    <h2 className="text-lg font-bold text-red-500">Zona de Perigo</h2>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                    <div>
                        <h3 className="font-bold text-text-primary">Modo Manutenção</h3>
                        <p className="text-sm text-text-secondary">
                            Bloqueia o acesso de usuários não-admin.
                        </p>
                    </div>
                    <button
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                        className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                            ${maintenanceMode ? 'bg-red-500' : 'bg-surface-hover'}
                        `}
                    >
                        <span
                            className={`
                                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}
                            `}
                        />
                    </button>
                </div>
            </section>
        </div>
    )
}
