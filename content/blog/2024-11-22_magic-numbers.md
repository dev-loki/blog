+++
title = "Magic Numbers"
date = "2024-11-22T10:00:00Z"
updated = "2024-11-22T10:00:00Z"
description = "Magic numbers are numbers/string literals which are used as const and where the actual use is not directly known."
draft = false
+++

This is part of a series I do for work and is intended for juniors developers and external people.
When the code is generic enough I use real life examples. 


## Magic Numbers

Magic numbers are numbers/string literals which are used as const and where the actual use is not directly known.  


### DONTs

```typescript
if (error.response.status === 409) {
    ...
}
```

### DOs

```typescript
import { HttpStatus } from '@nestjs/common';

if (error.response.status === HttpStatus.CONFLICT) {
    ...
}
``` 

Now even if we don't know all the http status codes by heart, we now we have some kind of conflict error without adding comments/complexity  

### DONTs

```typescript
const keys = Object.keys(feeProperty);
if (keys.length === 1 && keys[0] === '999999') {
      return { '1': feeProperty['999999'] };
}
```

### DOs

```typescript
const MAX_PROPERTIES = '999999';
const propertyCounts = Object.keys(feeProperty);
if (propertyCounts.length === 1 && propertyCounts[0] === MAX_PROPERTIES) {
    return { '1': feeProperty[MAX_PROPERTIES] };
}
```

Besides the fact that I introduced this monstrosity a while ago, this is a great example of _"WTF is this code doing?"_.
Obviously the code is still not "good" as it hides its intention, but at least we know that `999999` is some kind of sentinel value marking the maximum amount of properties.

