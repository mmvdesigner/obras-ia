'use client';

import { Building, Wrench } from 'lucide-react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataProvider } from '@/hooks/use-data';

function LoginPageContent() {
  const { login } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Building className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold">BuildWise</CardTitle>
          <CardDescription>Selecione seu perfil para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              className="w-full h-12 text-lg"
              onClick={() => login('Administrator')}
            >
              <Wrench className="mr-2 h-5 w-5" />
              Entrar como Administrador
            </Button>
            <Button
              variant="secondary"
              className="w-full h-12 text-lg"
              onClick={() => login('Gerente de Obra')}
            >
              <Wrench className="mr-2 h-5 w-5" />
              Entrar como Gerente de Obra
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <DataProvider>
        <LoginPageContent />
      </DataProvider>
    </AuthProvider>
  );
}
