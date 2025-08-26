import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    const updateTheme = (newTheme: Theme) => {
      if (newTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.classList.toggle('dark', systemTheme === 'dark');
      } else {
        root.classList.toggle('dark', newTheme === 'dark');
      }
    };

    updateTheme(theme);
    localStorage.setItem('theme', theme);

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme('system');
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  return { theme, setTheme };
}

// Prevent flash of unstyled content
export function injectThemeScript() {
  const script = `
    (function() {
      try {
        const theme = localStorage.getItem('theme') || 'system';
        const root = document.documentElement;
        
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          root.classList.add('dark');
        }
      } catch (e) {}
    })();
  `;
  
  if (typeof document !== 'undefined') {
    const scriptElement = document.createElement('script');
    scriptElement.innerHTML = script;
    document.head.appendChild(scriptElement);
  }
}