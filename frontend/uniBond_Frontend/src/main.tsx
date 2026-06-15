import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "@/App";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProfessionalCommunicationProvider } from "@/contexts/ProfessionalCommunicationContext";
import { CourseProvider } from "@/contexts/CourseContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ProfessionalCommunicationProvider>
            <CourseProvider>
              <App />
            </CourseProvider>
          </ProfessionalCommunicationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  </StrictMode>,
);
