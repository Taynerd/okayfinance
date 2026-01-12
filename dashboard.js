function calcularDashboard() {
  const entradas = JSON.parse(localStorage.getItem("entradas")) || [];
  const gastosFixos = JSON.parse(localStorage.getItem("gastosFixos")) || [];
  const gastos = JSON.parse(localStorage.getItem("gastos")) || [];

  // total entradas
  const totalEntradas = entradas.reduce((s, e) => s + e.valor, 0);

  // total gastos fixos
  const totalFixos = gastosFixos.reduce((s, g) => s + g.valor, 0);

  // total faturas (mês atual)
  const hoje = new Date();
  const mes = hoje.getMonth();
  const ano = hoje.getFullYear();

  let totalFaturas = 0;

  gastos.forEach(g => {
    for (let i = 0; i < g.parcelas; i++) {
      const d = new Date(g.anoInicio, g.mesInicio + i);
      if (d.getMonth() === mes && d.getFullYear() === ano) {
        totalFaturas += g.valor / g.parcelas;
      }
    }
  });

  const totalGastos = totalFixos + totalFaturas;
  const saldo = totalEntradas - totalGastos;

  // render números
  document.getElementById("totalEntradasDash").innerText =
    `R$ ${totalEntradas.toFixed(2)}`;
  document.getElementById("totalGastosDash").innerText =
    `R$ ${totalGastos.toFixed(2)}`;
  document.getElementById("saldoDash").innerText =
    `R$ ${saldo.toFixed(2)}`;

  // gráfico
  renderGraficoSaldo(totalEntradas, saldo);
}

function renderGraficoSaldo(totalEntradas, saldo) {
  const circle = document.getElementById("graficoSaldo");
  const label = document.getElementById("percentualSaldo");
  const saldoEl = document.getElementById("saldoDash");

  const circ = 2 * Math.PI * 70;

  const totalGastos = totalEntradas - saldo;

  let percentualGasto = 0;

  // 🔑 regra correta para entradas = 0
  if (totalEntradas === 0 && totalGastos > 0) {
    percentualGasto = 1; // 100% (estouro)
  } else if (totalEntradas > 0) {
    percentualGasto = totalGastos / totalEntradas;
  }

  // limite visual (círculo nunca passa de 100%)
  const percentualVisual = Math.min(percentualGasto, 1);
  const offset = circ * (1 - percentualVisual);

  // animação
  circle.style.transition = "stroke-dashoffset 0.8s ease";
  circle.style.strokeDashoffset = offset;

  // texto percentual
  const textoPercentual =
    totalEntradas === 0 && totalGastos > 0
      ? "100%+"
      : `${Math.round(percentualGasto * 100)}%`;

  label.innerText = textoPercentual;

  // 🎨 cores por regra
  let cor = "#22c55e"; // verde

  if (percentualGasto >= 0.9 && percentualGasto <= 1) {
    cor = "#f59e0b"; // laranja (alerta)
  }

  if (percentualGasto > 1 || (totalEntradas === 0 && totalGastos > 0)) {
    cor = "#ef4444"; // vermelho (estouro)
  }

  circle.style.stroke = cor;
  label.style.color = cor;

  // saldo negativo sempre vermelho
  saldoEl.style.color = saldo < 0 ? "#ef4444" : "#22c55e";
}

document.addEventListener("DOMContentLoaded", () => {
  calcularDashboard();
});
