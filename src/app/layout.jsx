import "./globals.css";
import { ThemeProvider } from "../components/ThemeContext.jsx";
import { AuthProvider } from "../components/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import FloatingThemeToggle from "../components/FloatingThemeToggle.jsx";

export const metadata = {
  title: "Career Compass | Adaptive AI Career Discovery",
  description: "RIASEC-informed adaptive career discovery for Indian college students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-black dark:bg-black text-white antialiased selection:bg-lime-400 selection:text-black transition-colors duration-200">
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            {children}
            <Footer />
            <FloatingThemeToggle />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
