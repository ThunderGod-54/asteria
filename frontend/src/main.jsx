import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./Theme";
import { SessionProvider } from "./services/sessionContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <SessionProvider>
      <App />
    </SessionProvider>
  </ThemeProvider>
);
