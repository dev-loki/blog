- ✔️ Vorstellung / Aufbau
- ✔️ Quicktips-Sammlung
- **Codesmells**
- SOLID
- Diverses
- Ausblick
- Fragen & Co


# Codesmells

Eigenheiten von Code, die schlechte Auswirkungen mit sich ziehen


#### ?

```rust [1-4|6-21]
const CUTE_COLOR = "yellow";
const MAX_CUTE_LEGS = 4;
const CUTE_SIZES: [&'static str; 3]= ["xsmall", "small", "gigantic"];
const CUTE_POKEMONS: [&'static str; 2] = ["Sandan", "Abra"];

fn is_cute_pokemon(Pokemon pokemon) -> bool {
  if (pokemon.color == CUTE_COLOR) {
    // Imagine logic here
    if (CUTE_SIZES.contains(pokemon.size)) {
      // some real complex cutenes calculations
      if (pokemon.legs <= MAX_CUTE_LEGS) {
        // some validation of leg count with colorcode
        if (CUTE_POKEMONS.contains(pokemon.name)) {
          return true;
        }
      }
    }
  }

  return false;
}
```

Notiz:
- Problem vorher erkennen lassen ;)


![](/images/pyramid-of-doom.png)


### Pyramid of Doom

```rust [2-16|2,4,6,8|3,5,7,9]
// ....
fn is_cute_pokemon(Pokemon pokemon) -> bool {
  if (pokemon.color == CUTE_COLOR) {
    // Imagine logic here
    if (CUTE_SIZES.contains(pokemon.size)) {
      // some real complex cutenes calculations
      if (pokemon.legs <= MAX_CUTE_LEGS) {
        // some validation of leg count with colorcode
        if (CUTE_POKEMONS.contains(pokemon.name)) {
          return true;
        }
      }
    }
  }

  return false;
}
```

Notiz:
Einfachster Lösungsansatz is `if` umzudrehen


#### PoD Solution

```rust [2]
fn is_cute_pokemon(Pokemon pokemon) -> bool {
  if (pokemon.color != CUTE_COLOR) { return false; }
  // Imagine logic here

  if (CUTE_SIZES.contains(pokemon.size)) {
    // some real complex cutenes calculations
    if (pokemon.legs <= MAX_CUTE_LEGS) {
      // some validation of leg count with colorcode
      if (CUTE_POKEMONS.contains(pokemon.name)) {
        return true;
      }
    }
  }

  return false;
}
```
reverse if


#### PoD Solution

```rust [5,8,11-15]
fn is_cute_pokemon(Pokemon pokemon) -> bool {
  if (pokemon.color != CUTE_COLOR) { return false; }
  // Imagine logic here

  if (!CUTE_SIZES.contains(pokemon.size)) { return false; }
  // some real complex cutenes calculations

  if (pokemon.legs > MAX_CUTE_LEGS) { return false; }
  // some validation of leg count with colorcode

  if (CUTE_POKEMONS.contains(pokemon.name)) {
    return true;
  } else {
    return false;
  }
}
```
auch die anderen ifs umdrehen


#### PoD Solution

```rust [11]
fn is_cute_pokemon(Pokemon pokemon) -> bool {
  if (pokemon.color != CUTE_COLOR) { return false; }
  // Imagine logic here

  if (!CUTE_SIZES.contains(pokemon.size)) { return false; }
  // some real complex cutenes calculations

  if (pokemon.legs > MAX_CUTE_LEGS) { return false; }
  // some validation of leg count with colorcode

  return CUTE_POKEMONS.contains(pokemon.name);
}
```

return statement direkt zurück geben<!-- .element style="font-size:small" -->


#### PoD Solution

```rust [2,5,8,11]
fn is_cute_pokemon(Pokemon pokemon) -> bool {
  if (pokemon.color != CUTE_COLOR) { false }
  // Imagine logic here

  if (!CUTE_SIZES.contains(pokemon.size)) { false }
  // some real complex cutenes calculations

  if (pokemon.legs > MAX_CUTE_LEGS) { false }
  // some validation of leg count with colorcode

  CUTE_POKEMONS.contains(pokemon.name)
}
```

Weil es Rust ist, können wir sprachinterne Features nutzen :)


## Gott Klassen

(und Methoden)

```php [3-5]
<?php
/** Can also login and has customer representation */
class DoodatsManufacturerAndMerchant {
  // Do all the amazing things!
}
```

