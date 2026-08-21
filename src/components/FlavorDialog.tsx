import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Check } from "lucide-react";

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

const SPECIAL_OPTIONS = [
  "Todos",
  "Só Salgados",
];

const MAX_FLAVORS = 5;

export const FlavorDialog = ({ open, onClose, onConfirm, productName }: FlavorDialogProps) => {
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  const getFlavorCount = (flavor: string) =>
    selectedFlavors.filter((f) => f === flavor).length;

  const addFlavor = (flavor: string) => {
    setSelectedFlavors((prev) => {
      if (prev.length >= MAX_FLAVORS) return prev;
      return [...prev, flavor];
    });
  };

  const removeFlavor = (flavor: string) => {
    setSelectedFlavors((prev) => {
      const index = prev.lastIndexOf(flavor);
      if (index === -1) return prev;

      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const selectSpecialOption = (option: string) => {
    setSelectedFlavors((prev) => {
      if (prev.length === 1 && prev[0] === option) {
        return [];
      }
      return [option];
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

  const hasSpecialOption = SPECIAL_OPTIONS.some((option) =>
    selectedFlavors.includes(option)
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Escolha os Sabores</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            {productName} • Máximo {MAX_FLAVORS} sabores
          </p>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {FLAVORS.map((flavor) => {
            const count = getFlavorCount(flavor);

            return (
              <Card
                key={flavor}
                className={`transition-all ${
                  count > 0
                    ? "border-orange-500 bg-orange-50"
                    : "hover:border-orange-300"
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{flavor}</span>
                      {count > 0 && (
                        <div className="text-xs text-orange-600 font-semibold mt-1">
                          {count}x selecionado{count > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFlavor(flavor)}
                        disabled={count === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="w-6 text-center font-bold text-lg">
                        {count}
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-orange-300 text-orange-600 hover:bg-orange-50"
                        onClick={() => addFlavor(flavor)}
                        disabled={
                          selectedFlavors.length >= MAX_FLAVORS ||
                          hasSpecialOption
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-2">Opções rápidas</p>

            <div className="space-y-3">
              {SPECIAL_OPTIONS.map((option) => {
                const selected =
                  selectedFlavors.length === 1 &&
                  selectedFlavors[0] === option;

                return (
                  <Card
                    key={option}
                    className={`cursor-pointer transition-all ${
                      selected
                        ? "border-orange-500 bg-orange-50"
                        : "hover:border-orange-300"
                    }`}
                    onClick={() => selectSpecialOption(option)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {selected && (
                          <div className="bg-orange-500 text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Sabores selecionados:</span>
          <span className="font-semibold">
            {selectedFlavors.length}/{MAX_FLAVORS}
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
