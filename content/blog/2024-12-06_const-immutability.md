+++
title = "Immutability / Const vs Let"
date = "2024-12-06T09:34:00Z"
updated = "2024-12-18T07:34:00Z"
description = "Warum Immutability so nützlich ist und wie man sie in TypeScript gezielt einsetzt."

[taxonomies]
tags = ["typescript", "clean-code"]
+++

## tl;dr

- `const` bevorzugen statt `let`
- Variablen so oft wie möglich unveränderlich halten

Ich erkläre hier, warum Immutability so nützlich ist und wie man sie in TypeScript einsetzt, ähnliche Konzepte gelten aber auch in anderen Sprachen.

## Was ist Immutability?

Der Name beschreibt es eigentlich schon: Dinge unveränderlich machen. In TypeScript sind alle primitiven Datentypen bereits unveränderlich!

**Beispiel:**

```typescript
let a = 5;
let b = a;
a = 123;
// 5 existiert noch im Speicher

b = 42;
// 5 wird bald garbage collected
```

Kleiner Hinweis für zukünftige Inhalte: Immutability ist ein zentrales Konzept in der funktionalen Programmierung ;).

Tiefer einsteigen mit einem Beispiel:

```typescript
let helloWorldString = "Hello World!"; // unveränderlich
helloWorldString = "Hello Moon!"; // kein Fehler, aber der Variablenname stimmt nicht mehr!

// vs:

const helloWorldString = "Hello World!"; // unveränderlich
helloWorldString = "Hello Moon!"; // Fehler! Wir können uns auf den Inhalt verlassen!
```

Im oberen Beispiel ändert sich der Inhalt der Variable und es wird schwerer vorherzusagen, was drin steckt.

> „Aber was ist mit Zählervariablen? Ich muss doch ständig zählen!“

Richtig. Aufgedröselt:

**Die Faustregel lautet:**

- veränderliche Variablen **möglichst** vermeiden
- wenn veränderliche Variablen die Lesbarkeit verbessern oder die einzige sinnvolle Option sind (sehr selten): **dann verwenden**

Mit „selten“ meine ich, dass TypeScript/JavaScript uns in vielen Fällen einen Weg bietet, Zählervariablen zu vermeiden:

```typescript
let uppercaseNames = [];
for (let name of ["alice", "bob", "charlie"]) {
  uppercaseNames.push(name.toUpperCase());
}

// Funktionaler Ansatz
const uppercaseNames = ["alice", "bob", "charlie"].map((name) =>
  name.toUpperCase(),
);
```

Dieses Beispiel ist trivial, aber in jedem Fall: Wir WISSEN, dass `uppercaseNames` genau das enthält, was es sagt, sobald es definiert ist!

## Warum

Immutability bedeutet nicht, alles konsequent durchzuziehen, und veränderliche Variablen sind auch nicht per se schlecht, aber sie eliminieren einige Fehlerquellen beim Programmieren und Debuggen.

[Biome](https://biomejs.dev) hat einen Lint `lint/style/useConst`, der zwingt, `const` zu verwenden, wenn eine Variable nie neu zugewiesen wird. Ich würde aber noch einen Schritt weiter gehen und `let` so oft wie möglich durch `const` ersetzen.

**Folgendes Szenario:**

```typescript
const mutateVar = (innerA) => {
  innerA = 9;
  return 12;
};

let outerA = 123;
const result = mutateVar(outerA);
// keine Änderung, da elementare Typen per Wert übergeben werden
console.log({ result, outerA });

// Aber:
const mutateObj = (obj) => {
  // Seiteneffekt, den wir beim Lesen des Funktionsnamens nicht erwarten:
  obj.x = 123;
  return obj;
};

const originalObject = { a: 42 };
const mutatedObject = mutateObj(originalObject);
console.log({ originalObject, mutatedObject });
```

Wir erwarten, dass `originalObject` noch gleich ist und `mutatedObject` den neuen Wert enthält. Wenn wir uns angewöhnen, bestehende Objekte nicht zu verändern und `const` zu verwenden, werden wir nie von Verhalten **innerhalb** einer Funktion überrascht.

Funktionen, die Parameter nicht mutieren und ausschließlich von ihren Parametern abhängen, heißen **pure functions**. Ein Konzept mit vielen Vorteilen gegenüber **unreinen** Funktionen, dazu mehr im nächsten Artikel.

## Aber const-Objekte sind doch NICHT unveränderlich

Stimmt. Besonders wegen JavaScript. Glücklicherweise haben wir in TypeScript mächtige Werkzeuge: `Readonly`, `readonly` und `as const`.

```typescript
// Readonly
type Tree = { name: string };
const ahorn: Readonly<Tree> = { name: "ahorn" };
ahorn.name = "bhorn"; // TypeScript-Fehler

// As const
const ahorn = { name: "ahorn" } as const;
ahorn.name = "bhorn"; // TypeScript-Fehler

// readonly
class Tree {
  constructor(readonly name: string) {}
}

const t = new Tree("ahorn");
t.name = "asdf"; // TypeScript-Fehler
```

## Was ist mit String-Buildern?

Ich bevorzuge persönlich:

1. Den Aufbau eines Strings in eine Funktion auszulagern
2. Ein Template am Ende zu haben, in das die verschiedenen Teile einfließen

```typescript
/** Ansatz der meisten Leute */
function greetCustomer(customer) {
  let message = "";
  if (customer.age > 15) {
    message += "Guten Tag,\n";
  } else {
    message += "Hey,\n";
  }

  if (customer.hasEaten) {
    message += "Darf ich Ihnen etwas zu trinken anbieten?";
  } else {
    message += "Darf ich Ihnen unsere Mittagskarte zeigen?";
  }

  console.log(message);
}

// vs. mein Ansatz
function buildGreeting(customer): string {
  const greet = customer.age > 15 ? "Guten Tag" : "Hey";
  const offer = customer.hasEaten ? "etwas zu trinken" : "unsere Mittagskarte";
  return `${greet},\nDarf ich Ihnen ${offer} anbieten?`;
}

function greetCustomer(customer) {
  const greeting = buildGreeting(customer);
  console.log(greeting);
}
```

Das ist besser, weil es:

- die Komplexität reduziert und die Struktur des Endtextes klarer macht
- die Einrückungstiefe verringert, auch ein Thema für einen eigenen Artikel!
- die Logik in eine pure function auslagert, während die Funktion mit Seiteneffekten nur diese nutzt
- `buildGreeting` damit einfacher testbar macht, da wir nicht auf Console-Output angewiesen sind
