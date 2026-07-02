import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-orange-100 p-6 rounded-full inline-block mb-6">
          <Store className="h-16 w-16 text-orange-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
        <p className="text-gray-600 mb-6">Desculpe, não conseguimos encontrar a página que você está procurando.</p>
        <Button
          onClick={() => navigate('/')}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;