- ✔️  Quicktips
- ✔️  Codesmells
- ✔️  SOLID
- **Various stuff**
- Looking Forward
- Questions


# Various stuff


## Typing

- <!-- .element class="fragment" -->Always type on non-typed languages
- <!-- .element class="fragment" -->Javascript: Flow or Typescript/Dart
- <!-- .element class="fragment" -->PHP: use phpstand/psalm
- <!-- .element class="fragment" -->python: mypy/pyright and typing (pydantic!)
- <!-- .element class="fragment" -->Other: `@NotNull/@Nullable` (e.g. Java)


## Simple Code/Solutions

- <!-- .element class="fragment" -->Simple is better than complex
- <!-- .element class="fragment" -->Write always like the fresh junior dev needs to maintain your code. Right now. Without introduction


## Extreme example

```perl
/(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t]
)+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:
\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(
?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ 
\t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\0
31]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\
](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+
(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:
?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t]
...
".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?
(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".
\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:
\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\[
"()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])
*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])
+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\
.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z
|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(
?:\r\n)?[ \t])*))*)?;\s*)/x
```

- ? <span class="fragment">Email-Validation for <a href="https://www.ietf.org/rfc/rfc0822.txt?number=822">RFC822</a> :)</span>


## Better

- <!-- .element class="fragment" -->Is there and @ with character before/after it?
- <!-- .element class="fragment" -->Get Email validation link: easier validation not possible ;)


## Immutability

Advantage: Deterministic!


### Example: Java with [commons-email](https://commons.apache.org/proper/commons-email/javadocs/api-release/index.html)

```java
Email email = new SimpleEmail();
email.setHostName("smtp.googlemail.com");
email.setSmtpPort(465);
email.setAuthenticator(new DefaultAuthenticator("user", "pwd"));
email.setFrom("yegor256@gmail.com", "Yegor Bugayenko");
email.addTo("dude@jcabi.com");
email.setSubject("how are you?");
email.setMsg("Dude, how are you?");
email.send();
```

