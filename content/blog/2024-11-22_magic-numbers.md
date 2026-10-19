+++
title = "Magic Numbers"
date = "2024-11-22T10:00:00Z"
updated = "2024-11-24T10:52:23Z"
description = "Magic Numbers sind Zahlen oder String-Literale, die als Konstanten eingesetzt werden, ohne dass ihre Bedeutung auf den ersten Blick erkennbar ist."
draft = false

[taxonomies]
tags = ["clean-code"]
+++

Magic Numbers sind Zahlen oder String-Literale, die als Konstanten eingesetzt werden, ohne dass ihre eigentliche Bedeutung direkt erkennbar ist.

Dieser Artikel ist Teil einer Serie, die ich für die Arbeit schreibe, gedacht für Junior-Entwickler und externe Mitarbeiter.
Wenn der Code generisch genug ist, verwende ich echte Beispiele aus der Praxis, ansonsten erfinde ich etwas ;).

Die Beispiele sind in TypeScript, da es von fast allen Entwicklern lesbar ist, die Konzepte gelten aber natürlich auch in anderen Sprachen. Python hat zum Beispiel keine echten „Konstanten“, aber man kann reines UPPERCASE mit `typing.Final` kombinieren:

```python
from typing import Final

MAX_KNOWN_POWER_SIZE: Final[int] = 9000
```
Das verhindert keine Neuzuweisung zur Laufzeit, aber [ruff](https://astral.sh/ruff) oder [mypy](https://www.mypy-lang.org) werden sich beschweren.


## Beispiele

### HTTP-Status-Codes

```typescript
// FALSCH
if (error.response.status === 409) {
    ...
}

// RICHTIG
import { HttpStatus } from '@nestjs/common';

if (error.response.status === HttpStatus.CONFLICT) {
    ...
}
```

Selbst wenn wir nicht alle HTTP-Status-Codes auswendig kennen, wissen wir jetzt, dass hier ein Konflikt vorliegt, ganz ohne Kommentare oder zusätzliche Komplexität.


### Timeout
```typescript
// FALSCH
setTimeout(() => {
    refreshData();
}, 300000); // Was bedeutet diese Zahl?

// RICHTIG
const REFRESH_INTERVAL_MS = 300000; // 5 Minuten in Millisekunden
setTimeout(() => {
    refreshData();
}, REFRESH_INTERVAL_MS);
```


### Limits: Geschäftslogik
```typescript
// FALSCH
if (user.age >= 18 && cart.total >= 50) {
    applyDiscount(cart);
}

// RICHTIG
const MINIMUM_AGE_FOR_DISCOUNT = 18;
const MINIMUM_PURCHASE_FOR_DISCOUNT = 50;

if (user.age >= MINIMUM_AGE_FOR_DISCOUNT &&
    cart.total >= MINIMUM_PURCHASE_FOR_DISCOUNT) {
    applyDiscount(cart);
}
```


### Limits: Passwort
```typescript
// FALSCH
if (password.length < 8 || password.length > 128) {
    throw new Error('Invalid password length');
}

// RICHTIG
const PASSWORD_LENGTH_MIN = 8;
const PASSWORD_LENGTH_MAX = 128;

if (password.length < PASSWORD_LENGTH_MIN ||
    password.length > PASSWORD_LENGTH_MAX) {
    throw new Error('Invalid password length');
}
```
