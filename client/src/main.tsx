import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set authentication token for testing
if (typeof window !== 'undefined') {
  localStorage.setItem('finsync_token', 'test-token');
}

createRoot(document.getElementById("root")!).render(<App />);
