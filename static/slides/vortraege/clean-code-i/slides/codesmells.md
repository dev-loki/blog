- ✔️  Quicktips
- **Codesmells**
- SOLID
- Various stuff
- Looking Forward
- Questions


# Codesmells

Properties of code which can have a bad influence
- either directly in execution
- or later in maintenance


#### ?

```rust [|1-4|6-21]
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


![](images/pyramid-of-doom.png)


## Problem
### We don't always see the PoD due to logic


![](images/review_scraper_decathlon-1.png)


![](images/review_scraper_decathlon-2.png)
- <!-- .element class="fragment" -->That is the whole method
- <!-- .element class="fragment" -->Reversing the if will unindent ~180sloc


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


#### PoD Solution

```rust [2,3]
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
return bool value directly


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
As this is rust we can return by omitting `;`


## God classes

(and methods)

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

- <!-- .element class="fragment" -->Violate the "do one thing well" rule
- <!-- .element class="fragment" -->"and" is a good indicator
- <!-- .element class="fragment" -->But what is the RIGHT size of a class/function?


## "correct" line count per unit of code?
- personal choice?
- <!-- .element class="fragment" -->there are fundamental opinions of experts thinking >5 sloc is almost too much
- <!-- .element class="fragment" -->imho it depends on the language: pure line count is not a good indicator
- <!-- .element class="fragment" -->Cyclomatic complexity! -> later


#### God classes - typical examples

- <!-- .element class="fragment" -->Formatting/Changing data of one type together with the object
- <!-- .element class="fragment" -->Complex constructors vs builder pattern
- <!-- .element class="fragment" -->ORM/ActiveRecord¹
- <!-- .element class="fragment" -->It's always a tradeoff

¹Reasons are a talk all by themselves ;)<!-- .element class="fragment" -->


#### God classes ❌

```python
class CryptoMarketManager:
  def fetch_crypto_data(self, crypto_market, coin): pass
  def buy(self, crypto_market, coin, amount): pass
  def sell(self, crypto_market, coin, amount): pass
  def news(self, coin, market_list): pass
  def min_max_avg(self, coin): pass
  def coin_volume(self, coin): pass
  def print_coin_table(self, coin_list, print_type='pdf'): pass
  def get_history_data(self, crypto_market, coin, date): pass
```
- <!-- .element class="fragment" -->Far too many concerns for just one class
- <!-- .element class="fragment" -->Divide by slicing logic in reusable parts
- <!-- .element class="fragment" -->Complete example would be just to much for this small amount of time, but:


```python [|2|3-4|5-7,9|8]
class CryptoMarketManager:
  def fetch_crypto_data(self, crypto_market, coin): pass
  def buy(self, crypto_market, coin, amount): pass
  def sell(self, crypto_market, coin, amount): pass
  def news(self, coin, market_list): pass
  def min_max_avg(self, coin): pass
  def coin_volume(self, coin): pass
  def print_coin_table(self, coin_list, print_type='pdf'): pass
  def get_history_data(self, crypto_market, coin, date): pass
```


## Duplicate Code

- <!-- .element class="fragment" -->Captain Obvious: DRY!
- <!-- .element class="fragment" -->All relevant IDEs can extract code parts!
  - e.g. "Extract Method" (
    [VSCode](https://code.visualstudio.com/docs/editor/refactoring#_extract-method),
    [Intellij](https://www.jetbrains.com/help/idea/find-and-replace-code-duplicates.html),
    [Neovim/Vim](https://github.com/ThePrimeagen/refactoring.nvim), etc.) 
- <!-- .element class="fragment" -->Codeanalyzer can help:
  - Python: <code style="background:#3f3f3f">pylint</code> with <code style="background:#3f3f3f">--duplicate-code</code> flag.
  - PHP: <code style="background:#3f3f3f">phpcpd</code>
  - JS/Node/Dart/uvm.: [kucherenko/jscpd](https://github.com/kucherenko/jscpd)
- <!-- .element class="fragment" -->Bunuspoints, when CI/CD Pipeline recognizes this ;)


## Duplicate Code: Tips

- <!-- .element class="fragment" -->Trivial: Extract methods/code in own scope
  - <!-- .element class="fragment" -->Instead of inheritance: Mixins/Traits/etc. -> later
- <!-- .element class="fragment" -->Keep track of architecture boundaries
  - <!-- .element class="fragment" -->Complex topic. Another talk?
- <!-- .element class="fragment" -->"Premature Generalization" 


## Commented Code


- In MergeRequests/PullRequests/etc: Just don't
- Git!<!-- .element class="fragment" -->
- Slowly becomes a lie in our code<!-- .element class="fragment" -->
  - Environment changes
  - Comments most of the time don't get the same kind of love
  - Commented code never gets fixed. I really had 0 cases so far (git analysis ;))
- Debugging, etc.? --> Debugger/etc.<!-- .element class="fragment" -->
  - Alternativ: Featuresflags where it works
  - Native: C-Derivates, Rust and for other languages there are libraries (e.g. a Babel-Plugin for JS)


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


Additional problem with debugging code in application: huge security risk!


## Dead Code

- <!-- .element class="fragment" -->Makes refactoring hard to impossible
- <!-- .element class="fragment" -->Are maintained even if they're not in use any longer
- <!-- .element class="fragment" -->Add cognitive clutter without business value
- <!-- .element class="fragment" -->Sometimes hidden in plain sight
- <!-- .element class="fragment" -->Deleted code has no errors ;)
- <!-- .element class="fragment" -->Anecdote ;)

Notiz:
- Versicherung X schickt Metadaten im diversen Formaten
  - XML/Soap eigen, Bipro, Btix, Filenames(!)
  - Einige Formate kamen seit Jahren nicht mehr vor (Relikte)
- Gelöschter Code hat auch keine Fehler ;)


