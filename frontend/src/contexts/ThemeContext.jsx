// frontend/src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

const themes = {
  cyberpunk: {
    name: "Cyberpunk",
    primary: "#00ff88",
    secondary: "#ff0088",
    accent: "#00ffff",
    background: "#0a0a0a",
    surface: "#1a1a1a",
    text: "#ffffff",
    textSecondary: "#a0a0a0",
    gradient: "linear-gradient(135deg, #00ff88, #00ffff, #ff0088)",
    shadow: "0 10px 30px rgba(0, 255, 136, 0.3)",
    glowShadow: "0 0 20px rgba(0, 255, 136, 0.5)",
  },
  ocean: {
    name: "Ocean Depths",
    primary: "#00d4ff",
    secondary: "#0066cc",
    accent: "#4d79ff",
    background: "#0f1419",
    surface: "#1e2837",
    text: "#ffffff",
    textSecondary: "#94a3b8",
    gradient: "linear-gradient(135deg, #00d4ff, #4d79ff, #0066cc)",
    shadow: "0 10px 30px rgba(0, 212, 255, 0.3)",
    glowShadow: "0 0 20px rgba(0, 212, 255, 0.5)",
  },
  sunset: {
    name: "Sunset Code",
    primary: "#ff6b35",
    secondary: "#f7931e",
    accent: "#ffb347",
    background: "#1a1a2e",
    surface: "#16213e",
    text: "#ffffff",
    textSecondary: "#cbd5e1",
    gradient: "linear-gradient(135deg, #ff6b35, #f7931e, #ffb347)",
    shadow: "0 10px 30px rgba(255, 107, 53, 0.3)",
    glowShadow: "0 0 20px rgba(255, 107, 53, 0.5)",
  },
  forest: {
    name: "Code Forest",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    background: "#0f1419",
    surface: "#1f2937",
    text: "#ffffff",
    textSecondary: "#9ca3af",
    gradient: "linear-gradient(135deg, #10b981, #059669, #34d399)",
    shadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
    glowShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
  },
  light: {
    name: "Clean Light",
    primary: "#2563eb",
    secondary: "#3b82f6",
    accent: "#60a5fa",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1e293b",
    textSecondary: "#64748b",
    gradient: "linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa)",
    shadow: "0 10px 30px rgba(37, 99, 235, 0.15)",
    glowShadow: "0 0 20px rgba(37, 99, 235, 0.2)",
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentTheme, setCurrentTheme] = useState("cyberpunk");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedMode = localStorage.getItem("darkMode");

    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    if (savedMode !== null) {
      setIsDarkMode(JSON.parse(savedMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", currentTheme);
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));

    const theme = themes[currentTheme];
    const root = document.documentElement;

    // Apply CSS custom properties
    root.style.setProperty("--color-primary", theme.primary);
    root.style.setProperty("--color-secondary", theme.secondary);
    root.style.setProperty("--color-accent", theme.accent);
    root.style.setProperty(
      "--color-background",
      isDarkMode ? theme.background : themes.light.background
    );
    root.style.setProperty(
      "--color-surface",
      isDarkMode ? theme.surface : themes.light.surface
    );
    root.style.setProperty(
      "--color-text",
      isDarkMode ? theme.text : themes.light.text
    );
    root.style.setProperty(
      "--color-text-secondary",
      isDarkMode ? theme.textSecondary : themes.light.textSecondary
    );
    root.style.setProperty("--gradient-primary", theme.gradient);
    root.style.setProperty("--shadow-primary", theme.shadow);
    root.style.setProperty("--shadow-glow", theme.glowShadow);

    // Apply dark/light mode class
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [currentTheme, isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const value = {
    isDarkMode,
    currentTheme,
    theme: themes[currentTheme],
    themes,
    toggleDarkMode,
    changeTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-${currentTheme} ${isDarkMode ? "dark" : "light"}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
