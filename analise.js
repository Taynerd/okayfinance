const params = new URLSearchParams(window.location.search);
const bancoSelecionado = params.get("banco");

let dataAtual = new Date();

const titulo = document.getElementById("tituloBanco");
const mesLabel = document.getElementById("mesAtual");
const lista = document.getElementById("listaGastos");
const totalEl = document.getElementById("totalFatura");

titulo.innerText = `Fatura ${bancoSelecionado}`;

function nomeMes(m) {
  return [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ][m];
}

function render() {
  lista.innerHTML = "";
  let total = 0;

  mesLabel.innerText = `${nomeMes(
    dataAtual.getMonth()
  )} ${dataAtual.getFullYear()}`;

  const gastos = JSON.parse(localStorage.getItem("gastos")) || [];

  gastos
    .filter((g) => g.banco === bancoSelecionado)
    .forEach((g) => {
      for (let i = 0; i < g.parcelas; i++) {
        const mesGasto = new Date(g.anoInicio, g.mesInicio + i);

        if (
          mesGasto.getMonth() === dataAtual.getMonth() &&
          mesGasto.getFullYear() === dataAtual.getFullYear()
        ) {
          const valorParcela = g.valor / g.parcelas;
          total += valorParcela;

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${g.nome}</td>
            <td>${g.categoria}</td>
            <td>${g.parcelas > 1 ? `${i + 1}/${g.parcelas}` : "-"}</td>
            <td>R$ ${valorParcela.toFixed(2)}</td>
            <td>
              <button class="remover" onclick="removerGasto('${
                g.id
              }')">✕</button>
            </td>
          `;
          lista.appendChild(tr);
        }
      }
    });

  totalEl.innerText = `R$ ${total.toFixed(2)}`;
}

function removerGasto(id) {
  const gastos = JSON.parse(localStorage.getItem("gastos")) || [];

  const filtrados = gastos.filter((g) => g.id !== id);

  localStorage.setItem("gastos", JSON.stringify(filtrados));

  render();
  atualizarDashboard();
}

function limparFaturaMes() {
  const gastos = JSON.parse(localStorage.getItem("gastos")) || [];

  const mes = dataAtual.getMonth();
  const ano = dataAtual.getFullYear();

  const filtrados = gastos.filter((g) => {
    // mantém gastos de outros bancos
    if (g.banco !== bancoSelecionado) return true;

    // remove qualquer gasto que tenha parcela neste mês/ano
    for (let i = 0; i < g.parcelas; i++) {
      const d = new Date(g.anoInicio, g.mesInicio + i);
      if (d.getMonth() === mes && d.getFullYear() === ano) {
        return false;
      }
    }
    return true;
  });

  localStorage.setItem("gastos", JSON.stringify(filtrados));

  showToast("Fatura limpa com sucesso ✔");

  render();
  atualizarDashboard();
}

document.getElementById("prevMes").onclick = () => {
  dataAtual.setMonth(dataAtual.getMonth() - 1);
  render();
};

document.getElementById("nextMes").onclick = () => {
  dataAtual.setMonth(dataAtual.getMonth() + 1);
  render();
};

function showToast(message, type = "success", duration = 1800) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.className = `toast active ${type}`;
  toast.innerHTML = `<div class="toast-message">${message}</div>`;

  setTimeout(() => toast.classList.remove("active"), duration);
}

function garantirIds() {
  const gastos = JSON.parse(localStorage.getItem("gastos")) || [];
  let alterado = false;

  gastos.forEach((g) => {
    if (!g.id) {
      g.id = crypto.randomUUID();
      alterado = true;
    }
  });

  if (alterado) {
    localStorage.setItem("gastos", JSON.stringify(gastos));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  garantirIds();
  render();
});

//analise da fatura por categoria
function abrirRelatorio() {
  document.getElementById("relatorioCategoria").classList.add("active");
  renderGraficoCategorias();
}

function fecharRelatorio() {
  document.getElementById("relatorioCategoria").classList.remove("active");
}
function renderGraficoCategorias() {
  const container = document.getElementById("graficoCategorias");
  container.innerHTML = "";

  const gastos = JSON.parse(localStorage.getItem("gastos")) || [];
  const mes = dataAtual.getMonth();
  const ano = dataAtual.getFullYear();

  const porCategoria = {};

  gastos
    .filter((g) => g.banco === bancoSelecionado)
    .forEach((g) => {
      for (let i = 0; i < g.parcelas; i++) {
        const d = new Date(g.anoInicio, g.mesInicio + i);
        if (d.getMonth() === mes && d.getFullYear() === ano) {
          const valor = g.valor / g.parcelas;
          porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + valor;
        }
      }
    });

const total = Object.values(porCategoria).reduce((s, v) => s + v, 0);

const coresCategorias = {
  "Alimentação": "#ef4444",   // vermelho
  "Lazer": "#f59e0b",         // laranja
  "Transporte": "#3b82f6",    // azul
  "Farmácia": "#22c55e",      // verde
  "Imprevisto": "#a855f7",    // roxo
  "mercado": "#14b8a6",       // teal
  "Casa": "#64748b",          // cinza
  "Pessoal 1": "#ec4899",     // rosa
  "Pessoal 2": "#8b5cf6"      // violeta
};

  function corCategoria(nome) {
    return coresCategorias[nome] || "#6366f1"; // fallback padrão
  }

  Object.entries(porCategoria).forEach(([categoria, valor]) => {
    const perc = total > 0 ? (valor / total) * 100 : 0;
    const cor = corCategoria(categoria);

    const div = document.createElement("div");
    div.className = "barra";
    div.innerHTML = `
    <span>${categoria}</span>
    <div class="progresso">
      <div class="fill"></div>
    </div>
    <strong>${perc.toFixed(0)}%</strong>
  `;

    const fill = div.querySelector(".fill");
    fill.style.background = cor;

    container.appendChild(div);

    requestAnimationFrame(() => {
      fill.style.width = `${perc}%`;
    });
  });
}
