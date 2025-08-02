'use client';

import { Building, Wrench, Fingerprint } from 'lucide-react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DataProvider } from '@/hooks/use-data';
import { Separator } from '@/components/ui/separator';

function LoginPageContent() {
  const { login } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent -z-10"/>
      <Card className="w-full max-w-sm shadow-2xl rounded-2xl border-2 border-border/20 backdrop-blur-sm bg-background/80">
        <CardHeader className="text-center p-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Building className="h-10 w-10" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tighter">BuildWise</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-1">
            Selecione seu perfil para acessar o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-semibold"
              onClick={() => login('Administrator')}
            >
              <Fingerprint className="mr-3 h-6 w-6" />
              Administrador
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full h-14 text-lg font-semibold"
              onClick={() => login('Gerente de Obra')}
            >
              <Wrench className="mr-3 h-6 w-6" />
              Gerente de Obra
            </Button>
          </div>
        </CardContent>
        <CardFooter className="p-8 text-center text-sm text-muted-foreground">
            <p>Problemas para acessar? Entre em contato com o suporte.</p>
        </CardFooter>
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
