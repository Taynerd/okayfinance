let dataAtual = new Date();

const lista = document.getElementById("listaEntradas");
const totalEl = document.getElementById("totalEntradas");
const mesLabel = document.getElementById("mesAtual");

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
 * TOAST (LOCAL)
 *********************/
function showToast(message, type = "success", duration = 1500) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.className = `toast active ${type}`;
  toast.innerHTML = `<div class="toast-message">${message}</div>`;

  setTimeout(() => {
    toast.classList.remove("active");
  }, duration);
}

/*********************
 * RENDER
 *********************/
function render() {
  if (!window.appState) return;

  lista.innerHTML = "";
  let total = 0;

  mesLabel.innerText =
    `${nomeMes(dataAtual.getMonth())} ${dataAtual.getFullYear()}`;

  const entradas = window.appState.entradas || [];

  entradas
    .filter(e =>
      e.mes === dataAtual.getMonth() &&
      e.ano === dataAtual.getFullYear()
    )
    .forEach(e => {
      total += e.valor;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${e.descricao}</td>
        <td>R$ ${e.valor.toFixed(2)}</td>
        <td>
          <button class="remover">✕</button>
        </td>
      `;

      tr.querySelector(".remover").onclick = () => removerEntrada(e.id);
      lista.appendChild(tr);
    });

  totalEl.innerText = `R$ ${total.toFixed(2)}`;
}

/*********************
 * REMOVER ENTRADA
 *********************/
function removerEntrada(id) {
  if (!window.appState) return;

  const entradas = window.appState.entradas || [];
  const novas = entradas.filter(e => e.id !== id);

  // 🔥 atualiza estado central + Firebase
  window.appState.setEntradas(novas);

  showToast("Entrada removida ✔");
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
 * REAGIR A ATUALIZAÇÕES GLOBAIS
 *********************/
document.addEventListener("dadosAtualizados", render);
