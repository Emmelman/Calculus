import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/theme.css";
import "./styles/app.css";
import "./pwa";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
