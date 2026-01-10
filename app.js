/*********************
 * MENU
 *********************/
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const menuPanel = document.querySelector(".menu-panel");

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
  ano: new Date().getFullYear()
});


  localStorage.setItem("entradas", JSON.stringify(entradas));

  desc.value = "";
  valor.value = "";

  showToast("Entrada adicionada com sucesso ✔");
}

/*********************
 * GASTOS
 *********************/
function adicionarGasto() {
  const nomeEl = document.getElementById("nome");
  const valorEl = document.getElementById("valor");
  const categoriaEl = document.getElementById("categoria");
  const bancoEl = document.getElementById("banco");
  const tipoEl = document.getElementById("tipo");
  const parcelasEl = document.getElementById("parcelas");
  const mesFaturaEl = document.getElementById("mesFatura");

  const nome = nomeEl.value.trim();
  const valor = Number(valorEl.value);
  const parcelas = Number(parcelasEl.value) || 1;

  if (!nome || valor <= 0) {
    showToast("Preencha corretamente o nome e o valor.", "error");
    return;
  }

  if (tipoEl.value === "parcelado" && parcelas < 2) {
    showToast("Parcelamento precisa ter pelo menos 2 parcelas.", "error");
    return;
  }

  const gastos = JSON.parse(localStorage.getItem("gastos")) || [];

  gastos.push({
    id: crypto.randomUUID(), // 🔑 obrigatório
    nome,
    valor,
    categoria: categoriaEl.value,
    banco: bancoEl.value,
    tipo: tipoEl.value,
    parcelas,
    mesInicio: Number(mesFaturaEl.value),
    anoInicio: new Date().getFullYear(),
  });

  localStorage.setItem("gastos", JSON.stringify(gastos));

  nomeEl.value = "";
  valorEl.value = "";
  parcelasEl.value = "";

  showToast("Gasto adicionado com sucesso ✔");

  renderizarCardsFatura();
}

/*********************
 * FATURAS POR CARTÃO
 *********************/
function adicionarGasto() {
  // 🔹 Captura dos elementos
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

  // 🔹 Fonte única da verdade
  const gastos = JSON.parse(localStorage.getItem("gastos")) || [];

  // 🔹 Criação do gasto
  gastos.push({
    id: crypto.randomUUID(), // 🔑 ESSENCIAL
    nome,
    valor,
    categoria: categoriaEl.value,
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
}
//atualiza card da fatura
function renderizarCardsFatura() {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const gastos = JSON.parse(localStorage.getItem("gastos")) || [];

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
 * DIRECIONA PARA A FATURA CERTA
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

function renderizarCardsFatura() {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const gastos = JSON.parse(localStorage.getItem("gastos")) || [];

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

document.addEventListener("DOMContentLoaded", renderizarCardsFatura);

document.querySelector(".ver-ganhos")
  .addEventListener("click", () => {
    window.location.href = "entradas.html";
  });
