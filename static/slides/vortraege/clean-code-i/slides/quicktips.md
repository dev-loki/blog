- ✔️ Vorstellung / Aufbau
- **Quicktips-Sammlung**
- Codesmells
- SOLID
- Diverses
- Ausblick
- Fragen & Co


## Quicktips

#### (Eine kleine Sammlung von Best Practices)


### Wir gehen davon aus, dass

- <!-- .element class="fragment" -->Lesbarkeit/Wartbarkeit wichtiger sind, als Geschwindigkeit
  - Denn: ~80% der Gesamtkosten sind Wartungskosten<!-- .element class="fragment" -->
- Entwickler sind ab dem ersten Tag teurer als weitere VMs<!-- .element class="fragment" -->

Notiz:
- Es gibt natürlich Ausnahmen für Geschwindigkeit
- Entwickler vs Maschinenpreis
- Ausmaß immer auch relevant ;)


## Pfadfinder Regel

> Always leave the code you're editing a little better than you found it
> <div style="text-align:right">- Robert C. Martin</div>


- Code unterliegt natürlicher Entropie
- Die meisten Projekte sind mit besten Intentionen gestartet - und dann kam der Kunde ;)<!-- .element class="fragment" -->
- Disziplin ist ein wesentlicher Faktor, der saubere Projekte später von Legacy unterscheidet<!-- .element class="fragment" -->
- Schlüssel: Konstantes Refactoring während der regulären Tickets<!-- .element class="fragment" -->


## YAGNI

#### You Aint Gonna Need It


- 90% der vorsichtigerweise eingebauten Features werden nicht gebraucht
- Die restlichen 10% sind ohne die anderen 90% deutlich einfacher umzusetzen<!-- .element class="fragment" -->


### Beispiele
- Überoptimierung<!-- .element class="fragment" -->
  > “[...]premature optimization is the root of all evil (or at least most of it) in programming.” -- Donald Knuth
- "Premature Generalization"<!-- .element class="fragment" -->
  - Z.Bsp Patterns auf alles werfen, was irgendwie nach Code aussieht
- False Flags<!-- .element class="fragment" -->


## YAGNI: Generalization

```python [|9-11]
def extract_article(url, with_content=True, with_url=True):
  
  article_raw_text = request.from_url(url)

  article_dict = extract_meta_data(article_raw_text)
  if with_content:
    article_dict['content'] = filter_html(article_raw_text)

  if with_url:
    # maybe we need this later?
    article_dict['url'] = url

  return article_dict
```

Notiz:
 - Keine Sorge - `with_content` wird noch angesprochen ;)


#### YAGNI: False Flags

```python [|1,6,7]
def extract_article(url, with_content=True):
  
  article_raw_text = request.from_url(url)

  article_dict = extract_meta_data(article_raw_text)
  if with_content:
    article_dict['content'] = filter_html(article_raw_text)

  return article_dict
```
- Dafür schauen wir uns das nächste Prinzip an<!-- .element class="fragment" -->


### KISS / Do One(!) Thing

- Keep It Simple'n'Stupid
- Do one thing and do it well

Notiz:
 - Beispiel Legosteine: Mächtig wegen der simplen Grundbausteine
 - Modereneres Beispiel: Minecraft -> Simple Bausteine


#### KISS / False Flags

```python [1,6,7]
def extract_article(url, with_content=True):
  
  article_raw_text = request.from_url(url)

  article_dict = extract_meta_data(article_raw_text)
  if with_content:
    article_dict['content'] = filter_html(article_raw_text)

  return article_dict
```


#### KISS / False Flags

```python [1-3|5-8]
def extract_article(url):
  article_raw_text = request.from_url(url)
  return extract_meta_data(article_raw_text)

def extract_article_with_content(url):
  article_dict = extract_article(url)
  article_dict['content'] = filter_html(article_raw_text)
  return article_dict
```


### Magic Numbers

- Relevante Zahlen im Code deren Sinn nicht direkt ersichtlich ist<!-- .element class="fragment" -->
- Siehe auch Dominiques Vortrag vom Februar diesen Jahres :).<!-- .element class="fragment" -->
- Weil wichtig, trotzdem nochmal ganz schnell ;)<!-- .element class="fragment" -->


### Magic Numbers Dos/Donts

```javascript [1-2|4,5,7]
// ❌ Dont
function isOldEnough(age) { return age >= 18; }

// ✔️  Do
const MIN_DRINKING_AGE = 18;
function isOldEnough(age) {
  return age >= MIN_DRINKING_AGE;
}
```


### Principle of Least Surprise

- Code sollte tun, was man erwartet
- D.h. keine Überraschungen<!-- .element class="fragment" -->
- (Idealerweise) Keine Seiteneffekte<!-- .element class="fragment" -->
- Betrifft APIs genauso wie UX<!-- .element class="fragment" -->


### Principle of Least Surprise

```ruby
# ❌ Dont
def concatenate(first, second)
  return first.camelize + second.camelize
end
```

Notiz: Rails Beispiel


### Principle of Least Surprise

```ruby [2-4|6-9|11-14]
# ❌ Still Meh
def concatenate(first, second)
  return first.camelize + second.camelize
end

# ? "Better" Variant 1
def concatenate_and_camelize(first, second)
  return first.camelize + second.camelize
end

# ✔️  Better Variant 2
def concatenate(first, second)
  return first + second
end
```

