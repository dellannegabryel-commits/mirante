# Temas: seletor com paletas da comunidade

O app é escuro por padrão e a cor inteira vive em `tokens.css` como CSS custom
property (`--surface-*`, `--text-*`, `--accent-*`, `--tally`, `--signal-*`,
`--rule*`). O resto do CSS consome `var(...)`. Isso significa que trocar de tema
é sobrescrever tokens — sem tocar em layout, tipografia, espaçamento ou
movimento. A identidade (brutalismo de luxo, mono, hairlines de 1px) fica em
qualquer tema.

## Decisões de escopo

1. **Overlay fica escuro em todo tema.** É uma folha por cima de um jogo;
   escuro é acerto, não bug. O mesmo vale pros pratos translúcidos do rail que
   flutuam sobre o vídeo (`hsl(258 40% ...)` hardcoded) — não são cromado de
   janela, são chrome sobre vídeo.
2. **Tema padrão continua o atual ("Rack").** Nada muda pra quem já usa o app:
   sem `data-theme` no `<html>`, `tokens.css` reina. Rack é o caso sem arquivo.
3. **Tema claros entram já na primeira leva** (Solarized Light, Gruvbox Light,
   GitHub Light, Rosé Pine Dawn), protegidos pelo check de contraste.

## Modelo

- Tema = `<html data-theme="dracula">` com um arquivo
  `src/renderer/src/styles/themes/<nome>.css` sobrescrevendo só tokens de cor.
  `themes/index.css` importa todos; `global.css` importa `themes/index.css`
  **depois** de `tokens.css`, então o cascade resolve tema por cima do padrão.
- Derivações (`--accent-wash/edge/glow`, `--tally-wash/edge`) usam sintaxe de cor
  relativa `hsl(from var(--accent) h s l / α)`, que o repo já usa no overlay —
  cada tema declara a cor base e o resto acompanha o accent sozinho.
- Aplicação: `applyTheme()` em `lib/settings.ts`, chamado no load e em
  `updateSettings`. `settings.ts` carrega antes do primeiro render do React, sem
  flash; CSP do `index.html` não permite script inline, e não precisamos.
- Persistência: `theme: string` no `Settings` (localStorage, mesmo caminho de
  todo o resto). `rack` = remover o atributo.

## Temas de partida (15)

| id | nome | modo |
|---|---|---|
| rack | Rack (padrão) | escuro |
| dracula | Dracula | escuro |
| nord | Nord | escuro |
| catppuccin | Catppuccin Mocha | escuro |
| tokyo-night | Tokyo Night | escuro |
| one-dark | One Dark | escuro |
| monokai | Monokai | escuro |
| rose-pine | Rosé Pine | escuro |
| everforest | Everforest | escuro |
| palenight | Palenight | escuro |
| solarized-dark | Solarized Dark | escuro |
| solarized-light | Solarized Light | claro |
| gruvbox-dark | Gruvbox Dark | escuro |
| gruvbox-light | Gruvbox Light | claro |
| github-light | GitHub Light | claro |

Cada tema ≈ 30 linhas. Pra adicionar mais: um arquivo novo + uma entrada em
`lib/themes.ts` (nome, modo, chips de preview). A grade mostra 16 temas em duas
colunas e rola dentro da folha.

## Tokens que todo tema declara (a lista do check)

São 35 tokens de cor, todos literais (o check lê os valores):

```
--surface-base --surface-1 --surface-2 --surface-3 --surface-4
--surface-input --surface-stage
--text-primary --text-secondary --text-tertiary --text-muted
--accent --accent-bright --accent-deep --accent-ink
--accent-wash --accent-edge --accent-glow
--tally --tally-wash --tally-edge
--signal-good --signal-fair --signal-poor --signal-dead
--rule-faint --rule --rule-strong --rule-accent --focus-ring
--scroll-thumb --scroll-thumb-hover
--shadow-plate --shadow-pop
--danger
```

## Delta de tokenização

Cores que estavam hardcoded fora de `tokens.css` e ignoravam qualquer tema, agora
viram token (ou passam a derivar do token semanticamente próximo):

- `controls.css:90` texto em seg on → `var(--accent-ink)`.
- `controls.css:418`, `app.css:161` borda do "bom" → alpha de `--signal-good`.
- `controls.css:884`, `rail.css:484/489` gradiente/nível de voz →
  `--signal-good` → `--signal-fair` → `--tally`.
- `rail.css:497` texto do scrub → `--text-primary` (o prato escuro dele fica).
- `global.css` scrollbar → `--scroll-thumb` / `--scroll-thumb-hover`.
- `controls.css:1893` `var(--danger, #e5484d)` → token `--danger` de verdade.
- `app.css:143` branco sobre tally preenchido fica branco: branco sobre cor
  saturada aguenta nos dois modos.

## Validação

`npm run theme-check` (`scripts/theme-check.mjs`, sem dependência):

1. todo arquivo de tema define a lista completa de tokens de cor;
2. os chips em `lib/themes.ts` batem com cores literais do arquivo do tema;
3. contraste WCAG nos pares-chave, só em valor literal (derivados por sintaxe
   relativa são consequência do accent):
   - `--text-primary` sobre `--surface-1` ≥ 4,5
   - `--text-secondary` sobre `--surface-1` ≥ 4,5
   - `--accent` sobre `--surface-1` ≥ 3
   - `--accent-ink` sobre `--accent` ≥ 4,5
   - `--tally` sobre `--surface-1` ≥ 3

Mais `npm run typecheck` e `npm run build`. No app rodando, o probe CDP já
existe: dá pra setar `data-theme` em cada tema e ler as cores computadas sem
clique de desktop.

## Limites honestos

- Os ~20 pratos escuros hardcoded do overlay/rail continuam escuros por
  qualquer tema, por decisão (chrome sobre vídeo).
- Paletas oficiais entram mapeadas à mão pros 36 tokens semânticos — o check
  garante completude e contraste, não garantia de que o mapeamento é o que o
  autor da paleta usaria de UI.
- `prefers-color-scheme` não entra: tema é escolha explícita, persistida.
