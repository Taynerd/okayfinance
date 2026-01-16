/*********************
 * ESTADO LOCAL
 *********************/
let dataAtual = new Date();

/* mantém o HTML como está */
const lista    = document.getElementById("listaEntradas");
const totalEl  = document.getElementById("totalEntradas");
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

  setTimeout(() => toast.classList.remove("active"), duration);
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

  const gastosFixos = window.appState.gastosFixos || [];

  gastosFixos
    .filter(g =>
      g.mes === dataAtual.getMonth() &&
      g.ano === dataAtual.getFullYear()
    )
    .forEach(g => {
      total += g.valor;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${g.descricao}</td>
        <td>R$ ${g.valor.toFixed(2)}</td>
        <td>
          <button class="remover">✕</button>
        </td>
      `;

      tr.querySelector(".remover").onclick = () => removerGFixo(g.id);
      lista.appendChild(tr);
    });

  totalEl.innerText = `R$ ${total.toFixed(2)}`;
}

/*********************
 * REMOVER GASTO FIXO
 *********************/
function removerGFixo(id) {
  if (!window.appState) return;

  const gastosFixos = window.appState.gastosFixos || [];
  const novos = gastosFixos.filter(g => g.id !== id);

  // 🔥 atualiza estado central + Firebase
  window.appState.setGastosFixos(novos);

  render();
  document.dispatchEvent(new Event("dadosAtualizados"));

  showToast("Gasto fixo removido ✔");
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
 * INIT
 *********************/
document.addEventListener("DOMContentLoaded", render);

/*********************
 * REAGIR A ATUALIZAÇÕES GLOBAIS
 *********************/
document.addEventListener("dadosAtualizados", render);
