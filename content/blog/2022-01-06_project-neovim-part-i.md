+++
title = "Neovim-Config-Part 1"
date = "2022-01-06"
updated = "2022-01-06T22:00:00Z"
description = "Einmal neovim von Scratch -> 0 auf 100 in pure lua und ohne Distribution"
+++

_**Disclaimer:** Artikelserie ist absolute und 100% WIP._

Nachdem ich jetzt zahlreiche wunderbare (ehrlich! keine Ironie) Vim
Distributionen durch habe, wird es doch mal wieder Zeit mir meine Config 100%
selber zusammen zu stellen.

Im Grund genommen, ist in diesem Beitrag erst einmal nur Brainstorm angesagt.
Also eine Menge Chaos!

Inspirierend fand ich folgende Distributionen:

- [SpaceVim](https://spacevim.org)
- [LunarVim](https://www.lunarvim.org)
- [CosmicVim](https://cosmicnvim.vercel.app) (aktuell im Einsatz - echt super)

Gerade **CosmicVim** hat mich von der lua Struktur echt überzeugt. Cooles Ding!

Wie stelle ich mir das Ganze nun vor? Im Grunde genommen will ich das Ganze
iterativ aufbauen:

1. Neovim Grundlagen: Also pluginfreie settings
2. Base Plugins: lua Helfer, Package Manager, Kompression, which-key, etc.
3. LSP Integration -> Damit ich mit allen Sprachen soweit einsatzbereit bin
4. Testingintegration
5. DAP/Debugger Integration
6. Zusätzliche Helferlein:
   - Autocomplete
   - Autoformat
   - Snippets
   - uvm.
7. Sprachspezifisches

## Plugins

Ich habe eine absolute MASSE an Plugins angesammelt, die mehr oder weniger
sinnvoll klangen. Ich werde die hier nun schonmal vorsortieren.

Ich werde aber ziemlich sicher nicht alle verwenden :D.

### Base Plugins

- [lewis6991/impatient.nvim](https://github.com/lewis6991/impatient.nvim)
  CompileCache für lua-modules

tbc

### LSP

- [RishabhRD/nvim-lsputils](https://github.com/RishabhRD/nvim-lsputils)
  Floating Window für CodeActions, Preview Window, Fuzzy find stuff
- [folke/lsp-colors.nvim](https://github.com/folke/lsp-colors.nvim) Fügt
  hightlights für themes hinzu, falls diese noch für LSP fehlen
- [kosayoda/nvim-lightbulb](https://github.com/kosayoda/nvim-lightbulb) Kleine
  Glühbirne als Anzeige ob es LSP annotationen gibt
- [jose-elias-alvarez/null-ls.nvim](https://github.com/jose-elias-alvarez/null-ls.nvim)
  Ermöglicht es **nicht-LSP** ressourcen im LSP Context angezeigt zu werden

tbc

### Testing

- [rcarriga/vim-ultest](https://github.com/rcarriga/vim-ultest) Baut auf
  [vim-test](https://github.com/vim-test/vim-test) auf. Ergebnisse in floating
  Windows. Signs. Zeige einzelne Tests.

### Debugger

tba

### Helferlein

#### Navigation

- [kyazdani42/nvim-tree.lua](https://github.com/kyazdani42/nvim-tree.lua)
  Nerdtree alternative

#### Coremechanik Erweiterungen

- [gelguy/wilder.nvim](https://github.com/gelguy/wilder.nvim) Erweitert das
  wildmenu von Neovim: Vorschläge beim tippen von : und /.

#### Code Format

- [sbdchd/neoformat](https://github.com/sbdchd/neoformat) Autoformatter für
  diverse Sprachen mit einer Menge voreingestellter Formatter. Kein Lua.

#### Git

- [kdheepak/lazygit.nvim](https://github.com/kdheepak/lazygit.nvim) Wrapper für
  [lazygit](https://github.com/jesseduffield/lazygit)
- [tanvirtin/vgit.nvim](https://github.com/tanvirtin/vgit.nvim) visuelles Git
  Plugin

#### Anderes

- [NTBBloodbath/rest.nvim](https://github.com/NTBBloodbath/rest.nvim) REST
  Client (Alternative: HTTPie wrappen?)
- [gennaro-tedesco/nvim-peekup](https://github.com/gennaro-tedesco/nvim-peekup)
  Floating Fenster mit Registern
- [oberblastmeister/neuron.nvim](https://github.com/oberblastmeister/neuron.nvim)
  Note Taking Ansatz
- [nvim-neorg/neorg](https://github.com/nvim-neorg/neorg) Alternativer Note
  Taking Ansatz

### Eye-Candy

- [kyazdani42/nvim-web-devicons](https://github.com/kyazdani42/nvim-web-devicons)
  Icons für zahlreiche Plugins

#### Allgemein

- [rcarriga/nvim-notify](https://github.com/rcarriga/nvim-notify) Kleine
  Notification-Fenster die rechts oben schweben
- [noib3/nvim-cokeline](https://github.com/noib3/nvim-cokeline) Bufferline für
  Buffer, Tabs, etc. Evtl mit Alternativen vergleichen.

#### Themes

- [Mangeshrex/uwu.vim](https://github.com/Mangeshrex/uwu.vim) Konstrastreiches
  Theme für (neo)vim.
  [Bild](https://raw.githubusercontent.com/Mangeshrex/uwu.vim/main/assets/uwu.png)
- [rose-pine/neovim](https://github.com/rose-pine/neovim) Rosepine. Pastell.
  [Bild](https://github.com/rose-pine/neovim/blob/main/assets/rose-pine-dawn.png?raw=true)

### Sprachspezifisches

- [nvim-lua/lsp_extensions](https://github.com/nvim-lua/lsp_extensions.nvim) Zusätzliche
  LSP-Hilfe bei Rust und Dart
