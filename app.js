import { observarLogin, logout } from "./auth.js";
import { carregarDados, salvarDados } from "./db.js";

/********************************
 * ESTADO CENTRAL
 ********************************/
let usuarioAtual = null;

let gastos = [];
let gastosFixos = [];
let entradas = [];
let cartoes = [];
let limites = [];

/********************************
 * LOGIN + BOOTSTRAP
 ********************************/
observarLogin(async (user) => {
  if (!user) return;

  usuarioAtual = user;

  const dados = await carregarDados(user.uid);

  gastos = dados.gastos || [];
  gastosFixos = dados.gastosFixos || [];
  entradas = dados.entradas || [];
  limites = dados.limites || [];

  cartoes = dados.cartoes?.length
    ? dados.cartoes
    : [{
        id: "dp",
        nome: "Dinheiro / Pix",
        slug: "dp",
        cor: "#4CAF50",
      }];

  criarAppState();

  // 🔥 AQUI ESTÁ O PULO DO GATO
  document.dispatchEvent(new Event("dadosAtualizados"));
  dispararAtualizacao();
  sincronizarCardsComEstado();
});
  


/********************************
 * APP STATE GLOBAL (ÚNICO)
 ********************************/
function criarAppState() {
  window.appState = {
    /* ======================
     * GETTERS (leitura)
     * ====================== */
    get gastos() {
      return gastos;
    },

    get gastosFixos() {
      return gastosFixos;
    },

    get entradas() {
      return entradas;
    },

    get cartoes() {
      return cartoes;
    },

    get limites() {
      return limites;
    },

    /* ======================
     * SETTERS (imutáveis)
     * ====================== */
    setGastos(novos) {
      gastos = novos;
      persistirEstado();
      dispararAtualizacao();
    },

    setGastosFixos(novos) {
      gastosFixos = novos;
      persistirEstado();
      dispararAtualizacao();
    },

    setEntradas(novas) {
      entradas = novas;
      persistirEstado();
      dispararAtualizacao();
    },

    setCartoes(novos) {
      cartoes = novos;
      persistirEstado();
      dispararAtualizacao();
    },

    setLimites(novos) {
      limites = novos;
      persistirEstado();
      dispararAtualizacao();
    },
  };
}

/********************************
 * FIRESTORE
 ********************************/
async function persistirEstado() {
  if (!usuarioAtual) return;

  await salvarDados(usuarioAtual.uid, {
    gastos,
    gastosFixos,
    entradas,
    cartoes,
    limites,
  });
}

/********************************
 * EVENTO GLOBAL
 ********************************/
function dispararAtualizacao() {
  document.dispatchEvent(new Event("dadosAtualizados"));
}

/********************************
 * ENTRADAS (GANHOS)
 ********************************/
async function adicionarEntrada() {
  if (!window.appState) return;

  const desc = document.getElementById("entradaDescricao");
  const valor = document.getElementById("entradaValor");

  if (!desc || !valor || !desc.value || Number(valor.value) <= 0) {
    showToast("Preencha descrição e valor válido.", "error");
    return;
  }

  const novaEntrada = {
    id: crypto.randomUUID(),
    descricao: desc.value,
    valor: Number(valor.value),
    mes: new Date().getMonth(),
    ano: new Date().getFullYear(),
  };

  window.appState.setEntradas([...window.appState.entradas, novaEntrada]);

  desc.value = "";
  valor.value = "";

  showToast("Entrada adicionada com sucesso ✔");
}

/********************************
 * MENU
 ********************************/
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const menuPanel = document.querySelector(".menu-panel");

if (menuBtn && menu && menuPanel) {
  menuBtn.addEventListener("click", () => {
    const aberto = menu.classList.toggle("active");
    menuBtn.classList.toggle("active", aberto);
  });

  menu.addEventListener("click", (e) => {
    if (!menuPanel.contains(e.target)) {
      menu.classList.remove("active");
      menuBtn.classList.remove("active");
    }
  });
}

/********************************
 * TOAST
 ********************************/
function showToast(message, type = "success", duration = 1200) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.className = `toast active ${type}`;
  toast.innerHTML = `<div class="toast-message">${message}</div>`;

  setTimeout(() => {
    toast.classList.remove("active");
  }, duration);
}

/********************************
 * LOGOUT
 ********************************/
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.onclick = () => {
    logout().then(() => {
      window.location.href = "login.html";
    });
  };
}

/********************************
 * INIT (EVENTOS DE UI)
 ********************************/

