import { useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { LockKeyhole, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const { user, loading, refreshUser } = useAuth();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '' });

  useEffect(() => {
    fetch('/api/auth/status')
      .then((response) => response.json())
      .then((data) => setConfigured(Boolean(data.configured)))
      .catch(() => toast.error('Não foi possível verificar a configuração de acesso.'));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(configured ? '/api/auth/login' : '/api/auth/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.statusMessage || 'Não foi possível entrar.');
      await refreshUser();
      toast.success(configured ? 'Login realizado com sucesso.' : 'Administrador criado com sucesso.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao autenticar.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || configured === null) {
    return <div className="flex min-h-screen items-center justify-center bg-orange-50">Carregando...</div>;
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-white p-4">
      <Card className="w-full max-w-md border-orange-200 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600">
            {configured ? <LockKeyhole className="h-7 w-7 text-white" /> : <Store className="h-7 w-7 text-white" />}
          </div>
          <CardTitle className="text-2xl">Empório das Coxinhas</CardTitle>
          <CardDescription>
            {configured ? 'Entre com seu usuário para operar o sistema.' : 'Crie o primeiro administrador do sistema.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            {!configured && (
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Input required minLength={3} autoComplete="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input required minLength={8} type="password" autoComplete={configured ? 'current-password' : 'new-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              {!configured && <p className="text-xs text-gray-500">Use pelo menos 8 caracteres.</p>}
            </div>
            <Button disabled={submitting} className="w-full bg-orange-600 hover:bg-orange-700">
              {submitting ? 'Aguarde...' : configured ? 'Entrar' : 'Criar administrador'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Login;