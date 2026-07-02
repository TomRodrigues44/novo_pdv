export interface FiscalInfo {
  ncm: string; // Nomenclatura Comum do Mercosul
  cfop: string; // Código Fiscal de Operações e Prestações
  cest: string; // Código Especificador da Substituição Tributária
  unidade: string; // Unidade de medida (UN, KG, LT, etc)
  icms: number; // Alíquota ICMS (%)
  ipi: number; // Alíquota IPI (%)
  pis: number; // Alíquota PIS (%)
  cofins: number; // Alíquota COFINS (%)
  cnpjProdutor?: string; // CNPJ do produtor (se aplicável)
  codigoBarras?: string; // EAN/Barcode
  origem: number; // Origem da mercadoria (0-Nacional, 1-Importada, etc)
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  stock?: number;
  fiscal?: FiscalInfo;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  active?: boolean;
}