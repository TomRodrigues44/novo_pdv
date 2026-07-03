import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, Plus, Phone, Star } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  points: number;
  total_spent: number;
}

interface CustomerSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCustomer: (customer: Customer | null) => void;
  onAddNewCustomer?: () => void;
}

export const CustomerSelector = ({ 
  open, 
  onOpenChange, 
  onSelectCustomer,
  onAddNewCustomer 
}: CustomerSelectorProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    onOpenChange(false);
    setSearchTerm("");
  };

  const handleClearSelection = () => {
    onSelectCustomer(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Selecionar Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          {onAddNewCustomer && (
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onAddNewCustomer();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Carregando clientes...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">Nenhum cliente encontrado</p>
              {searchTerm && (
                <p className="text-sm mt-2">Tente buscar com outro termo</p>
              )}
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <Card
                key={customer.id}
                className="cursor-pointer hover:border-orange-400 hover:shadow-md transition-all"
                onClick={() => handleSelectCustomer(customer)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <p className="font-semibold text-lg">{customer.name}</p>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end text-yellow-600">
                        <Star className="h-4 w-4" />
                        <span className="font-bold">{customer.points || 0}</span>
                      </div>
                      <p className="text-xs text-gray-500">pontos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleClearSelection}
          >
            Continuar sem cliente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};