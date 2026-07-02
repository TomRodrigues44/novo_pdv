import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface FlavorDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (flavors: string[]) => void;
  productName: string;
}

const FLAVORS = [
  "Coxinha de Frango",
  "Croquete de Queijo/Presunto",
  "Bolinha de Pizza",
  "Travesseiriinho de Carne",
  "Churros",
];

export const FlavorDialog = ({ open, onClose, onConfirm, productName }: FlavorDialogProps) => {
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  const toggleFlavor = (flavor: string) => {
    setSelectedFlavors((prev) => {
      if (prev.includes(flavor)) {
        return prev.filter((f) => f !== flavor);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, flavor];
    });
  };

  const handleConfirm = () => {
    if (selectedFlavors.length === 0) {
      alert("Selecione pelo menos um sabor!");
      return;
    }
    onConfirm(selectedFlavors);
    setSelectedFlavors([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedFlavors([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Escolha os Sabores</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            {productName} • Máximo 5 sabores
          </p>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {FLAVORS.map((flavor) => (
            <Card
              key={flavor}
              className={`cursor-pointer transition-all ${
                selectedFlavors.includes(flavor)
                  ? "border-orange-500 bg-orange-50"
                  : "hover:border-orange-300"
              }`}
              onClick={() => toggleFlavor(flavor)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{flavor}</span>
                  {selectedFlavors.includes(flavor) && (
                    <div className="bg-orange-500 text-white rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Sabores selecionados:</span>
          <span className="font-semibold">
            {selectedFlavors.length}/5
          </span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-orange-600 hover:bg-orange-700"
            disabled={selectedFlavors.length === 0}
          >
            Confirmar ({selectedFlavors.length} sabor{selectedFlavors.length !== 1 ? "es" : ""})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};