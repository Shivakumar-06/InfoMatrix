import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import ScrollToTop from "./components/reusable/ScrollToTop.tsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ScrollToTop />
    <Toaster
        toastOptions={{
          duration: 4000,
          className:
            "bg-white text-gray-900 shadow-lg border border-gray-200 mb-8",
        }}
        richColors
      />
    <AuthProvider>
        <App />
    </AuthProvider>
  </BrowserRouter>
);
