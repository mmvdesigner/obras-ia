'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function SettingsPageContent() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user?.role !== 'Administrator') {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if(loading || !user || user?.role !== 'Administrator') {
        return <div className="flex h-full w-full items-center justify-center">Carregando ou acesso não autorizado...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">Gerencie as configurações da aplicação.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Configurações Gerais</CardTitle>
                    <CardDescription>Esta área está em desenvolvimento.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Em breve, aqui você poderá gerenciar usuários, permissões e outras configurações do sistema.</p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <SettingsPageContent />
    );
}