Notiz:
Tatsächliches problem in der Email Klasse:
- [ca. 2000 Zeilen Script](https://commons.apache.org/proper/commons-email/apidocs/src-html/org/apache/commons/mail/Email.html)
  mit dutzenden Methoden/Properties.
- Auch als Nutzer nehmen wir eher einen "Builder"


### Immutability: Java with jcabi-email

```java [|1-3|4,13|5-9|10-12|14]
Postman postman = new Postman.Default(
  new SMTP("smtp.googlemail.com", 465, "user", "pwd")
);
Envelope envelope = new Envelope.MIME(
  new Array<Stamp>(
    new StSender("Yegor Bugayenko <yegor256@gmail.com>"),
    new StRecipient("dude@jcabi.com"),
    new StSubject("how are you?")
  ),
  new Array<Enclosure>(
    new EnPlain("Dude, how are you?")
  )
);
postman.send(envelope);
```


#### Immutability
- Deterministic<!-- .element class="fragment" -->
- Easier to create, test and use<!-- .element class="fragment" -->
- Mitigates temporal coupling<!-- .element class="fragment" -->
- FAR easier to cache<!-- .element class="fragment" -->
- Not side effects!<!-- .element class="fragment" -->
- Testing is annoying: common reason is mutability<!-- .element class="fragment" -->
- <!-- .element class="fragment" --><a src="https://www.howtobuildsoftware.com/index.php/how-do/DM3/java-object-immutability-atomicity-what-is-failure-atomicity-used-by-j-bloch-and-how-its-beneficial-in-terms-of-immutable-object">Bloch's "Failure atomicity"</a>
  - Means: objects shall never be "unfinished" on system failure 


## Sideffects
- ?<!-- .element class="fragment" -->
- Mitigate/Complicate caching<!-- .element class="fragment" -->
- Mitigate/Complicate testing<!-- .element class="fragment" -->
- <!-- .element class="fragment" -->Pure Methods/Functions: No sideeffects, only depend on input
  - same input: same output!
  - <!-- .element class="fragment" -->also means: complex calculations can be replaced by a lookup table!


### ❌ Sideeffects: Random
```java
public static int randomAdd(int number) {
  Random random = new Random();
  return first + random.nextInt(100);
}
```


### ❌ Sideeffects: DB
```java
public static User findUser(int socialId) {
  var row = this.userRepo.findOneBySocialId(socialId);
  if (row == null) {
    return new AnonymousUser();
  }
  return User.fromRow(row)
}
```


### ✔️  No Sideeffects:  Pure Method
```java [1-3,5-8]
public static int add(int first, int second) {
  return first + second;
}

// less trivial: We provide the random number
public static int randomAdd(int number, int randomized) {
  return first + randomized;
}
```


## Never\* use `null`
- <!-- .element class="fragment" -->"I call it my billion-dollar mistake" - Tony Hoare
- <!-- .element class="fragment" -->Is not polymorph to actual objects
  - <!-- .element class="fragment" -->This is the reason for: NullPointerException/TypeErrors/etc.
- <!-- .element class="fragment" -->Unnecessary checks <code>if obj is not None:...</code>
- <!-- .element class="fragment" -->Violates SinglePurpose Prinzip:
  - <!-- .element class="fragment" -->Null is used as an indicator for missing/false/undefined/error-values
- <!-- .element class="fragment" -->Exceptions: DBs, existing APIs
- <!-- .element class="fragment" -->Languages: "True" null safety only in langs like dart, rust, haskell

Notiz:
- Hoare hat auch Quicksort oder das Hoare Kalkül zum "Beweisen" der Gültigkeit von Algorithmen entwickelt.


<p>And while the world already knew about the error of <code>null</code> ...</p>

<p class="fragment">... there was javascript and built in two <code>null-like</code> concepts</p>

```js 
if (myObject !== undefined and myObjects !== null) {
  // ...
}
```
<!-- .element class="fragment" -->


#### Typescript example: NullObject

Typescript can do a lot, but:

```typescript
type Optional<T> = T | void;
```

We still have void, but typescript now forces us to check if we have T or void/null. In TS we should set: `strict, noImplicitAny, noImplicitThis, alwaysStrict, strictNullChecks, no-null-keyword, no-any` to `true`


## Cyclomatic Complexity (McCabe Metrik)


with binary branches

$$ M = b + p, p > 1, b = z - 1$$

- b: Number of binary branches 
- p: Number of control flow graphs
- b = z - 1, if more than two branches (switch)


with nodes/edges in graph

$$ M = e - n + 2p$$

- e: Edges
- n: Nodes
- p: components



<iframe src="https://giphy.com/embed/4JVTF9zR9BicshFAb7" width="480" height="345" frameBorder="0" />


#### Cyclomatic Complexity

```python
def name_von_wochentag(nummer):
  if nummer == 1: return "Montag"
  elif nummer == 2: return "Dienstag"
  elif nummer == 3: return "Mittwoch"
  elif nummer == 4: return "Donnerstag"
  elif nummer == 5: return "Freitag"
  elif nummer == 6: return "Samstag"
  elif nummer == 7: return "Sonntag"
  else: return "unbekannt"
```

- Cyclomatic Complexity: 8


```python
TAGE = {
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
  7: "Sonntag",
}

def name_von_wochentag(nummer): 
  return TAGE.get(nummer, "unbekannt")
```

- Cyclomatic Complexity 1

Notiz:
**Unterschied:**

1. Du kannst zum Kühlschrank gehen und dir X nehmen oder zum Kühlschrank gehen und dir Y nehmen oder ...
2. Hier ist der Kühlschrank - nimm dir was, wenn du was findest


```python
def name_von_wochentag(nummer):
  if nummer == 1: return "Montag"
  elif nummer == 2: return "Dienstag"
  elif nummer == 3: return "Mittwoch"
  elif nummer == 4:
    if date.is_before_holiday():
      return "Kleiner Freitag"
    return "Donnerstag"
  elif nummer == 5: return "Freitag"
  elif nummer == 6: return "Samstag"
  elif nummer == 7: return "Sonntag"
  return "unbekannt"
```
- Cyclomatic Complexity: 9


```python
DAYS = dict(1: "Monday", ...)

def name_von_wochentag(nummer): 
  if nummer == 4 and date.is_before_holiday():
    return "Kleiner Freitag"
  return DAYS.get(nummer, "unbekannt")
```
- Cyclomatic Complexity: 2
