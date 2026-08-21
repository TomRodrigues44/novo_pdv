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

const FLAVOR_IMAGES: Record<string, string> = {
  "Coxinha de Frango": "/products/flavor-coxinha.png",
  "Croquete de Queijo/Presunto": "/products/flavor-croquete.png",
  "Bolinha de Pizza": "/products/flavor-bolinha.png",
  "Travesseiriinho de Carne": "/products/flavor-travesseirinho.png",
  "Churros": "/products/flavor-churros.png",
};

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
      <DialogContent className="max-w-[620px] p-6 sm:rounded-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Escolha os Sabores
          </DialogTitle>
          <p className="text-sm text-gray-500">
            {productName} • Máximo {MAX_FLAVORS} sabores
          </p>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {FLAVORS.map((flavor) => {
            const count = getFlavorCount(flavor);
            const selected = count > 0;

            return (
              <Card
                key={flavor}
                className={`overflow-hidden transition-all duration-200 ${
                  selected
                    ? "border-orange-400 bg-orange-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-orange-200"
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex min-h-[72px] items-center justify-between gap-4 px-5 py-3">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                        <img
                          src={FLAVOR_IMAGES[flavor]}
                          alt={flavor}
                          className="h-12 w-12 object-contain"
                        />
                      </div>

                      <div className="min-w-0">
                        <span
                          className={`font-semibold ${
                            selected ? "text-orange-800" : "text-gray-900"
                          }`}
                        >
                          {flavor}
                        </span>

                        {selected && (
                          <p className="mt-1 text-xs font-semibold text-orange-600">
                            {count}x selecionado{count > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg border-gray-200 bg-white"
                        onClick={() => removeFlavor(flavor)}
                        disabled={count === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <div
                        className={`flex h-9 min-w-10 items-center justify-center rounded-lg border px-2 text-base font-bold ${
                          selected
                            ? "border-orange-300 bg-white text-orange-700"
                            : "border-gray-200 bg-white text-gray-900"
                        }`}
                      >
                        {count}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg border-orange-500 bg-orange-500 text-white shadow-sm hover:border-orange-700 hover:bg-orange-700 hover:text-white hover:shadow-md disabled:border-orange-200 disabled:bg-orange-200 disabled:text-white"
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

          <div className="pt-3">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Opções rápidas
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {SPECIAL_OPTIONS.map((option) => {
                const selected =
                  selectedFlavors.length === 1 &&
                  selectedFlavors[0] === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectSpecialOption(option)}
                    className={`flex min-h-[64px] items-center justify-center gap-2 rounded-xl border-2 px-4 font-semibold transition-all ${
                      selected
                        ? "border-orange-400 bg-orange-50 text-orange-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-900 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    <span>{option}</span>
                    {selected && <Check className="h-5 w-5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
          <span className="text-gray-600">Sabores selecionados:</span>
          <span
            className={`text-lg font-bold ${
              selectedFlavors.length === MAX_FLAVORS
                ? "text-orange-600"
                : "text-gray-700"
            }`}
          >
            {selectedFlavors.length}/{MAX_FLAVORS}
          </span>
        </div>

        <DialogFooter className="mt-2 gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="min-w-[110px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="min-w-[190px] bg-orange-500 text-white hover:bg-orange-600"
            disabled={selectedFlavors.length === 0}
          >
            Confirmar ({selectedFlavors.length} sabor{selectedFlavors.length !== 1 ? "es" : ""})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
