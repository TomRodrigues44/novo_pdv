import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAdmin } from "@/hooks/use-admin";
import { CartItemComponent } from "./CartItem";
import { PaymentDialog } from "./PaymentDialog";
import { DocumentDialog, ReceiptDialog } from "./DocumentDialog";
import { CustomerSelector } from "./CustomerSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Trash2,
  Receipt,
  Truck,
  Plus,
  X,
  User,
  Lock,
  Bike,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger, // ✅ IMPORTANTE AGORA
} from "@/components/ui/select";
import { toast } from "sonner";