import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/**
 * Estrutura padrão do usuário
 */
function dadosBase() {
  return {
    gastos: [],
    gastosFixos: [],
    entradas: [],
    cartoes: [
      {
        id: "dp",
        nome: "Dinheiro / Pix",
        slug: "dp",
        cor: "#4CAF50"
      }
    ],
    limites: []
  };
}

/**
 * Carrega dados do usuário
 */
export async function carregarDados(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    // 🔐 garante que nada venha undefined
    return {
      ...dadosBase(),
      ...snap.data()
    };
  }

  const iniciais = dadosBase();
  await setDoc(ref, iniciais);
  return iniciais;
}

/**
 * Salva todos os dados do usuário
 */
export async function salvarDados(uid, dados) {
  if (!uid) return;

  const ref = doc(db, "users", uid);

  // 🔐 garante estrutura completa sempre
  const payload = {
    ...dadosBase(),
    ...dados
  };

  await setDoc(ref, payload);
}
