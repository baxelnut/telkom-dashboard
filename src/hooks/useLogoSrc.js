import { useCallback } from "react";
// Context
import { useTheme } from "../context/ThemeContext";

// Custom hook to get logo source based on theme & screen size
export default function useLogoSrc() {
  const { isDarkMode } = useTheme();

  const getLogoSrc = useCallback(() => {
    return window.innerWidth >= 768
      ? isDarkMode
        ? "/logos/telkom-big-reverse.svg"
        : "/logos/telkom-big.svg"
      : isDarkMode
      ? "/logos/telkom-reverse.svg"
      : "/logos/telkom.svg";
  }, [isDarkMode]);

  return getLogoSrc;
}
