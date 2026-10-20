export type ThemeMode = 'escuro' | 'claro';

export interface ThemeInfo {
  id: string;
  name: string;
  mode: ThemeMode;
  chips: [string, string, string];
}

export const RACK: ThemeInfo = {
  id: 'rack',
  name: 'Rack',
  mode: 'escuro',
  chips: ['hsl(258 17% 7.5%)', 'hsl(263 88% 72%)', 'hsl(352 85% 63%)']
};

export const THEMES: ThemeInfo[] = [
  RACK,
  { id: 'dracula', name: 'Dracula', mode: 'escuro', chips: ['#282a36', '#bd93f9', '#ff5555'] },
  { id: 'nord', name: 'Nord', mode: 'escuro', chips: ['#2e3440', '#88c0d0', '#bf616a'] },
  { id: 'catppuccin', name: 'Catppuccin Mocha', mode: 'escuro', chips: ['#1e1e2e', '#cba6f7', '#f38ba8'] },
  { id: 'tokyo-night', name: 'Tokyo Night', mode: 'escuro', chips: ['#1a1b26', '#7aa2f7', '#f7768e'] },
  { id: 'one-dark', name: 'One Dark', mode: 'escuro', chips: ['#282c34', '#61afef', '#e06c75'] },
  { id: 'monokai', name: 'Monokai', mode: 'escuro', chips: ['#272822', '#66d9ef', '#f92672'] },
  { id: 'rose-pine', name: 'Rosé Pine', mode: 'escuro', chips: ['#191724', '#c4a7e7', '#eb6f92'] },
  { id: 'everforest', name: 'Everforest', mode: 'escuro', chips: ['#2d353b', '#7fbbb3', '#e67e80'] },
  { id: 'palenight', name: 'Palenight', mode: 'escuro', chips: ['#292d3e', '#82aaff', '#ff5370'] },
  { id: 'solarized-dark', name: 'Solarized Dark', mode: 'escuro', chips: ['#002b36', '#2aa198', '#dc322f'] },
  { id: 'solarized-light', name: 'Solarized Light', mode: 'claro', chips: ['#fdf6e3', '#1669a0', '#dc322f'] },
  { id: 'gruvbox-dark', name: 'Gruvbox Dark', mode: 'escuro', chips: ['#282828', '#fe8019', '#fb4934'] },
  { id: 'gruvbox-light', name: 'Gruvbox Light', mode: 'claro', chips: ['#fbf1c7', '#af3a03', '#cc241d'] },
  { id: 'github-light', name: 'GitHub Light', mode: 'claro', chips: ['#ffffff', '#0969da', '#cf222e'] },
  { id: 'rose-pine-dawn', name: 'Rosé Pine Dawn', mode: 'claro', chips: ['#fffaf3', '#907aa9', '#b4637a'] },
];
