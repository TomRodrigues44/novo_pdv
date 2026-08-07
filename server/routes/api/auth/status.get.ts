import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar se o usuário está autenticado (exemplo básico)
    const isAuthenticated = req.cookies?.authToken || false;

    if (isAuthenticated) {
      return res.status(200).json({ status: "autenticado", user: { id: 1, name: "Admin" } });
    }

    return res.status(401).json({ status: "não autenticado" });
  } catch (error) {
    console.error("Erro ao verificar status de autenticação:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}