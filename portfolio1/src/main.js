import React from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";
import App from "./App.js";

const root =
  document.getElementById("root") ||
  document.body.appendChild(document.createElement("div"));
createRoot(root).render(React.createElement(App));
