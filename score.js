/*********************
 * DATA ATUAL
 *********************/
function getMesAnoAtual() {
  const hoje = new Date();
  return {
    mes: hoje.getMonth(),
    ano: hoje.getFullYear(),
  };
}

/*********************
 * HELPERS DE ESTADO (SEGUROS)
 *********************/
function getEntradas() {
  return window.appState?.entradas || [];
}

function getGastos() {
  return window.appState?.gastos || [];
}

function getLimites() {
  return window.appState?.limites || [];
}

/*********************
 * TOTAIS
 *********************/
function totalEntradasMes() {
  const { mes, ano } = getMesAnoAtual();
  const entradas = getEntradas();

  return entradas
    .filter(e => e.mes === mes && e.ano === ano)
    .reduce((s, e) => s + e.valor, 0);
}

function totalGastosMes() {
  const { mes, ano } = getMesAnoAtual();
  const gastos = getGastos();

  return gastos.reduce((total, g) => {
    for (let i = 0; i < g.parcelas; i++) {
      const data = new Date(g.anoInicio, g.mesInicio + i);
      if (data.getMonth() === mes && data.getFullYear() === ano) {
        total += g.valor / g.parcelas;
      }
    }
    return total;
  }, 0);
}

/*********************
 * MÉTRICAS
 *********************/
function categoriasComLimiteEstourado() {
  const limites = getLimites();
  if (!limites.length || typeof totalPorCategoria !== "function") return 0;

  return limites.filter(l => {
    const gasto = totalPorCategoria(l.categoria);
    return gasto > l.limite;
  }).length;
}

function percentualRendaComprometida() {
  const entradasMes = totalEntradasMes();
  const gastosMes = totalGastosMes();

  if (entradasMes === 0 && gastosMes === 0) return null;
  if (entradasMes === 0 && gastosMes > 0) return 100;

  return (gastosMes / entradasMes) * 100;
}

function percentualParcelamentos() {
  const gastos = getGastos();
  const total = totalGastosMes();
  if (total === 0) return 0;

  const parcelado = gastos
    .filter(g => g.parcelas > 1)
    .reduce((s, g) => s + g.valor / g.parcelas, 0);

  return (parcelado / total) * 100;
}

/*********************
 * SCORE FINANCEIRO
 *********************/
function calcularScoreFinanceiro() {
  let score = 100;
  const insights = [];

  const rendaComprometida = percentualRendaComprometida();
  const limitesEstourados = categoriasComLimiteEstourado();
  const percParcelado = percentualParcelamentos();

  // 🟡 ESTADO INICIAL
  if (rendaComprometida === null) {
    return {
      score: 100,
      estado: "inicial",
      insights: ["Adicione suas entradas e gastos para iniciar a análise."]
    };
  }

  // 🔴 RENDA COMPROMETIDA
  if (rendaComprometida > 100) {
    score -= 30;
    insights.push("Seus gastos ultrapassam sua renda este mês.");
  } else if (rendaComprometida > 80) {
    score -= 20;
    insights.push("Mais de 80% da sua renda está comprometida.");
  } else if (rendaComprometida > 60) {
    score -= 10;
    insights.push("Atenção: gastos acima de 60% da renda.");
  }

  // 🔴 LIMITES
  if (limitesEstourados > 0) {
    score -= limitesEstourados * 10;
    insights.push(`${limitesEstourados} categoria(s) ultrapassaram o limite.`);
  }

  // 🔴 PARCELAMENTOS
  if (percParcelado > 50) {
    score -= 20;
    insights.push("Mais de 50% dos gastos são parcelados.");
  } else if (percParcelado > 30) {
    score -= 10;
    insights.push("Parcelamentos representam parcela relevante dos gastos.");
  }

  score = Math.max(score, 0);

  return {
    score,
    estado: "normal",
    insights
  };
}

/*********************
 * RENDER SCORE (UI)
 *********************/
function renderizarScore() {
  const card = document.querySelector(".score-card");
  if (!card) return;

  const valorEl = document.getElementById("scoreValor");
  const statusEl = document.getElementById("scoreStatus");
  const insightsEl = document.getElementById("scoreInsights");
  const gauge = document.getElementById("gaugeProgress");

  const { score, estado, insights } = calcularScoreFinanceiro();

  valorEl.innerText = score;
  card.classList.remove("good", "medium", "bad");

  const totalArco = 283;

  if (estado === "inicial") {
    gauge.style.strokeDashoffset = totalArco;
    card.classList.add("medium");
    statusEl.innerText = "Complete seus dados financeiros";
  } else {
    const progresso = totalArco - (score / 100) * totalArco;
    gauge.style.strokeDashoffset = progresso;

    if (score >= 80) {
      card.classList.add("good");
      statusEl.innerText = "Situação financeira saudável";
    } else if (score >= 50) {
      card.classList.add("medium");
      statusEl.innerText = "Atenção aos gastos";
    } else {
      card.classList.add("bad");
      statusEl.innerText = "Risco financeiro este mês";
    }
  }

  insightsEl.innerHTML = "";
  insights.forEach(texto => {
    const li = document.createElement("li");
    li.innerText = texto;
    insightsEl.appendChild(li);
  });
}

/*********************
 * EVENTOS GLOBAIS
 *********************/
document.addEventListener("dadosAtualizados", renderizarScore);
document.addEventListener("DOMContentLoaded", renderizarScore);
