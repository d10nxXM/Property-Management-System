import { create } from 'zustand';

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (isDark) => {
  if (isDark) {
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
  }
};

const useThemeStore = create((set) => ({
  isDark: true,

  initTheme: () => {
    const isDark = getInitialTheme();
    applyTheme(isDark);
    set({ isDark });
  },

  toggleTheme: () => set((state) => {
    const isDark = !state.isDark;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme(isDark);
    return { isDark };
  }),
}));

export default useThemeStore;