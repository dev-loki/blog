+++
title = "Neovim-Config-Part 1: Brainstorm"
date = "2022-01-06"
updated = "2022-01-08T21:00:00Z"
description = "Einmal neovim von Scratch von 0 auf 100 in pure lua"
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

0. (hier) Brainstorm und Plugins sammeln
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

### LSP

- [neovim/nvim-lspconfig](https://github.com/neovim/nvim-lspconfig) Helpful LSP config tool
- [williamboman/nvim-lsp-installer/](https://github.com/williamboman/nvim-lsp-installer/) Installer <3
- [nanotee/sqls.nvim](https://github.com/nanotee/sqls.nvim) SQL für LSP
- [RishabhRD/nvim-lsputils](https://github.com/RishabhRD/nvim-lsputils) Floating Window für CodeActions, Preview Window, Fuzzy find stuff
- [folke/lsp-colors.nvim](https://github.com/folke/lsp-colors.nvim) Fügt hightlights für themes hinzu, falls diese noch für LSP fehlen
- [kosayoda/nvim-lightbulb](https://github.com/kosayoda/nvim-lightbulb) Kleine Glühbirne als Anzeige ob es LSP annotationen gibt
- [jose-elias-alvarez/null-ls.nvim](https://github.com/jose-elias-alvarez/null-ls.nvim) Ermöglicht es **nicht-LSP** ressourcen im LSP Context angezeigt zu werden
- [weilbith/nvim-code-action-menu](https://github.com/weilbith/nvim-code-action-menu) ui für code action
- [nvim-lua/lsp-status.nvim](https://github.com/nvim-lua/lsp-status.nvim) LSP Statusline components

### Testing

- [rcarriga/vim-ultest](https://github.com/rcarriga/vim-ultest) Baut auf [vim-test](https://github.com/vim-test/vim-test) auf. Ergebnisse in floating Windows. Signs. Zeige einzelne Tests.
- [https://github.com/mfussenegger/nvim-dap-python](https://github.com/mfussenegger/nvim-dap-python)

### Debugger

- [puremourning/vimspector](https://github.com/puremourning/vimspector)
- ~~[idanarye/vim-vebugger](https://github.com/idanarye/vim-vebugger) Multi protokoll debugger~~ (Zu alt/unmaintained)

- [mfussenegger/nvim-dap](https://github.com/mfussenegger/nvim-dap) Debugger Protokol Support
- [rcarriga/nvim-dap-ui](https://github.com/rcarriga/nvim-dap-ui) UI dafür
- [Pocco81/DAPInstall.nvim](https://github.com/Pocco81/DAPInstall.nvim) DAP Installer

### Helferlein

- [marklcrns/vim-smartq](https://github.com/marklcrns/vim-smartq) Master key for quitting vim buffers
- [jamestthompson3/nvim-remote-containers](https://github.com/jamestthompson3/nvim-remote-containers) Edit in Containers/Docker Support
- [rafamadriz/friendly-snippets](https://github.com/rafamadriz/friendly-snippets) Snippet Sammlung
- [L3MON4D3/LuaSnip](https://github.com/L3MON4D3/LuaSnip) Snippets
- [ThePrimeagen/refactoring.nvim](https://github.com/ThePrimeagen/refactoring.nvim) Extract Methods, Inline vars, etc.
- [mg979/vim-visual-multi](https://github.com/mg979/vim-visual-multi) Multi-Cursor

#### Cmp

- [hrsh7th/nvim-cmp](https://github.com/hrsh7th/nvim-cmp) cmp itself

- [hrsh7th/cmp-buffer](https://github.com/hrsh7th/cmp-buffer) Buffer completion source
- [hrsh7th/cmp-calc](https://github.com/hrsh7th/cmp-calc) Calculation provider für nvim-cmp
- [hrsh7th/cmp-copilot](https://github.com/hrsh7th/cmp-copilot) GithubCopilot Completion
- [hrsh7th/cmp-nvim-lsp](https://github.com/hrsh7th/cmp-nvim-lsp) LSP Resource für nvim-cmp
- [hrsh7th/cmp-nvim-lua](https://github.com/hrsh7th/cmp-nvim-lua) Neovim Lua API completion
- [hrsh7th/cmp-path](https://github.com/hrsh7th/cmp-path) filesystem paths resource
- [lukas-reineke/cmp-rg](https://github.com/lukas-reineke/cmp-rg) ripgrep source für cmp
- [lukas-reineke/cmp-under-comparator](https://github.com/lukas-reineke/cmp-under-comparator) Besser sortierte Ergebnisliste
- [petertriho/cmp-git](https://github.com/petertriho/cmp-git) Git resource
- [saadparwaiz1/cmp_luasnip](https://github.com/saadparwaiz1/cmp_luasnip) luasnip resource
- [tzachar/cmp-tabnine](https://github.com/tzachar/cmp-tabnine) Tabnine completion
- [hrsh7th/cmp-omni](https://github.com/hrsh7th/cmp-omni) Omnifunc completion
- [hrsh7th/cmp-cmdline](https://github.com/hrsh7th/cmp-cmdline) cmdline (`:cmd`) completion

#### Treesitter

- [nvim-treesitter/playground](https://github.com/nvim-treesitter/playground) Treesitter helper für Entwicklung
- [nvim-treesitter/nvim-treesitter-textobjects](https://github.com/nvim-treesitter/nvim-treesitter-textobjects) Treesitter Textsubjects
- [mfussenegger/nvim-treehopper](https://github.com/mfussenegger/nvim-treehopper) Textregion select mit Treesitter support

#### Navigation

- [nvim-neo-tree/neo-tree.nvim](https://github.com/nvim-neo-tree/neo-tree.nvim)
- [tamago324/lir.nvim](https://github.com/tamago324/lir.nvim) Extremely simple file manager
- [ThePrimeagen/harpoon](https://github.com/ThePrimeagen/harpoon) Jump to specific files
- [ray-x/navigator.lua](https://github.com/ray-x/navigator.lua) Navigation plugin: Jump to refs
- [chipsenkbeil/distant.nvim](https://github.com/chipsenkbeil/distant.nvim) Remote edit files
- [ahmedkhalf/project.nvim](https://github.com/ahmedkhalf/project.nvim) Projekt Management
- [nvim-telescope/telescope-project.nvim](https://github.com/nvim-telescope/telescope-project.nvim) Telescope/project plugin
- [nvim-pack/nvim-spectre](https://github.com/nvim-pack/nvim-spectre) Klassisches Search/Replace panel als eigener Buffer
- [phaazon/hop.nvim](https://github.com/phaazon/hop.nvim) Easymotion plugin
- [hrsh7th/vim-seak](https://github.com/hrsh7th/vim-seak) enhance `?`/`/`
- [ggandor/lightspeed.nvim](https://github.com/ggandor/lightspeed.nvim) Easymotion plugin. Substitut für `/`, `?`, `gg`, `f`, etc.
- [kyazdani42/nvim-tree.lua](https://github.com/kyazdani42/nvim-tree.lua) Nerdtree alternative

#### Comments

- [terrortylor/nvim-comment](https://github.com/terrortylor/nvim-comment) Toggle Comments
- [winston0410/commented.nvim](https://github.com/winston0410/commented.nvim) Toggle Comments
- [folke/todo-comments.nvim](https://github.com/folke/todo-comments.nvim) Markiert TODO/etc. Kommentare

#### Coremechanik Erweiterungen

- [gelguy/wilder.nvim](https://github.com/gelguy/wilder.nvim) Erweitert das wildmenu von Neovim: Vorschläge beim tippen von : und /.
- [blackCauldron7/surround.nvim](https://github.com/blackCauldron7/surround.nvim) Surround in lua - Nicht feature-complete zu tpope

#### Code Format

- [neomake/neomake](https://github.com/neomake/neomake) Async linter
- [dense-analysis/ale](https://github.com/dense-analysis/ale) Async linter
- [mfussenegger/nvim-lint/](https://github.com/mfussenegger/nvim-lint/) Linter <3
- [mhartington/formatter.nvim](https://github.com/mhartington/formatter.nvim)
- [sbdchd/neoformat](https://github.com/sbdchd/neoformat) Autoformatter für diverse Sprachen mit einer Menge voreingestellter Formatter. Kein Lua.

#### Git

- [lewis6991/gitsigns.nvim](https://github.com/lewis6991/gitsigns.nvim) Gitsigns
- [rhysd/committia.vim](https://github.com/rhysd/committia.vim) Besseres Commit-Fenster für Shell `git commit`
- [sindrets/diffview.nvim](https://github.com/sindrets/diffview.nvim) Diff-View für git-rev und FileHistory
- [kdheepak/lazygit.nvim](https://github.com/kdheepak/lazygit.nvim) Wrapper für [lazygit](https://github.com/jesseduffield/lazygit)
- [tanvirtin/vgit.nvim](https://github.com/tanvirtin/vgit.nvim) visuelles Git Plugin
- [TimUntersberger/neogit](https://github.com/TimUntersberger/neogit) magit clone für Neovim

#### Anderes

- [LinArcX/telescope-command-palette.nvim](https://github.com/LinArcX/telescope-command-palette.nvim) Telescope driven Commands
- [kevinhwang91/nvim-hlslens](https://github.com/kevinhwang91/nvim-hlslens) highlight searches/virtual text
- [kristijanhusak/vim-dadbod-ui](https://github.com/kristijanhusak/vim-dadbod-ui) DB Ui für relationale DBs.
- [stevearc/qf_helper.nvim](https://github.com/stevearc/qf_helper.nvim) Synchronisiert Quick-/Loclist location mit cursor position. Gleiche Keys für beide Listen
- [NTBBloodbath/rest.nvim](https://github.com/NTBBloodbath/rest.nvim) REST Client (Alternative: HTTPie wrappen?)
- [gennaro-tedesco/nvim-peekup](https://github.com/gennaro-tedesco/nvim-peekup) Floating Fenster mit Registern
- [oberblastmeister/neuron.nvim](https://github.com/oberblastmeister/neuron.nvim) Note Taking Ansatz
- [nvim-orgmode/orgmode](https://github.com/nvim-orgmode/orgmode) org-mode für neovim
- [nvim-neorg/neorg](https://github.com/nvim-neorg/neorg) Alternativer Note Taking Ansatz
- [hrsh7th/vim-minx](https://github.com/hrsh7th/vim-minx) ?

### Eye-Candy

- [petertriho/nvim-scrollbar](https://github.com/petertriho/nvim-scrollbar) Scrollbar mit zusätzlichen Hints
- [glepnir/galaxyline.nvim](https://github.com/glepnir/galaxyline.nvim) Statusline in LUA
- [beauwilliams/focus.nvim](https://github.com/beauwilliams/focus.nvim) Auto-Resize für fokussierte Splits
- [p00f/nvim-ts-rainbow](https://github.com/p00f/nvim-ts-rainbow) Regenbogen Klammern
- [xiyaowong/nvim-transparent](https://github.com/xiyaowong/nvim-transparent) Rm Hintergrund für Transparentes Nvim
- [winston0410/range-highlight.nvim](https://github.com/winston0410/range-highlight.nvim) Highlight für ranges die z.Bsp. via :12,16 mitgegeben werden
- [norcalli/nvim-colorizer.lua](https://github.com/norcalli/nvim-colorizer.lua) Farbencodes einfärben. z.Bsp `#F00` oder `red` in rot
- [kyazdani42/nvim-web-devicons](https://github.com/kyazdani42/nvim-web-devicons) Icons für zahlreiche Plugins

#### Allgemein

- [mbbill/undotree](https://github.com/mbbill/undotree) Undotree
- [windwp/nvim-autopairs](https://github.com/windwp/nvim-autopairs) Autopairing für Brackets
- [is0n/jaq-nvim](https://github.com/is0n/jaq-nvim) Just Another Quickrun Plugin. Run stuff
- [kevinhwang91/nvim-bqf](https://github.com/kevinhwang91/nvim-bqf) Beautiful quickfix window
- [rcarriga/nvim-notify](https://github.com/rcarriga/nvim-notify) Kleine Notification-Fenster die rechts oben schweben
- [noib3/nvim-cokeline](https://github.com/noib3/nvim-cokeline) Bufferline für Buffer, Tabs, etc. Evtl mit Alternativen vergleichen.

#### Themes

- [rmehri01/onenord.nvim](https://github.com/rmehri01/onenord.nvim)
- [shaeinst/roshnivim-cs](https://github.com/shaeinst/roshnivim-cs) Kontrastreich [Bild](https://raw.githubusercontent.com/shaeinst/media/main/images/github-repositories/roshnivim/python_lsp.png)
- [folke/twilight.nvim](https://github.com/folke/twilight.nvim) Treesitter Theme [Bild](https://user-images.githubusercontent.com/292349/125419804-051321c2-d040-41c8-93fc-834b5f1098e3.png)
- [Mangeshrex/uwu.vim](https://github.com/Mangeshrex/uwu.vim) Konstrastreiches Theme für (neo)vim. [Bild](https://raw.githubusercontent.com/Mangeshrex/uwu.vim/main/assets/uwu.png)
- [rose-pine/neovim](https://github.com/rose-pine/neovim) Rosepine. Pastell. [Bild](https://github.com/rose-pine/neovim/blob/main/assets/rose-pine-dawn.png?raw=true)
- [catppuccin/nvim](https://github.com/catppuccin/nvim) Pastell

### Sprachspezifisches

- [nvim-lua/lsp_extensions](https://github.com/nvim-lua/lsp_extensions.nvim) Zusätzliche LSP-Hilfe bei Rust und Dart

#### Typescript

- [jose-elias-alvarez/nvim-lsp-ts-utils](https://github.com/jose-elias-alvarez/nvim-lsp-ts-utils) TS LSP helper

#### Rust

- [simrat39/rust-tools.nvim/](https://github.com/simrat39/rust-tools.nvim/)

#### PHP

- [phpactor/phpactor](https://github.com/phpactor/phpactor)