```php [2]
<?php
function downloadParseAndSafeAllTheStuff(url) { ... }
```

* Verletzen die "do one thing well" Regel<!-- .element class="fragment" -->
* Aber was ist die "richtige" Größe einer Klasse?<!-- .element class="fragment" -->

Notiz:
 - Geschmackssache?
 - Es gibt tatsächlich fundierte Meinungen, die bei mehr als 5 Zeilen schon ins Schwitzen kommen
 - Meiner Meinung nach hängt es sehr stark von der Sprache ab.
 - Eine reine Zeilenanzahl ist nicht zielführend
 - Eher Cyclomatic Complexity


#### Gott Klassen - Typische Beispiele

- Formatieren/Umwandeln der Daten eines Objects zusammen mit dem Object<!-- .element class="fragment" -->
- Komplexe Konstruktoren vs. Builder Pattern<!-- .element class="fragment" -->
- (ActiveRecord, ORM)¹<!-- .element class="fragment" -->

¹ Gründe gehen zu tief für heute ;)<!-- .element class="fragment" -->


#### Gott Klassen ❌

```python
class CryptoMarketManager:
  def fetch_crypto_data(self, crypto_market, coin): pass
  def buy(self, crypto_market, coin, amount): pass
  def sell(self, crypto_market, coin, amount): pass
  def news(self, coin, market_list): pass
  def min_max_avg(self, coin): pass
  def coin_volume(self, coin): pass
  def print_coin_table(self, coin_list, print_type='pdf'):
    pass
  def get_history_data(self, crypto_market, coin, date):
    pass
```

- hier ließen sich mindestens 3 Klassen erstellen<!-- .element class="fragment" -->

Notiz:
- Echte Beispiele würden der Natur des Problems geschuldet leider wirklich den Rahmen sprengen
- Hier eher bequatschen, was man auslagern könnte


## Duplicate Code