/*********************
 * gastos fixos
 *********************/
function adicionarGFixo() {
  if (!window.appState) return;

  const desc = document.getElementById("fixoDescricao");
  const valor = document.getElementById("fixoValor");

  if (!desc.value || Number(valor.value) <= 0) {
    showToast("Preencha descrição e valor válido.", "error");
    return;
  }

  const novoGFixo = {
    id: crypto.randomUUID(),
    descricao: desc.value,
    valor: Number(valor.value),
    mes: new Date().getMonth(),
    ano: new Date().getFullYear(),
  };

  // ✅ cria novo array (imutável)
  const novos = [...window.appState.gastosFixos, novoGFixo];

  // ✅ nome correto + tipo correto
  window.appState.setGastosFixos(novos);

  desc.value = "";
  valor.value = "";

  showToast("Gasto fixo adicionado com sucesso ✔");
}

function irParaGastosFixos() {
  window.location.href = "fixos.html";
}

/*********************
 * gastos
 *********************/
function adicionarGasto() {
  if (!window.appState) return;

  const nomeEl = document.getElementById("nome");
  const valorEl = document.getElementById("valor");
  const categoriaEl = document.getElementById("categoria");
  const bancoEl = document.getElementById("banco");
  const parcelasEl = document.getElementById("parcelas");
  const mesFaturaEl = document.getElementById("mesFatura");

  const nome = nomeEl.value.trim();
  const valor = Number(valorEl.value);
  const parcelas = Number(parcelasEl.value) || 1;
  const banco = bancoEl.value;
  const categoria = categoriaEl.value.trim().toLowerCase();
  const mesInicio = Number(mesFaturaEl.value);

  if (!nome || valor <= 0 || isNaN(mesInicio)) {
    showToast("Preencha corretamente os campos.", "error");
    return;
  }

  const novoGasto = {
    id: crypto.randomUUID(),
    nome,
    valor,
    categoria,
    banco,
    parcelas,
    mesInicio,
    anoInicio: new Date().getFullYear(),
  };

  // 🔥 IMUTABILIDADE + FIRESTORE
  const novosGastos = [...window.appState.gastos, novoGasto];
  window.appState.setGastos(novosGastos);

  // 🧹 limpar inputs
  nomeEl.value = "";
  valorEl.value = "";
  parcelasEl.value = "";

  showToast("Gasto adicionado com sucesso ✔");
}

//atualiza card da fatura
function renderizarCardsFatura() {
  if (!window.appState) return;

  const gastos = window.appState.gastos || [];

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const cards = document.querySelectorAll(".fatura");
  if (!cards.length) return;

  cards.forEach((el) => {
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
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".analise-fat");
  if (!btn) return;

  const banco = btn.dataset.banco;
  window.location.href = `analise.html?banco=${encodeURIComponent(banco)}`;
});

function atualizarDashboard() {
  if (typeof calcularDashboard === "function") {
    calcularDashboard();
  }
}

function criarOuAtualizarLimite() {
  if (!window.appState) return;

  const categoriaInput = document.getElementById("categoriaLimite");
  const limiteInput = document.getElementById("limite");

  if (!categoriaInput || !limiteInput) return;

  const categoria = categoriaInput.value.trim().toLowerCase();
  const limite = Number(limiteInput.value);

  if (!categoria || limite <= 0) {
    showToast("Informe categoria e limite válidos.", "error");
    return;
  }

  const limitesAtuais = window.appState.limites;

  const novosLimites = limitesAtuais.some((l) => l.categoria === categoria)
    ? limitesAtuais.map((l) =>
        l.categoria === categoria ? { ...l, limite } : l
      )
    : [...limitesAtuais, { categoria, limite }];

  window.appState.setLimites(novosLimites);

  categoriaInput.value = "";
  limiteInput.value = "";
  renderizarLimites();


  showToast("Limite salvo com sucesso ✔");
}