## Dead Code

```js [|2,4|8-10]
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

- YAGNI (lines 8+)<!-- .element class="fragment" -->
- Additionally: False Flags<!-- .element class="fragment" -->


## Too many Parameter/Arguments

```python [1|3|5|7-8|10,11]
def calculate_costs(item): pass

def calculate_costs(item, bonus): pass

def calculate_costs(item, bonus, ahole_malus = None): pass

def calculate_costs(item, bonus, ahole_malus = None, 
                    loyal_bonus = None): pass

def calculate_costs(item, bonus, ahole_malus = None,
                    loyal_bonus = None, tax = 0.19): pass
```
- <!-- .element class="fragment" -->seldom done "just because"
- <!-- .element class="fragment" -->slow and hidden process. "let's do it quickly" is an enemy which makes us slower pretty fast

Notiz:
- Ein typischer Fall für Strategy Pattern


#### Possible solution
```python [|1-4|6-9|11]
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


#### Possible solution: application
```python [1-4|6-10|12]
# These taxes are build somehwere in a repository
tax = PriceModifier(value=False, 0.19)
ahole = PriceModifier(value=True, 0.1)
loyal_bonus = PriceModifier(value=False, 0.05)

modifiers = [tax]  # we always want to tax
if not customer.mostly_friendly():
  modifiers.append(ahole)
if customer.was_here_before():
  modifiers.append(loyal_bonus)
  
total_cost = calculate_costs('magic cards', modifiers)
```


## Property-Creep

```php
<?php  # actuall code somehwere out there ;)
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


## Property-Creep possible solutions

- SubObjects
  - e.g. for **Insurer**, **CalculationParameters**, **Customer**
- <!-- .element class="fragment" -->Maybe another example of god object?
- <!-- .element class="fragment" -->Better data types to structure this object
  - <!--- .element class="fragment" -->e.g. for insuranceDateFrom/To there is DatePeriod in PHP (and most other languages)
  - <!-- .element class="fragment" -->Know about the included batteries of your language!


## Global Scope

- <!-- .element class="fragment" -->Javascript/PHP are historical victims to this:
  - `$_GLOBAL` and `$_GET` (php)
  - `window.` and `document.` (javascript)
- <!-- .element class="fragment" -->Example and one of the reasons, why wordpress is not very liked among developers:
  - PHP Magic `$_GET['a']` was converted to global variable `$a`


#### Global Scope - Negative Example

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

- Why is this a problem?
  - <!-- .element class="fragment" -->Globale state makes testing/maintenance/finding errors a lot harder
  - <!-- .element class="fragment" -->(maybe you already see a pattern ;) )
- <!-- .element class="fragment" -->Is there an alternative?
  - <!-- .element class="fragment" -->Explizit dependencies by giving them into the classes/functions -> Constructor Injection

Notiz:
 - Singleton kann(!) als Versteck für Global State fungieren


## Temporal Coupling
- <!-- .element class="fragment" -->huge problem, as errors only appear to runtime
- <!-- .element class="fragment" -->sometimes only if certain conditions are met!

➜ extremely hard to debug!<!-- .element class="fragment" -->


#### Temporal Coupling: Example

```python
some_api = SomeApi()

someApi.username = 'Zach Brannigan'
someApi.password = 'Mb2.r5oHf-0t' # thx Postillon ;)
someApi.login()
```

<p class="fragment">Possible Problem: <code>someApi.url</code> is missing</p>


#### Temporal Coupling: Example

```python [4]
some_api = SomeApi()

someApi.username = 'Zach Brannigan'
someApi.login()  # what now?
someApi.password = 'Mb2.r5oHf-0t'
```

<p class="fragment">Another problem: <code>someApi.login()</code> can be called without syntax error. Even when essential data and arguments are missing.</p>


```python
class SomeApi:
  url: Optional[str] = None
  username: Optional[str] = None
  password: Optional[str] = None
  
  def login(self):
    auth = BasicAuth(self.username, self.password)
    return requests.some_request(url, auth=auth)
```


### Solution?

- <!-- .element class="fragment" -->either we EXPECT all necessary variables on creation
- <!-- .element class="fragment" -->or we force all dependencies with other measures


#### Solution 1

```python
class SomeApi:
  def __init__(self, url: str, username: str, password: str):
    self.url: str = url
    # Alternative: save strings and build BasicAuth in login()
    self.auth: BasicAuth = BasicAuth(self.username, self.password)
  
  def login(self):
    return requests.some_request(self.url, auth=self.auth)

some_api = SomeApi('http://api.com/api/...', 'Zach Brannigan', 'Mb2.r5oHf-0t')
```
- <!-- .element class="fragment" -->Essentially we just want to make it impossible to have incomplete objects somewhere in the code
- <!-- .element class="fragment" -->It's better to have no or an complete object
- <!-- .element class="fragment" -->In complex cases we might have intermediary objects


#### Solution 2

```python
LOGIN_URL = 'https:/...'

@dataclass
class SomeApi:
  username: str
  password: str
  url: str = LOGIN_URL
  
  def login(self):
    basic_auth = BasicAuth(self.username, self.password)
    return requests.some_request(LOGIN_URL, auth=basic_auth)

some_api = SomeApi('Zach Brannigan', 'Mb2.r5oHf-0t')
```
- <!-- .element class="fragment" --> Attention: `requests` is an implicit dependency
