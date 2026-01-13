/*********************
 * MENU
 *********************/
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const menuPanel = document.querySelector(".menu-panel");

let limites = JSON.parse(localStorage.getItem("limites")) || [];
let gastos = JSON.parse(localStorage.getItem("gastos")) || [];

menuBtn.addEventListener("click", () => {
  const aberto = menu.classList.toggle("active");
  menuBtn.classList.toggle("active", aberto);
});

// clique fora fecha
menu.addEventListener("click", (e) => {
  if (!menuPanel.contains(e.target)) {
    fecharMenu();
  }
});

function fecharMenu() {
  menu.classList.remove("active");
  menuBtn.classList.remove("active");
}

/*********************
 * ENTRADAS
 *********************/
let entradas = JSON.parse(localStorage.getItem("entradas")) || [];

function adicionarEntrada() {
  const desc = document.getElementById("entradaDescricao");
  const valor = document.getElementById("entradaValor");

  if (!desc.value || !valor.value || Number(valor.value) <= 0) {
    showToast("Preencha descrição e valor válido.", "error");
    return;
  }

  entradas.push({
    id: crypto.randomUUID(), // 🔑 ESSENCIAL
    descricao: desc.value,
    valor: Number(valor.value),
    mes: new Date().getMonth(),
    ano: new Date().getFullYear(),
  });

  localStorage.setItem("entradas", JSON.stringify(entradas));

  desc.value = "";
  valor.value = "";

  showToast("Entrada adicionada com sucesso ✔");
  atualizarDashboard();
  document.dispatchEvent(new Event("dadosAtualizados"));
}

/*********************
 * gastos fixos
 *********************/
let gastosFixos = JSON.parse(localStorage.getItem("gastosFixos")) || [];

function adicionarGFixo() {
  const desc = document.getElementById("fixoDescricao");
  const valor = document.getElementById("fixoValor");

  if (!desc.value || !valor.value || Number(valor.value) <= 0) {
    showToast("Preencha descrição e valor válido.", "error");
    return;
  }

  gastosFixos.push({
    id: crypto.randomUUID(), // 🔑 essencial
    descricao: desc.value,
    valor: Number(valor.value),
    mes: new Date().getMonth(),
    ano: new Date().getFullYear(),
  });

  localStorage.setItem("gastosFixos", JSON.stringify(gastosFixos));

  desc.value = "";
  valor.value = "";

  showToast("Gasto fixo adicionado com sucesso ✔");
  atualizarDashboard();
  document.dispatchEvent(new Event("dadosAtualizados"));
}
function irParaGastosFixos() {
  window.location.href = "fixos.html";
}

/*********************
 * gastos
 *********************/
function adicionarGasto() {
  // 🔹 Criação do gasto

  const nomeEl = document.getElementById("nome");
  const valorEl = document.getElementById("valor");
  const categoriaEl = document.getElementById("categoria");
  const bancoEl = document.getElementById("banco");
  const tipoEl = document.getElementById("tipo");
  const parcelasEl = document.getElementById("parcelas");
  const mesFaturaEl = document.getElementById("mesFatura");

  // 🔹 Normalização
  const nome = nomeEl.value.trim();
  const valor = Number(valorEl.value);
  const parcelas = Number(parcelasEl.value) || 1;

  // 🔹 Validações
  if (!nome || valor <= 0) {
    showToast("Preencha corretamente o nome e o valor.", "error");
    return;
  }

  if (tipoEl.value === "parcelado" && parcelas < 2) {
    showToast("Parcelamento precisa ter pelo menos 2 parcelas.", "error");
    return;
  }

  gastos.push({
    id: crypto.randomUUID(), // 🔑 ESSENCIAL
    nome,
    valor,
    categoria: categoriaEl.value.trim().toLowerCase(),
    banco: bancoEl.value,
    tipo: tipoEl.value,
    parcelas,
    mesInicio: Number(mesFaturaEl.value),
    anoInicio: new Date().getFullYear(),
  });
  // 🔹 Persistência
  localStorage.setItem("gastos", JSON.stringify(gastos));

  // 🔹 Limpeza dos inputs
  nomeEl.value = "";
  valorEl.value = "";
  parcelasEl.value = "";

  // 🔹 Feedback ao usuário
  showToast("Gasto adicionado com sucesso ✔");
  renderizarCardsFatura();
  atualizarLimites();
  atualizarDashboard();
  document.dispatchEvent(new Event("dadosAtualizados"));

}
//atualiza card da fatura
function renderizarCardsFatura() {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  document.querySelectorAll(".fatura").forEach((el) => {
    const bancoCard = el.dataset.banco;
    let total = 0;

    gastos.forEach((g) => {
      if (g.banco !== bancoCard) return;

      for (let i = 0; i < g.parcelas; i++) {
        const dataParcela = new Date(g.anoInicio, g.mesInicio + i);

        if (
          dataParcela.getMonth() === mesAtual &&
          dataParcela.getFullYear() === anoAtual
        ) {
          total += g.valor / g.parcelas;
        }
      }
    });

    el.innerText = total.toFixed(2);
  });
}

