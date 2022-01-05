- ✔️ Vorstellung / Aufbau
- ✔️ Quicktips-Sammlung
- ✔️ Codesmells
- ✔️ SOLID
- **Diverses**
- Ausblick
- Fragen & Co


# Diverses


## Typing

- Bei nicht streng typisierten Sprachen wie JS/PHP/etc. immer typisieren!<!-- .element class="fragment" -->
- Javascript: Flow oder direkt Typescript/Dart<!-- .element class="fragment" -->
- PHP: Durch phpstan/psalm sicher stellen<!-- .element class="fragment" -->
- Python: mypy und typing<!-- .element class="fragment" -->
- <!-- .element class="fragment" -->Andere Sprachen lassen sich ergänzen `@NotNull/@Nullable`


## Simple Code/Solutions

- Simple is better than complex<!-- .element class="fragment" -->
- Schreibe so, dass auch die frischen JuniorDevs es verstehen<!-- .element class="fragment" -->


## Extrembeispiel

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

- Na? <span class="fragment">Email-Validierung nach <a href="https://www.ietf.org/rfc/rfc0822.txt?number=822">RFC822</a> :)</span>


## Besser

- Gibt es ein @ Zeichen mit anderen Zeichen davor/danach?<!-- .element class="fragment" -->
- Emailbestätigung einholen -> bessere Validierung gibt es nicht ;)<!-- .element class="fragment" -->


## Immutability

- Heißt: Unveränderbarkeit
- Vorteil: Deterministisch.


### Immutability: Java mit [commons-email](https://commons.apache.org/proper/commons-email/javadocs/api-release/index.html)

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


### Immutability: Java mit jcabi-email

```java
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
- Vorteil: Deterministisch.<!-- .element class="fragment" -->
- simpler zu erstellen, testen(!) und nutzen<!-- .element class="fragment" -->
- vermeidet temporal coupling<!-- .element class="fragment" -->
- viel einfacher zu cachen.<!-- .element class="fragment" -->
- Nutzung hat keine Sideeffects<!-- .element class="fragment" -->
- Testen macht kein Spaß? Liegt häufig an Mutability<!-- .element class="fragment" -->
- <!-- .element class="fragment" --><a src="https://www.howtobuildsoftware.com/index.php/how-do/DM3/java-object-immutability-atomicity-what-is-failure-atomicity-used-by-j-bloch-and-how-its-beneficial-in-terms-of-immutable-object">Bloch's "Failure atomicity"</a>
  - Objekte sollten bei "System failure" niemals "unfertig" sein <!-- .element class="fragment" -->


## Sideffects
- Was sind Sideffects?<!-- .element class="fragment" -->
- Verhindern/Erschweren Caching<!-- .element class="fragment" -->
- Verhindern/Erschweren Testing<!-- .element class="fragment" -->
- Pure Methods/Functions: Keine Seiteneffekte, nur abhängig vom Input, selber Input -> selber Output<!-- .element class="fragment" -->


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
- <!-- .element class="fragment" -->Ist nicht polymorph zu echten Objekten
  - <!-- .element class="fragment" -->Daher: NullPointerException/TypeErrors/etc.
- <!-- .element class="fragment" -->Unnötige checks <code>if (obj !== null) ...</code>
- <!-- .element class="fragment" -->Verletzt SinglePurpose Prinzip:
  - <!-- .element class="fragment" -->Null fungiert als fehlende/falsche/undefinierte/Fehler-Werte
- <!-- .element class="fragment" -->Ausnahmen: DBs, existierende APIs
- <!-- .element class="fragment" -->Sprache: "Echte" null safety haben nur Sprachen wie Dart(!), Rust, Haskell, etc.

Notiz:
- Hoare hat auch Quicksort oder das Hoare Kalkül zum "Beweisen" der Gültigkeit von Algorithmen entwickelt.


<p>und während andere damals schon den Fehler von <code>null</code> erkannten  ...</p>

<p class="fragment">... kam Javascript und baute direkt zwei <code>null-like</code> Konzepte ein</p>

```js 
if (myObject !== undefined and myObjects !== null) {
  // ...
}
```
<!-- .element class="fragment" -->


#### Typescript example: NullObject

Typescript nimmt uns zum Glück eine riesige Menge ab, aber:

```typescript
type Optional<T> = T | void;
```

Wenn wir nun mit einem Rückgabewert vom Typ Optional arbeiten,
werden wir "gezwungen" zu prüfen, ob das passt.


#### Typescript NullObject Helper
```typescript
function isDefined<T>(value: Optional<T>): value is T
{
  return value !== undefined && value !== null;
}
```

Methode zum checken ob ein Wert (z.Bsp. `Optional<int>`) gesetzt ist.


#### Typescript NullObject Helper
```typescript
function getOrDefault<T>(value: Optional<T>, defaultValue: T): T
{
  return isDefined(value) ? value : defaultValue;
}
```

Methode zum um sicher zu gehen, dass wir immer ein gültiges Objekt haben.


#### Typescript example: Hilfreiche Konfiguration
```javascript [2|4|5|6|7|8]
{
  "strict": true,
  // Aktiviert implizit auch:
  "noImplicitAny": true,    // Typing ;)
  "noImplicitThis": true,   // Orderntlich
  "alwaysStrict": true,     // Wir sparen uns "use strict"
  "strictNullChecks": true, // streng sein
}
```
und
```javascript
{ 
  "no-null-keyword": true,
  "no-any": true
}

```


## Dart

- Dart hat __sound null safety__: nutzt sie! :)
- Wenn sich ein "nullish" Object nicht verhindern lässt:

```dart
class Optional<T> {
  T|null value = null;
  Optional(this.value);
}
```


## Cyclomatic Complexity (McCabe Metrik)


durch Binärverzweigungen

$$ M = b + p, p > 1, b = z - 1$$

- b: Anzahl Binärverzweigungen 
- p: Anzahl Kontrollflußgraphen
- b = z - 1, wenn mehr als Zwei Zweige (Switch)



via Knoten/Kanten im Graph

$$ M = e - n + 2p$$

- e: Edges/Kanten
- n: Nodes/Knoten
- p: Zusammenhangskomponenten


<iframe src="https://giphy.com/embed/4JVTF9zR9BicshFAb7" width="480" height="345" frameBorder="0" />


#### Cyclomatic Complexity

```python
def name_von_wochentag(int nummer):
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

def name_von_wochentag(int nummer): 
  return TAGE.get(nummer, "unbekannt")
```

- Cyclomatic Complexity 1

Notiz:
**Unterschied:**

1. Du kannst zum Kühlschrank gehen und dir X nehmen oder zum Kühlschrank gehen und dir Y nehmen oder ...
2. Hier ist der Kühlschrank - nimm dir was, wenn du was findest


```python
def name_von_wochentag(int nummer):
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
TAGE = { """ ... """ }

def name_von_wochentag(int nummer): 
  if nummer == 4 and date.is_before_holiday():
    return "Kleiner Freitag"
  return TAGE.get(nummer, "unbekannt")
```
- Cyclomatic Complexity: 2
