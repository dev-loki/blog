+++
title = "Magic Numbers"
date = "2024-11-22T10:00:00Z"
updated = "2024-11-24T10:52:23Z"
description = "Magic numbers are numbers/string literals which are used as const and where the actual use is not directly known."
draft = false
+++

This is part of a series I do for work and is intended for juniors developers and external people.
When the code is generic enough I use real life examples from work, otherwise I'll just invent something ;).

The examples are in typescript as it is readable by almost all developers, but obviously the concepts are similar in other languages. Python for examples doesn't really have "constants", but you can combine pure UPPERCASE with `typing.Final`:

```python
from typing import Final

MAX_KNOWN_POWER_SIZE: Final[int] = 9000
```
This won't catch resetting the variable in runtime, but will complain when run with [ruff](https://astral.sh/ruff) or [mypy](https://www.mypy-lang.org).


## Magic Numbers

Magic numbers are numbers/string literals which are used as const and where the actual use is not directly known.  


## Examples


### HTTP Status Codes

```typescript
// DONT
if (error.response.status === 409) {
    ...
}

// DO
import { HttpStatus } from '@nestjs/common';

if (error.response.status === HttpStatus.CONFLICT) {
    ...
}
``` 

Now even if we don't know all the http status codes by heart, we now we have some kind of conflict error without adding comments/complexity  

## Timeout

```typescript
// DONT
setTimeout(() => {
    refreshData();
}, 300000); // What does this number mean?

// DO
const REFRESH_INTERVAL_MS = 300000; // 5 minutes in milliseconds
setTimeout(() => {
    refreshData();
}, REFRESH_INTERVAL_MS);
```


## Limits: business logic

```typescript
// DONT
if (user.age >= 18 && cart.total >= 50) {
    applyDiscount(cart);
}

// DO
const MINIMUM_AGE_FOR_DISCOUNT = 18;
const MINIMUM_PURCHASE_FOR_DISCOUNT = 50;

if (user.age >= MINIMUM_AGE_FOR_DISCOUNT && 
    cart.total >= MINIMUM_PURCHASE_FOR_DISCOUNT) {
    applyDiscount(cart);
}
```


## Limits: password

```typescript
// DONT
if (password.length < 8 || password.length > 128) {
    throw new Error('Invalid password length');
}

// DO
const PASSWORD_LENGTH_MIN = 8;
const PASSWORD_LENGTH_MAX = 128;

if (password.length < PASSWORD_LENGTH_MIN || 
    password.length > PASSWORD_LENGTH_MAX) {
    throw new Error('Invalid password length');
}
```

