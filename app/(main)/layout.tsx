import { Navbar } from '@/components/layout/Navbar'
import { ChaosNotifications } from '@/components/notifications/ChaosNotifications'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Navbar />
            <ChaosNotifications />
            {children}
        </>
    )
}
