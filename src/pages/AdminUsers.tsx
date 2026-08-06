import { useEffect, useState, type FormEvent } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'manager' | 'cashier';
  roleLabel: string;
  active: boolean;
}

const roles = [
  { value: 'admin', label: 'Administrador' },
  { value: 'manager', label: 'Gerente' },
  { value: 'cashier', label: 'Caixa' },
];

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'cashier' });
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const response = await fetch('/api/auth/users');
    if (!response.ok) throw new Error('Não foi possível carregar os usuários.');
    setUsers(await response.json());
    setLoading(false);
  };

  useEffect(() => {
    loadUsers().catch((error) => toast.error(error.message));
  }, []);

  const createUser = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/auth/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.statusMessage || 'Erro ao criar usuário.');
      return;
    }
    toast.success('Usuário criado com sucesso.');
    setForm({ name: '', username: '', password: '', role: 'cashier' });
    await loadUsers();
  };

  const toggleUser = async (user: User) => {
    const response = await fetch('/api/auth/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, active: !user.active }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.statusMessage || 'Erro ao atualizar usuário.');
      return;
    }
    await loadUsers();
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-64 min-h-screen flex-1 bg-gray-50 p-8">
        <div className="mb-8 flex items-center gap-3">
          <Users className="h-8 w-8 text-orange-600" />
          <div><h1 className="text-3xl font-bold">Usuários e Perfis</h1><p className="text-gray-600">Controle quem pode acessar cada área do sistema.</p></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Novo usuário</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={createUser} className="space-y-4">
                <div className="space-y-2"><Label>Nome</Label><Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
                <div className="space-y-2"><Label>Usuário</Label><Input required minLength={3} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></div>
                <div className="space-y-2"><Label>Senha</Label><Input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></div>
                <div className="space-y-2"><Label>Perfil</Label><Select value={form.role} onValueChange={(role) => setForm({ ...form, role })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roles.map((role) => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}</SelectContent></Select></div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">Criar usuário</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Operadores cadastrados</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {loading ? <p className="text-gray-500">Carregando...</p> : users.map((user) => (
                <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                  <div><p className="font-semibold">{user.name}</p><p className="text-sm text-gray-500">@{user.username}</p></div>
                  <div className="flex items-center gap-3"><Badge>{user.roleLabel}</Badge><Button variant="outline" size="sm" onClick={() => toggleUser(user)}>{user.active ? 'Desativar' : 'Ativar'}</Button></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;