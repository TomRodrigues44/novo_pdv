import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    const { password } = req.body;

    // Verificar se a venda existe
    const sale = await db.sales.findOne({ where: { id: Number(id) } });
    if (!sale) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    // Verificar se a venda pode ser cancelada
    if (sale.status !== "aberta" && sale.status !== "concluida") {
      return res.status(400).json({ error: "Venda não pode ser cancelada" });
    }

    // Atualizar status da venda
    await db.sales.update({ id: Number(id) }, { status: "cancelada" });

    // Se for venda fiscal, atualizar status fiscal
    if (sale.fiscal_model === "NFe" || sale.fiscal_model === "NFCe") {
      await db.fiscal.update({ id: Number(id) }, { status: "cancelada" });
    }

    return res.status(200).json({ message: "Venda cancelada com sucesso" });
  } catch (error) {
    console.error("Erro ao cancelar venda:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}