/*********************
 * DirECIONA PARA A FATURA CERTA
 *********************/
document.querySelectorAll(".analise-fat").forEach((btn) => {
  btn.addEventListener("click", () => {
    const banco = btn.dataset.banco;
    window.location.href = `analise.html?banco=${encodeURIComponent(banco)}`;
  });
});

/*********************
 * validação de entrada
 *********************/
function showToast(message, type = "success", duration = 1000) {
  const toast = document.getElementById("toast");

  toast.className = `toast active ${type}`;
  toast.innerHTML = `<div class="toast-message">${message}</div>`;

  setTimeout(() => {
    toast.classList.remove("active");
  }, duration);
}

document.querySelector(".ver-ganhos").addEventListener("click", () => {
  window.location.href = "entradas.html";
});

function atualizarDashboard() {
  if (typeof calcularDashboard === "function") {
    calcularDashboard();
  }
  
}
function criarLimite() {
  const categoria = document
    .getElementById("categoriaLimite")
    .value.trim()
    .toLowerCase();

  const limite = Number(document.getElementById("limite").value);
  if (!limite || limite <= 0) return;

  const existente = limites.find((l) => l.categoria === categoria);

  if (existente) {
    existente.limite = limite;
  } else {
    limites.push({ categoria, limite });
  }

  salvarLimites();
  atualizarLimites();
  document.dispatchEvent(new Event("dadosAtualizados"));
}

function totalPorCategoria(categoria) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  return gastos.reduce((total, g) => {
    if (g.categoria !== categoria) return total;

    for (let i = 0; i < g.parcelas; i++) {
      const dataParcela = new Date(g.anoInicio, g.mesInicio + i);

      if (
        dataParcela.getMonth() === mesAtual &&
        dataParcela.getFullYear() === anoAtual
      ) {
        total += g.valor / g.parcelas;
      }
    }

    return total;
  }, 0);
}

function atualizarLimites() {
  const container = document.getElementById("listaLimites");
  container.innerHTML = "";

  limites.forEach((l) => {
    const gastoAtual = totalPorCategoria(l.categoria);
    const percentual = Math.min((gastoAtual / l.limite) * 100, 100);

    const div = document.createElement("div");
    div.className = "limite-card" + (gastoAtual >= l.limite ? " alerta" : "");

   div.innerHTML = `
  <div class="limite-header">
    <span>${l.categoria}</span>

    <div>
      <span>R$ ${gastoAtual.toFixed(2)} / ${l.limite.toFixed(2)}</span>
      <button 
        class="remover-limite"
        onclick="removerLimite('${l.categoria}')"
        aria-label="Remover alerta"
      >
        ✕
      </button>
    </div>
  </div>

  <div class="barra">
    <div class="progresso" style="width:${percentual}%"></div>
  </div>

  <small>${percentual.toFixed(0)}% do limite</small>
`;


    container.appendChild(div);
  });
}
function salvarLimites() {
  localStorage.setItem("limites", JSON.stringify(limites));
}

//remover alerta de limite
function removerLimite(categoria) {
  limites = limites.filter(l => l.categoria !== categoria);

  salvarLimites();
  atualizarLimites();

  // avisa score / outras análises
  document.dispatchEvent(new Event("dadosAtualizados"));
}
document.addEventListener("DOMContentLoaded", () => {
  atualizarLimites();
  renderizarCardsFatura();
  document.dispatchEvent(new Event("dadosAtualizados"));
});