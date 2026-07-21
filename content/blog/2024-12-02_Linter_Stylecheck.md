+++
title = "Linter & Stylecheck"
date = "2024-12-02T09:00:00Z"
updated = "2024-12-03T06:32:23Z"
description = "Über den Sinn, Arbeit an Werkzeuge auszulagern und damit eine stabilere Codebasis zu erreichen"

[taxonomies]
tags = ["tooling", "clean-code"]
+++

## Stylecheck

Fangen wir mit dem einfacheren Thema an: Stylechecks. Im Kern geht es darum, den gleichen Stil über die gesamte Anwendung beizubehalten. Welcher Stil das ist, ist dabei gar nicht so wichtig: Hauptsache, er ist überall gleich!


#### Warum?

1. **Pattern-Matching:** Unabhängig vom Erfahrungsstand ist es einfacher, Muster zu erkennen, wenn sie immer gleich aufgebaut sind.
2. **Git-Diffs:** Unterschiedliche Stile führen zu einem ständigen Hin-und-Her in den Diffs, wenn verschiedene Styles aufeinandertreffen.
3. **Werkzeuge:** Ein Tool, das Code automatisch formatiert und Regeln direkt anwendet, spart enorm viel Zeit!


#### Tools

- [prettier](https://prettier.io) ist das bekanntere Werkzeug dafür
- Ich bevorzuge aber [biome](https://biomejs.dev/formatter), da es schneller ist und auch **Linting** übernehmen kann
    - Es ist zu 97 % kompatibel mit Prettier (gleiche Regeln), die Unterschiede [sind nachvollziehbar](https://github.com/biomejs/biome/blob/main/crates/biome_js_formatter/report.md)
    - Es kann formatieren: JavaScript, TypeScript, JSX, TSX, JSON, CSS und GraphQL


#### Beispiele

- **Trivial**: einheitliche Anführungszeichen `'` vs `"` oder konsistente Einrückung
- **Lesbarkeit**: Lange Import-Zeilen auf mehrere Zeilen aufteilen


###### Trivial: Leerzeichen

```typescript
// VORHER
@Injectable()
export class JwtService {
    
    decodeToken (token: string): any {
        return jwt.decode(token);
    }
}

// NACHHER
@Injectable()
export class JwtService {
    decodeToken(token: string): any {
        return jwt.decode(token);
    }
}
```

oder Tabs vs. Spaces:

```typescript
// VORHER: 2 Spaces
describe('ReportsController', () => {
  let controller: ReportsController;

  beforeEach(async () => {

// NACHHER: Tabs
describe('ReportsController', () => {
	let controller: ReportsController;

	beforeEach(async () => {
```

\* Ich persönlich bevorzuge Spaces, aber **Konvention über Sympathie!**


###### Trivial: Zeilenumbrüche

```typescript
// VORHER
@Module({
  controllers: [IntegrationController],
  providers: [IntegrationService, PrismaService, ScrapingService, CustomerIoService, JwtService]
})

// NACHHER
@Module({
	controllers: [IntegrationController],
	providers: [
		IntegrationService,
		PrismaService,
		ScrapingService,
		CustomerIoService,
		JwtService,
	],
})
```

Es gibt auch den Analyzer, der Imports in einer vorhersehbaren Reihenfolge sortiert. Das ist optional, aber gibt jedem Datei-Header die gleiche Struktur. Details zur Reihenfolge gibt es [hier](https://biomejs.dev/analyzer/import-sorting/).


## Linting

Linting gibt uns einen Vorsprung, bevor Kunden Bugs finden. Jeder Linter hat natürlich eine kleine False-Positive-Rate, aber das Regelwerk schließt ganze Klassen von Fehlern aus, bevor sie überhaupt passieren!

Das vollständige Regelwerk von Biome findet sich [hier](https://biomejs.dev/linter/rules/).

Es hat triviale Checks wie [no distracting elements](https://biomejs.dev/linter/rules/no-distracting-elements/)
(verbietet [marquee](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/marquee) und [blink](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/blink)), aber auch deutlich fortgeschrittenere Regeln.

Meine Lieblingskategorie ist [nursery](https://biomejs.dev/linter/rules/#nursery), die veraltete JS-Features enthält, die durch modernere Syntax ersetzt wurden.

#### Linter-Warnungen: Beispiele

```typescript
// 1. no banned types
code-block.ts:1:10 lint/complexity/noBannedTypes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✖ Don't use '{}' as a type.
  > 1 │ const n: {} = 0
      │          ^^

// 2. complexity
code-block.js:1:10 lint/complexity/noExcessiveCognitiveComplexity ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚠ Excessive complexity of 21 detected (max: 15).
  > 1 │ function tooComplex() {
      │          ^^^^^^^^^^
    2 │     for (let x = 0; x < 10; x++) {
    3 │         for (let y = 0; y < 10; y++) {

// 3. for .. of  vs  Array.forEach
code-block.js:1:1 lint/complexity/noForEach ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✖ Prefer for…of instead of forEach.
  > 1 │ els.forEach((el) => {
      │ ^^^^^^^^^^^^^^^^^^^^^
  > 2 │   f(el);
  > 3 │ })
      │ ^^

// 4. no useless catch
code-block.js:4:5 lint/complexity/noUselessCatch ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✖ The catch clause that only rethrows the original error is useless.
    2 │     doSomething();
    3 │ } catch(e) {
  > 4 │     throw e;
      │     ^^^^^^^^

// 5. no useless ternary
const a = foo === 1 ? false : true; // einfach foo !== 1 schreiben

code-block.js:1:9 lint/complexity/noUselessTernary  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✖ Unnecessary use of boolean literals in conditional expression.
  > 1 │ const a = foo === 1 ? false : true;
      │           ^^^^^^^^^^^^^^^^^^^^^^^^
```

1. Trivial, aber wichtig: keine unnötigen/schädlichen Typen
2. Nutzt Cyclomatic Complexity als Obergrenze für komplexen Code. Zu komplex → vereinfachen. Mehr Details unter [McCabe Metrik](https://en.wikipedia.org/wiki/Cyclomatic_complexity). Wir sollten unter 10 bleiben (10 mögliche Datenpfade durch eine Funktion) und MÜSSEN unter 15 bleiben.
3. Sprachfeatures: `for .. of ..` ist leichter zu lesen als `Array.forEach(...)`. Auch ein Performance-Vorteil!
4. Quasi toter Code ohne Funktion
5. Ein schönes Beispiel für `FIXABLE`-Lints: Dieser wird automatisch korrigiert!

... Und noch vieles mehr! Linter sollten in jeder Phase des Entwicklungsprozesses eingesetzt werden. Je früher, desto besser.


## Biome im Editor

Für alle genannten Gründe sollten wir Biome überall einsetzen, wo es möglich ist.

Für die gängigsten Editoren hier die Extension/Plugin-Links, damit die roten Wellenlinien direkt verschwinden und Auto-Formatierung aktiv ist:

- **Allgemein und Vim/Emacs/etc.:** [biomejs.dev](https://biomejs.dev/guides/integrate-in-editor/#use-the-daemon-with-the-binary)
- **WebStorm:** [plugins.jetbrains.com](https://plugins.jetbrains.com/plugin/22761-biome)
- **VSCode:** [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- **CLI:**
    - `npm install --save-dev --save-exact @biomejs/biome`
    - Formatieren: `biome format ORDNER/DATEI` oder `biome format --write ORDNER/DATEI`
    - Linten: `biome lint ORDNER/DATEI` oder `biome lint --write ORDNER/DATEI`
    - Alle Checks (Format + Lint): `biome check ORDNER/DATEI`

Danach unbedingt:
1. Auto-Formatierung aktivieren
2. Die Linter-Fehler tatsächlich lesen und beheben