- Captain Obvious sagt: DRY!<!-- .element class="fragment" -->
- Alle relevanten IDEs könnten Code Bestandteile extrahieren<!-- .element class="fragment" -->
  - Z.Bsp durch "Extract Method" (
    [VSCode](https://code.visualstudio.com/docs/editor/refactoring#_extract-method),
    [Intellij](https://www.jetbrains.com/help/idea/find-and-replace-code-duplicates.html),
    [Neovim/Vim](https://github.com/ThePrimeagen/refactoring.nvim), etc.) 
- Codeanalyzer helfen. Z.Bsp.:<!-- .element class="fragment" -->
  - Python: <code style="background:#3f3f3f">pylint</code> mit <code style="background:#3f3f3f">--duplicate-code</code> flag.
  - PHP: <code style="background:#3f3f3f">phpcpd</code>
  - JS/Node/Dart/uvm.: [kucherenko/jscpd](https://github.com/kucherenko/jscpd)
- Bonuspunkte, wenn die CI/CD Pipeline das erkennt ;) <!-- .element class="fragment" -->


## Duplicate Code: Tips

- Trivial: Auslagern in Methoden im gleichen Scope<!-- .element class="fragment" -->
  - Statt Klassenhierarchie auf Mixins/Traits/etc. setzen -> kommt später<!-- .element class="fragment" -->
- Architekturboundaries beachten<!-- .element class="fragment" -->
  - Komplexeres Thema, besser eigener Talk über Architektur<!-- .element class="fragment" -->
- "Premature Generalization" beachten<!-- .element class="fragment" -->

Notiz:
- Beispiel benötigt, dann nachreichen?


## Auskommentierter Code


- In MergeRequests/PullRequests/etc: Just don't
- Git ist genau dafür da<!-- .element class="fragment" -->
- wird langsam zur "Lüge" im Code:<!-- .element class="fragment" -->
  - Umgebung ändert sich
  - Kommentare meist schon nicht mehr
  - Auskommentierter Code nie!
- Debugging, etc.? --> Debugger/etc.<!-- .element class="fragment" -->
  - Alternativ: Featureflags, wo es funktioniert
  - Nativ: C-Derivate, Rust, für viele andere Sprachen gibt es Libraries (z.Bsp ein Babel-Plugin für JS)


## Auskommentierter Code

❌ Dont<!-- .element class="fragment" data-fragment-index="1" -->
```c
/* // Debug Visualization: draw set of found interest points
for (int i=0; i<count; i++)
    DrawBox(pts[i].X, pts[i].Y, 5, 5);
*/
```

✔️  Do<!-- .element class="fragment" data-fragment-index="2" -->
```c
#ifdef DEBUG_VISUALIZATION
for (int i=0; i<count; i++) {
  DrawBox(pts[i].X, pts[i].Y, 5, 5);
}
#endif
```
<!-- .element class="fragment" data-fragment-index="2" -->


## Dead Code

- Erschwert oder verhindert sogar Refactorings<!-- .element class="fragment" -->
- Wird meist mitgewartet obwohl schon lange nutzlos<!-- .element class="fragment" -->
- Manchmal versteckt<!-- .element class="fragment" -->
- Anekdote ;)<!-- .element class="fragment" -->

Notiz:
- Versicherung X schickt Metadaten im diversen Formaten
  - XML/Soap eigen, Bipro, Btix, Filenames(!)
  - Einige Formate kamen seit Jahren nicht mehr vor (Relikte)
- Gelöschter Code hat auch keine Fehler ;)


## Dead Code

```js
// Argument never given
const ANCIENT_SYSTEM = 'Win98SE'
function doStuff(system, doItDifferently=false) {
  if (system.os === ANCIENT_SYSTEM) {
    somethinStrangeWhichNeverhappens();
    return;
  }
  if (system.os === 'WIN2050') {
    doWeirdStuffWhenTooNewSystemArrives();
  }

  normalFlow();
  andBehaviour();
}
```

- YAGNI<!-- .element class="fragment" -->
- Außerdem natürlich: False Flags<!-- .element class="fragment" -->


## Zu viele Parameter/Argumente

```python [1|3|5|7-8|10,11]
def calculate_costs(item): pass

def calculate_costs(item, bonus): pass

def calculate_costs(item, bonus, ahole_malus = None): pass

def calculate_costs(item, bonus, ahole_malus = None, 
                    loyal_bonus = None): pass

def calculate_costs(item, bonus, ahole_malus = None,
                    loyal_bonus = None, tax = 0.19): pass
```
- selten wird das "einfach so" gemacht!<!-- .element class="fragment" -->
- schleichender Prozess! "Mal eben schnell" ist der Feind!<!-- .element class="fragment" -->

Notiz:
- Ein typischer Fall für Strategy Pattern


#### Zu viele Argumente: Lösungsidee
```python [|3,4|6-9|11]
@dataclass
class PriceModifier:
  value: int
  absolute: bool

  def modify_price(self, price):
    if absolute:
      return price + value
    return return price + price * value

def calculate_costs(item, boni: List[PriceModifier]):
  # ... apply all the modifiers e.g. in a loop
  pass
```

Notiz:
 - Kotlin/Java haben dataclasses
 - PHP erst konsequent mit 8.0
 - JS/TS via Extension: [dataclass.js.org](https://dataclass.js.org)
   - Bessere Möglichkeit?
 - Dart: meh. Es gibt eine Extension für VSCode


#### Zu viele Argumente: Lösungsidee
```python [1-4|6-10|12]
# These taxes are build somehwere in a repository
tax = PriceModifier(value=False, 0.19)
ahole = PriceModifier(value=True, 0.1)
loyal_bonus = PriceModifier(value=False, 0.05)

modifiers = [tax]
if not customer.mostly_friendly():
  modifiers.append(ahole)
if customer.was_here_before():
  modifiers.append()
  
total_cost = calculate_costs('magic cards', modifiers)
```


## Property-Creep

```php
<?php
class Lead {
  private ?int $leadId;
  private ?string $firstName;
  private ?string $lastName;
  private ?string $customerStreet;
  private ?string $customerCity;
  //... (✂ ~10 lines)
  private ?string $insurerCity;
  private ?DateTimeInterface $birthDay;
  private ?DateTimeInterface $insuranceDateFrom;
  private ?DateTimeInterface $insuranceDateTo;
  //... (✂ ~50 lines)
  private ?string $insurerBafin;
  private $calculationParameters;
  // ... (✂ even more lines)
}
```

Notiz:
 - Typeannotations fehlen im Original sogar
 - Too freaking much
 - Schwer wartbar -> Viele gescheitert


## Property-Creep Lösungsansätze


- SubObjects
  - z.Bsp. Für **Insurer**, **CalculationParameters** oder **Customer**
- Vielleicht ein Fall von "God Object"?<!-- .element class="fragment" -->
- <!-- .element class="fragment" -->Bessere Datentypen die mehrere Parameter zusammenfassen
  - <!--- .element class="fragment" --> z.Bsp. für InsuranceDateFrom/To gibt es `DatePeriod` in PHP
  - <!-- .element class="fragment" --> Also auf die Standard-Library fürs eigene Sprachenökosystem achten!


## Global Scope

- <!-- .element class="fragment" -->Javascript/PHP historisch bedingt besonders anfällig durch Beispiele wie z.Bsp:
  - `$_GLOBAL` und `$_GET` (php)
  - `window.` und `document.` (javascript)
- <!-- .element class="fragment" -->Beispiel & einer der Gründe, warum Wordpress so unglaublich unbeliebt ist:
  - PHP Magic `$_GET['a']` wurde zu einer globalen Variable `$a`


#### Global Scope - Schlechtes Beispiel

```php [|4|10]
<?php
// a lot of stuff before and after
function _get_cron_lock() {
	global $wpdb;     // <--- 

	$value = 0;
	if (wp_using_ext_object_cache()) {
		$value = wp_cache_get('...', 'transient', true);
	} else {
		$row = $wpdb->get_row($wpdb->prepare("SELECT ...."));
		if (is_object($row)) {
			$value = $row->option_value;
		}
	}

	return $value;
}
```


#### Global Scope/state

- Warum ist das ein Problem?
  - <!-- .element class="fragment" -->Globaler State erschwert Testen/Wartbarkeit/Fehlersuche
  - <!-- .element class="fragment" -->(ihr seht vlt ein Pattern)
- <!-- .element class="fragment" -->Gibt es eine Alternative?
  - <!-- .element class="fragment" -->Dependencies mitgeben -> Constructor Injection

Notiz:
 - Singleton kann(!) als Versteck für Global State fungieren


## Temporal Coupling
- dickes Problem, da Fehler erst zur Laufzeit auffallen<!-- .element class="fragment" -->
- teilweise nur unter bestimmten Laufzeitbedingungen<!-- .element class="fragment" -->

➜ schwer zu debuggen!<!-- .element class="fragment" -->


#### Temporal Coupling: Beispiel

```python
some_api = SomeApi()

someApi.username = 'Zach Brannigan'
someApi.password = 'Mb2.r5oHf-0t' # thx Postillon ;)
someApi.login()
```

<p class="fragment">Mögliches Problem: <code>someApi.url</code> fehlt</p>


#### Temporal Coupling: Beispiel

```python
some_api = SomeApi()

someApi.username = 'Zach Brannigan'
someApi.login()  # und nun?
someApi.password = 'Mb2.r5oHf-0t'
```

<p class="fragment">Weiteres Problem: <code>someApi.login()</code> kann ohne Syntaxfehler aufgerufen werden obwohl wesentliche Daten fehlen</p>


#### Temporal Coupling

```python
class SomeApi:
  url: Optional[str] = None
  username: Optional[str] = None
  password: Optional[str] = None
  
  def login(self):
    auth = BasicAuth(self.username, self.password)
    return requests.some_request(url, auth=auth)
```


#### Temporal Coupling

- Entweder erwarten wir bei der Erstellung ALLE notwendigen Variablen<!-- .element class="fragment" -->
- Oder wir erzwingen sonst irgendwie alle Abhängigkeiten<!-- .element class="fragment" -->


#### Temporal Coupling: Variante 1

```python
class SomeApi:
  url: str = None
  username: str = None
  password: str = None

  def __init__(self, url: str, username: str, password: str):
    self.url = url
    self.username = username
    self.password = password
  
  def login(self):
    auth = BasicAuth(self.username, self.password)
    return requests.some_request(url, auth=auth)

some_api = SomeApi('http://api.com/api/...', 'Zach Brannigan', 'Mb2.r5oHf-0t')
```

- In der Essenz wollen wir es unmöglich machen, unvollständige/falsche Objekte zu erzeugen<!-- .element class="fragment" -->


#### Temporal Coupling: Variante 2

```python
class SomeApi:
  url: str = None

  def __init__(self, url: str):
    self.url = url
  
  def login(self, username: str, password: str):
    auth = BasicAuth(username, password)
    return requests.some_request(url, auth=auth)

some_api = SomeApi('http://api.com/api/...')
some_api.login('Zach Brannigan', 'Mb2.r5oHf-0t')
```

- Bonuspunkte für korrekte Objekte, die Verhalten bei url/username/password erzwingen<!-- .element class="fragment" -->
