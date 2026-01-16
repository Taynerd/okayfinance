const params = new URLSearchParams(window.location.search);
const bancoSelecionado = params.get("banco");

let dataAtual = new Date();

const titulo = document.getElementById("tituloBanco");
const mesLabel = document.getElementById("mesAtual");
const lista = document.getElementById("listaGastos");
const totalEl = document.getElementById("totalFatura");

titulo.innerText = `Fatura ${bancoSelecionado}`;

/*********************
 * UTIL
 *********************/
function nomeMes(m) {
  return [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ][m];
}

/*********************
 * RENDER PRINCIPAL
 *********************/
function render() {
  lista.innerHTML = "";
  let total = 0;

  mesLabel.innerText =
    `${nomeMes(dataAtual.getMonth())} ${dataAtual.getFullYear()}`;

  const gastos = window.appState?.gastos || [];

  gastos
    .filter(g => g.banco === bancoSelecionado)
    .forEach(g => {
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
            <td class="col-remover">
              <button class="remover" data-id="${g.id}">✕</button>
            </td>
            <td class="col-nome">${g.nome}</td>
            <td class="col-valor">R$ ${valorParcela.toFixed(2)}</td>
            <td class="col-parcela">
              ${g.parcelas > 1 ? `${i + 1}/${g.parcelas}` : "-"}
            </td>
            <td class="col-categoria">${g.categoria}</td>
          `;

          tr.querySelector(".remover").onclick = () => removerGasto(g.id);
          lista.appendChild(tr);
        }
      }
    });

  totalEl.innerText = `R$ ${total.toFixed(2)}`;
}

/*********************
 * REMOVER GASTO
 *********************/
function removerGasto(id) {
  const novos = window.appState.gastos.filter(g => g.id !== id);
  window.appState.setGastos(novos);

  render();
}

/*********************
 * LIMPAR FATURA DO MÊS
 *********************/
function limparFaturaMes() {
  const mes = dataAtual.getMonth();
  const ano = dataAtual.getFullYear();

  const filtrados = window.appState.gastos.filter(g => {
    if (g.banco !== bancoSelecionado) return true;

    for (let i = 0; i < g.parcelas; i++) {
      const d = new Date(g.anoInicio, g.mesInicio + i);
      if (d.getMonth() === mes && d.getFullYear() === ano) {
        return false;
      }
    }
    return true;
  });

  window.appState.setGastos(filtrados);

  showToast("Fatura limpa com sucesso ✔");
  render();
}

/*********************
 * CONTROLE DE MÊS
 *********************/
document.getElementById("prevMes").onclick = () => {
  dataAtual.setMonth(dataAtual.getMonth() - 1);
  render();
};

document.getElementById("nextMes").onclick = () => {
  dataAtual.setMonth(dataAtual.getMonth() + 1);
  render();
};

/*********************
 * TOAST
 *********************/
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

/*********************
 * RELATÓRIO POR CATEGORIA
 *********************/
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

  const gastos = window.appState.gastos;
  const mes = dataAtual.getMonth();
  const ano = dataAtual.getFullYear();

  const porCategoria = {};

  gastos
    .filter(g => g.banco === bancoSelecionado)
    .forEach(g => {
      for (let i = 0; i < g.parcelas; i++) {
        const d = new Date(g.anoInicio, g.mesInicio + i);
        if (d.getMonth() === mes && d.getFullYear() === ano) {
          const valor = g.valor / g.parcelas;
          porCategoria[g.categoria] =
            (porCategoria[g.categoria] || 0) + valor;
        }
      }
    });

  const total = Object.values(porCategoria).reduce((s, v) => s + v, 0);

  Object.entries(porCategoria).forEach(([categoria, valor]) => {
    const perc = total > 0 ? (valor / total) * 100 : 0;

    const div = document.createElement("div");
    div.className = "barra";
    div.innerHTML = `
      <span>${categoria}</span>
      <div class="progresso">
        <div class="fill" style="width:${perc}%"></div>
      </div>
      <strong>${perc.toFixed(0)}%</strong>
    `;

    container.appendChild(div);
  });
}

/*********************
 * EVENTOS GLOBAIS
 *********************/
document.addEventListener("dadosAtualizados", () => {
  render();
});

/*********************
 * INIT
 *********************/
document.addEventListener("DOMContentLoaded", render);
