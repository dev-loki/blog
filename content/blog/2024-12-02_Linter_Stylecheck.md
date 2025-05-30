+++
title = "Linters & Stylecheck"
date = "2024-12-02T09:00:00Z"
updated = "2024-12-03T06:32:23Z"
description = "About the essence of outsourcing work to tools and maintaining a more stable codebase"
+++

## Stylecheck

Let's start with the simpler issue: Stylechecks. Basically it all boils down to maintaining 
the same style over the full application. It doesn't really matter WHICH style, but it 
must be the same!


#### Why?

1. **Pattern matching:** Disregard of developer level it makes it easier to recognize patterns if
   they all are in the same structure
2. **Git Diffs:** Having multiple styles might result in a back-and-forth of changes each time
   different styles collide
3. **Tools:** Having a tool which can format your code and auto apply it's rules may help a lot!


#### Tools

- [prettier](https://prettier.io) is the more commonly known tool for this
- But I prefer [biome](https://biomejs.dev/formatter) as it is faster and can also take care of **linting**
    - It's also 97% compatible with pretter (same rules) - the differences [are reasonable](https://github.com/biomejs/biome/blob/main/crates/biome_js_formatter/report.md)
    - It can format: JavaScript, TypeScript, JSX, TSX, JSON, CSS and GraphQL


#### Examples

- **Trivial**: using the same kind of quote `'` vs `"` where applicable or the same amount of spaces
- **Readability**: Splitting multiple lines of import if the line gets too long


###### Trivial: Spacing

```typescript
// FROM
@Injectable()
export class JwtService {
    
    decodeToken (token: string): any {
        return jwt.decode(token);
    }
}

// TO
@Injectable()
export class JwtService {
    decodeToken(token: string): any {
        return jwt.decode(token);
    }
}
```

or tabs vs spaces

```typescript
// FROM 2 spaces
describe('ReportsController', () => {
  let controller: ReportsController;

  beforeEach(async () => {

// TO tabs
describe('ReportsController', () => {
	let controller: ReportsController;

	beforeEach(async () => {
```

\* Btw I'm a spaces guy, but **convention over sympathy!**


###### Trivial: Newlines

```typescript
// FROM
@Module({
  controllers: [IntegrationController],
  providers: [IntegrationService, PrismaService, ScrapingService, CustomerIoService, JwtService]
})

// TO
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

There is also the analyzer which sorts imports in a predictable manner. This is optional,
but gives each header of a file the same order. For details about the order you can look 
[here](https://biomejs.dev/analyzer/import-sorting/).


## Linting

This is actually giving us a headstart on customers finding bugs. Each linter obviously has a small
false positive rate, but the ruleset itself makes sure to exclude some classes of errors before they
even happen!

The full ruleset of biome is [here](https://biomejs.dev/linter/rules/).

It has some very trivial checks like [no distracting elements](https://biomejs.dev/linter/rules/no-distracting-elements/)
which prohibits [marquee](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/marquee) and [blink](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/blink), but also far more advanced checks.

My favorite category is [nursery](https://biomejs.dev/linter/rules/#nursery) which contains legacy 
JS features which are surpassed by advanced Syntax.

#### Linter warnings examples

```typescript
// 1. no banned types
code-block.ts:1:10 lint/complexity/noBannedTypes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✖ Don’t use ’{}’ as a type.
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

// 5. no uselss ternary
const a = foo === 1 ? false : true; // just use foo !== 1

code-block.js:1:9 lint/complexity/noUselessTernary  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✖ Unnecessary use of boolean literals in conditional expression.
  > 1 │ const a = foo === 1 ? false : true;
      │           ^^^^^^^^^^^^^^^^^^^^^^^^
```

1. Is trivial, but don't use useless/harmful types
2. Is using the Cyclomatic Complexity to give upper boundaries of complex code. Is code too complex -> make it simpler. Google for [McCabe Metric](https://en.wikipedia.org/wiki/Cyclomatic_complexity) too find more details.
   Depending on the language we should try to be <10 (10 possible ways of data routes through a function) 
   and MUST be below 15, as this would be hard to maintain.
3. Language features: `for .. of ..` is easier to read than `Array.forEach(...)`. Also a performance issue!
4. obviously almost dead code which doesn't serve any function/purpose
5. Is a great example of `FIXABLE` lints: This one can be auto corrected!

... Aaaaand a lot more! We should use linters at every stage of our development process. The earlier the better and we WILL be using themsoon in our processes. 


## Biome in your editor

For the huge amount of reasons we should use biome whereever possible.

For the most common editors here the extension/plugin so that you can benefit directly. Just make sure the red squiggly lines disappear and autoformatting is active

- **General and Vim/Emacs/etc.:** [biomejs.dev](https://biomejs.dev/guides/integrate-in-editor/#use-the-daemon-with-the-binary)
- **webstorm:** [plugins.jetbrains.com](https://plugins.jetbrains.com/plugin/22761-biome)
- **VSCode:** [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- **CLI:**
    - `npm install --save-dev --save-exact @biomejs/biome`
    - Format: `biome format FOLDER/FILE` or `biome format --write FOLDER/FILE`
    - Lint: `biome lint FOLDER/FILE` or `biome lint --write FOLDER/FILE`
    - All checks (format and lint): `biome check FOLDER/FILE`

Afterwards be sure to:
1. Set autoformat on 
2. Actually read and see the errors supplied by the linter

