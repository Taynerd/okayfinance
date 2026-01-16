import { loginComGoogle, observarLogin } from "./auth.js";

document.getElementById("btnGoogle").onclick = () => {
  loginComGoogle().catch(err => {
    console.error(err);
    alert("Erro ao fazer login");
  });
};

// Se já estiver logado, pula o login
observarLogin(user => {
  if (user) {
    window.location.href = "/index.html";
  }
});
