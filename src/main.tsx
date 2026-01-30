import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";

// Eu busco a div com id 'root' no HTML e injeto minha aplicação React dentro dela.
createRoot(document.getElementById("root")!).render(
  // Eu uso o StrictMode para que o React me avise de potenciais problemas durante o desenvolvimento.
  <StrictMode>
    <App />
  </StrictMode>
);