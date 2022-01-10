+++
title = "Neovim-Config-Part 2: Vanilla Config"
date = "2022-01-08"
updated = "2022-01-08T21:00:00Z"
description = "Vanilla config - ohne Plugins und co"
draft = true
+++

In diesem Teil gibt es im wesentlichen 2 Dinge zu tun:

1. Git Repo + Gnu Stow einrichten
2. init.lua mit base settings zusammenbauen

## Basic Stuff

`;` statt `:` für commands (nutzlose SHIFT Kombinationen vermeiden ;) ):

```lua
vim.api.nvim_set_keymap('n', ';', ':', {noremap = true})
vim.api.nvim_set_keymap('n', ':', ';', {noremap = true})
```

## Advanced mappings

Im visuellen Modus mit `v` markierte Zeilen nach oben/unten verschieben:

```lua
vim.api.nvim_set_keymap('v', '<down>', "<cmd>m '>+1<cr>gv=gv", {noremap = true})
vim.api.nvim_set_keymap('v', '<up>', "<cmd>m '<-2<cr>gv=gv", {noremap = true})
vim.api.nvim_set_keymap("i", "<down>", "<Esc>:m .-2<CR>==gi", {noremap = true})
vim.api.nvim_set_keymap("i", "<up>", "<Esc>:m .+1<CR>==gi", {noremap = true})
```

- `:m(ove)` verschiebt die Reihe
- `gv=gv` wählt den vorherigen visuellen Bereich wieder aus

## Sources

- https://www.youtube.com/watch?v=aHm36-na4-4
-
