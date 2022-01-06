+++
title = "Codesmells"
date = "2021-11-12"
updated = "2021-11-10T10:00:00Z"
description = "Kleine Hinweise auf verrottenden Code"
draft = true
+++

# Brainstorm
- if umfasst den gesamten method-body
- Magic Variables
- if Array empty else array.map/filter/etc
- feature flags: bool als Parameter
- Gott Klassen
- Kommentare
- Doppelte Code (auch teilweise)
- Deadcode
- Unnötige Verallgemeinerung
- (for loop)
- (switch)
- Finit Set String Arguments statt Enum
- Zu lange Methoden
- (Inpure Functions)
- Zu viele Parameter
- Primitive types: `age` als Int kann auf einmal -123 sein. Schlecht!
- Auf konkrete Implementierungen dependen
- Message chain: fn1 calls fn2 calls fn3 .... fnN
- Oddball solution: Multiple Varianten um das gleiche Problem zu lösen

# Coder-Smells
- Emotional verbunden mit Code
- Copy/paste ohne zu verstehen
- Alles von Hand machen


