+++
title = "Immutability / Const vs Let"
date = "2024-12-06T09:34:00Z"
updated = "2024-12-18T07:34:00Z"
description = "I will teach you about how useful immutability is and how to leverage it in typescript."
+++

## tl;dr

- Use const over let
- Make your variables immutable as often as possible

I will teach you about how useful immutability is and how to leverage it in typescript (but similar concepts apply to other languages as well).

## What is immutability?

Basically the name describes it already: Making stuff immutable: Not changeable. In typescript all basic datatypes are immutable!

**So when you do:**

```typescript
let a = 5;
let b = a;
a = 123;
// 5 still exists in memory

b = 42;
// 5 will be garbage collected soon
```

Just as a hint to future content: immutability is a major part in functional programming ;).
To dive deeper into (im)mutability let's start with an example:

```typescript
let helloWorldString = "Hello World!"; // immutable
helloWorldString = "Hello Moon!"; // no error, but var name no longer correct!

// vs:

const helloWorldString = "Hello World!"; // immutable
helloWorldString = "Hello Moon!"; // error! We can rely on the content of the var!
```

In the top part the stuff inside the variable changes and makes it harder
to predict whats inside it.

> "But what about counter variables? I NEED to count stuff all the time!?"

Correct. Let's break this up a little:

**The guideline is:**

- avoid mutable variables **when possible**
- if mutable variables improve readability or are the only viable
  way (very seldom): **go for it**

When I say "seldom" I mean, that in many cases Type/Javascript will give us
a way to avoid counter variables:

```typescript
let uppercaseNames = [];
for (let name of ["alice", "bob", "charlie"]) {
  uppercaseNames.push(name.toUpperCase());
}

// Functional approach
const uppercaseNames = ["alice", "bob", "charlie"].map((name) =>
  name.toUpperCase(),
);
```

Obviously this example is trivial, but in any way: We KNOW, that `uppercaseNames`
will contain exactly what it tells us, as soon as it's defined!

## Why

Immutability doesn't mean all the way and also doesn't mean that mutable stuff is
inherently bad, but it definetely removes some foodguns, when programming and debugging.

[Biome](https://biomejs.dev) has a lint `lint/style/useConst` forcing us to use `const`
when a variable is never reassigned, but I'd go further and replace `let`s as often as
possible by `const`.

**Imagine the following:**

```typescript
const mutateVar = (innerA) => {
  innerA = 9;
  return 12;
};

let outerA = 123;
const result = mutateVar(outerA);
// no change due to pass-by-value for elemental types
console.log({ result, outerA });

// But:
const mutateObj = (obj) => {
  // sideeffect we don't know about when reading function name:
  obj.x = 123;
  return obj;
};

const originalObject = { a: 42 };
const mutatedObject = mutateObj(originalObject);
console.log({ originalObject, mutatedObject });
```

We expect `originalObject` to be still the same and `mutatedObject` to
contain the new value. If we try to remember to not change existing objects
and also use `const` we will never be surprised by behaviour **inside** a function.

Functions which don't mutate parameters and are solely depending on parameters
are called **pure functions**. A concept which has various advantages over
**unpure** functions. But I'll go into that in the next article.

## But const objects ARE immutable

Right. They are. Especially because of javascript, but other languages like
python/php/etc. have similar problems. Fortunately with typescript we have
powerful tools at our hands: `Readonly`, `readonly` and `as const`.

```typescript
// Readonly
type Tree = { name: string };
const ahorn: Readonly<Tree> = { name: "ahorn" };
ahorn.name = "bhorn"; // typescript error

// As const
const ahorn = { name: "ahorn" } as const;
ahorn.name = "bhorn"; // typescript error

// readonly
class Tree {
  constructor(readonly name: string) {}
}

const t = new Tree("ahorn");
t.name = "asdf"; // typescript error
```

## What about string builders

I personally prefer:

1. extracting the process of building a string into a function
2. having a template in the and where the various bits and pieces fit into

And then use the result:

```typescript
/** Approach of most people */
function greetCustomer(customer) {
  let message = "";
  if (customer.age > 15) {
    message += "Good day sir,\n";
  } else {
    message += "Hey little one,\n";
  }

  if (customer.hasEaten) {
    message += "Can I offer you something to drink?";
  } else {
    message += "Can I offer you our lunch menu?";
  }

  console.log(message);
}

// vs what I prefer
function buildGreeting(customer): string {
  const greet = customer.age > 15 ? "Good day sir" : "Hey little one";
  const offer = customer.hasEaten ? "something to drink" : "our lunch menu";
  return `${greet},\nCan I offer you ${offer}?`;
}

function greetCustomer(customer) {
  const greeting = buildGreeting(customer);
  console.log(greeting);
}
```

I think this is better as it

- reduces the complexity making it more visible how the final text is structured.
- reduces indentation. Another topic I'd like to cover soon!
- We extracted the logic into a pure function while having the sideffect function only using this
- That again makes the `buildGreeting` function easier to test as we don't rely
  on catching console output
