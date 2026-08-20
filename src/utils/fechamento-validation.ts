// Validação dos cálculos do fechamento de caixa
// Baseado na definição fornecida pelo usuário

interface FechamentoValidation {
  abertura: number;
  totalVendas: number;
  totalSangrias: number;
  totalVales: number;
  totalAdicoes: number;
  valorInformado: number;
}

export function validarCalculoFechamento(dados: FechamentoValidation): {
  fechamentoCaixa: number;
  valorEsperado: number;
  diferenca: number;
  resultado: string;
} {
  const {
    abertura,
    totalVendas,
    totalSangrias,
    totalVales,
    totalAdicoes,
    valorInformado,
  } = dados;

  // Fechamento Caixa = Total Vendas - Total Sangrias
  const fechamentoCaixa = totalVendas - totalSangrias;

  // Valor Esperado = (Abertura + Total Vendas + Total Adições) - (Total Sangrias + Total Vales)
  const valorEsperado = abertura + totalVendas + totalAdicoes - totalSangrias - totalVales;

  // Diferença = Valor Informado - Valor Esperado
  const diferenca = valorInformado - valorEsperado;

  // Resultado
  let resultado: string;
  if (diferenca > 0) {
    resultado = `Sobrou dinheiro: R$ ${diferenca.toFixed(2)}`;
  } else if (diferenca < 0) {
    resultado = `Faltou dinheiro: R$ ${Math.abs(diferenca).toFixed(2)}`;
  } else {
    resultado = "Caixa fechou exato";
  }

  return {
    fechamentoCaixa,
    valorEsperado,
    diferenca,
    resultado,
  };
}

// Teste com os valores fornecidos pelo usuário
export function testarCalculoFornecido() {
  const dados = {
    abertura: 100,
    totalVendas: 592,
    totalSangrias: 191,
    totalVales: 90,
    totalAdicoes: 10,
    valorInformado: 400,
  };

  const resultado = validarCalculoFechamento(dados);

  console.log("=== VALIDAÇÃO DO FECHAMENTO ===");
  console.log(`Abertura: R$ ${dados.abertura.toFixed(2)}`);
  console.log(`Total Vendas: R$ ${dados.totalVendas.toFixed(2)}`);
  console.log(`Total Sangrias: R$ ${dados.totalSangrias.toFixed(2)}`);
  console.log(`Total Vales: R$ ${dados.totalVales.toFixed(2)}`);
  console.log(`Total Adições: R$ ${dados.totalAdicoes.toFixed(2)}`);
  console.log(`Valor Informado: R$ ${dados.valorInformado.toFixed(2)}`);
  console.log("---");
  console.log(`Fechamento Caixa (calc): R$ ${resultado.fechamentoCaixa.toFixed(2)}`);
  console.log(`Valor Esperado: R$ ${resultado.valorEsperado.toFixed(2)}`);
  console.log(`Diferença: R$ ${resultado.diferenca.toFixed(2)}`);
  console.log(`Resultado: ${resultado.resultado}`);
  console.log("==============================");

  return resultado;
}