function renderizarLimites() {
  const container = document.getElementById("listaLimites");
  if (!container || !window.appState) return;

  container.innerHTML = "";

  window.appState.limites.forEach((l) => {
    const gastoAtual = totalPorCategoria(l.categoria);
    const percentual =
      l.limite > 0 ? Math.min((gastoAtual / l.limite) * 100, 100) : 0;

    const div = document.createElement("div");
    div.className = "limite-card" + (gastoAtual >= l.limite ? " alerta" : "");

    div.innerHTML = `
      <div class="limite-header">
        <span>${l.categoria}</span>
        <div>
          <span>R$ ${gastoAtual.toFixed(2)} / ${l.limite.toFixed(2)}</span>
          <button 
            class="remover-limite"
            data-categoria="${l.categoria}"
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

function totalPorCategoria(categoria) {
  if (!window.appState) return 0;

  const gastos = window.appState.gastos;

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

//remover alerta de limite
function removerLimite(categoria) {
  if (!window.appState) return;

  const novosLimites = window.appState.limites.filter(
    (l) => l.categoria !== categoria
  );

  // 🔥 estado central + Firestore
  window.appState.setLimites(novosLimites);

  // 🔴 FORÇA REDESENHO
  renderizarLimites();

  showToast("Alerta de limite removido ✔");
}



function criarCardCartaoUsuario(cartao) {
  const container = document.querySelector(".cartoes");
  if (!container) return;

  if (container.querySelector(`[data-banco="${cartao.slug}"]`)) return;

  const div = document.createElement("div");
  div.className = `cartao ${cartao.slug}`;
  div.dataset.banco = cartao.slug;

  // 🎨 aplica cor dinâmica
  div.style.setProperty("--card-start", cartao.cor);
  div.style.setProperty(
    "--card-end",
    cartao.cor + "cc" // leve variação
  );

  div.innerHTML = `
  ${
    cartao.slug !== "dp"
      ? `
    <button 
      class="remover-cartao"
      onclick="removerCartao('${cartao.slug}')"
      aria-label="Remover cartão"
    >
      ✕
    </button>
  `
      : ""
  }

  <p>${cartao.nome}</p>
  <strong>
    Fatura: R$
    <span class="fatura" data-banco="${cartao.slug}">0,00</span>
  </strong>
  <button class="analise-fat" data-banco="${cartao.slug}">
    Visualizar
  </button>
`;
const novoCartaoEl = container.querySelector(".novo-cartao");

if (novoCartaoEl) {
  container.insertBefore(div, novoCartaoEl);
} else {
  container.appendChild(div);
}
}

function adicionarCartao() {
  if (!window.appState) return;

  const nomeEl = document.getElementById("cartaoNome");
  const corEl = document.getElementById("cartaoCor");

  const nome = nomeEl.value.trim();
  if (!nome || nome.length < 2) {
    showToast("Informe um nome válido para o cartão.", "error");
    return;
  }

  const slug = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

  const cartoesAtuais = window.appState.cartoes;

  if (cartoesAtuais.some((c) => c.slug === slug)) {
    showToast("Já existe um cartão com esse nome.", "error");
    return;
  }

  const novoCartao = {
    id: crypto.randomUUID(),
    nome,
    slug,
    cor: corEl.value,
  };

  const novosCartoes = [...cartoesAtuais, novoCartao];

  // 🔥 estado central + Firestore + eventos
  window.appState.setCartoes(novosCartoes);

  // 🔄 UI imediata (não depende do reload)
  renderizarSelectBanco();
  criarCardCartaoUsuario(novoCartao);
  renderizarCardsFatura();

  nomeEl.value = "";

  showToast(`Cartão "${nome}" criado com sucesso ✔`);
}
function renderizarSelectBanco() {
  const select = document.getElementById("banco");
  if (!select) return;

  // 1️⃣ bancos vindos do HTML (cards fixos)
  const bancosHTML = Array.from(
    document.querySelectorAll(".cartao[data-banco]")
  ).map(el => ({
    slug: el.dataset.banco,
    nome: el.querySelector("p")?.innerText || el.dataset.banco
  }));

  // 2️⃣ bancos vindos do estado (Firestore)
  const bancosEstado = window.appState?.cartoes || [];

  // 3️⃣ unifica (sem duplicar)
  const bancosUnicos = {};

  [...bancosHTML, ...bancosEstado].forEach(b => {
    if (b?.slug) {
      bancosUnicos[b.slug] = b;
    }
  });

  // 4️⃣ remove opções que não existem mais
  Array.from(select.options).forEach(opt => {
    if (opt.value && !bancosUnicos[opt.value]) {
      opt.remove();
    }
  });

  // 5️⃣ adiciona opções faltantes
  Object.values(bancosUnicos).forEach(b => {
    if (!select.querySelector(`option[value="${b.slug}"]`)) {
      const option = document.createElement("option");
      option.value = b.slug;
      option.innerText = b.nome;
      select.appendChild(option);
    }
  });
}

function removerCartao(slug) {
  if (!window.appState) return;

  if (slug === "dp") {
    showToast("O cartão Dinheiro / Pix não pode ser removido.", "error");
    return;
  }

  const totalFatura = totalFaturaAtualPorCartao(slug);
  if (totalFatura > 0) {
    showToast(
      "Este cartão possui fatura em aberto e não pode ser removido.",
      "error"
    );
    return;
  }

  const confirmar = confirm("Remover este cartão?\nEle será removido do app.");
  if (!confirmar) return;

  // 🔥 REMOVE DE FORMA IMUTÁVEL E CENTRALIZADA
  const novosCartoes = window.appState.cartoes.filter((c) => c.slug !== slug);

  // 🔥 ATUALIZA ESTADO + FIRESTORE + EVENTOS
  window.appState.setCartoes(novosCartoes);

  // 🔥 ATUALIZA UI LOCAL
  const card = document.querySelector(`.cartao[data-banco="${slug}"]`);
  if (card) card.remove();

  const option = document.querySelector(`#banco option[value="${slug}"]`);
  if (option) option.remove();

  showToast("Cartão removido com sucesso ✔");
}
function totalFaturaAtualPorCartao(slug) {
  if (!window.appState) return 0;

  const gastos = window.appState.gastos;

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  return gastos.reduce((total, g) => {
    if (g.banco !== slug) return total;

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


const corInput = document.getElementById("cartaoCor");
const preview = document.querySelector(".color-picker .preview");

if (corInput && preview) {
  preview.style.setProperty("--cor", corInput.value);

  corInput.addEventListener("input", () => {
    preview.style.setProperty("--cor", corInput.value);
  });
}


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}


document.addEventListener("DOMContentLoaded", () => {
  // botão ver ganhos

  const btnGF = document.getElementById("btnAdicionarGFixo");
  if (btnGF) {
    btnGF.addEventListener("click", adicionarGFixo);
  }
  const verGanhos = document.querySelector(".ver-ganhos");
  if (verGanhos) {
    verGanhos.addEventListener("click", () => {
      window.location.href = "entradas.html";
    });
  }

  // 🔹 BOTÃO DE ADICIONAR ENTRADA (GANHOS)
  const btnEntrada = document.getElementById("btnAdicionarEntrada");
  if (btnEntrada) {
    btnEntrada.addEventListener("click", adicionarEntrada);
  }

  // 🔹 CARTÕES — SOMENTE SE O CONTAINER EXISTIR
  const containerCartoes = document.querySelector(".cartoes");
  if (containerCartoes) {
    cartoes.forEach((c) => {
      if (c.slug !== "dp") criarCardCartaoUsuario(c);
    });
  }
  const btn = document.getElementById("btnGastosFixos");
  if (btn) {
    btn.addEventListener("click", irParaGastosFixos);
  }
  const btnGasto = document.getElementById("btnAdicionarGasto");
  if (btnGasto) {
    btnGasto.addEventListener("click", adicionarGasto);
  }
  const btnAC = document.getElementById("btnAdicionarCartao");
  if (btnAC) {
    btnAC.addEventListener("click", adicionarCartao);
  }
  const btnSL = document.getElementById("btnSalvarLimite");
  if (btnSL) {
    btnSL.addEventListener("click", criarOuAtualizarLimite);
  }

   
});
function sincronizarCardsComEstado() {
  if (!window.appState) return;

  const cartoesEstado = window.appState.cartoes || [];
  const container = document.querySelector(".cartoes");
  if (!container) return;

  cartoesEstado.forEach(cartao => {
    // se já existe no HTML, não cria
    const existe = container.querySelector(
      `.cartao[data-banco="${cartao.slug}"]`
    );

    if (!existe) {
      criarCardCartaoUsuario(cartao);
    }
  });
}


document.addEventListener("click", (e) => {
  // remover cartão
  const btnCartao = e.target.closest(".remover-cartao");
  if (btnCartao) {
    const cartao = btnCartao.closest(".cartao");
    const slug = cartao?.dataset.banco;
    if (slug) removerCartao(slug);
    return;
  }

  // remover limite
  const btnLimite = e.target.closest(".remover-limite");
  if (btnLimite) {
    const categoria = btnLimite.dataset.categoria;
    if (categoria) removerLimite(categoria);
    return;
  }
});

document.addEventListener("dadosAtualizados", () => {
  // dashboard
  atualizarDashboard();

  // UI dependente de dados
  renderizarCardsFatura();
  renderizarLimites();
  renderizarSelectBanco();
  sincronizarCardsComEstado();
});
