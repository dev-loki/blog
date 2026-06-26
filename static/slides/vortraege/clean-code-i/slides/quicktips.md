- **Quicktips**
- Codesmells
- SOLID
- Various stuff
- Looking Forward
- Questions


## Quicktips

#### (A small & incomplete collection of best practices)


### We assume, that

- <!-- .element class="fragment" -->Readability/Maintainability is (far) more important than speed of execution
  - around 80% of the cost are Maintenance costs<!-- .element class="fragment" -->
- <!-- .element class="fragment" -->Each developer is from day one more expensive than an additonal VM/container

Notiz:
- Es gibt natürlich Ausnahmen für Geschwindigkeit
- Entwickler vs Maschinenpreis
- Ausmaß immer auch relevant ;)


## Variable names
- <!-- .element class="fragment" -->No abbrv
  - good exceptions: `n`, `i`, `idx`, `df_`, `pd`
- <!-- .element class="fragment" -->descriptive and direct!
- <!-- .element class="fragment" -->CamelCase for Classes/Types
  - Suboptimal examples from code: 
    - `Detailselement` -> `DetailsElement`
    - `jsonRes = json.loads(response.text)` -> `json_response`
    - `cnt_error` -> `error_count`
- <!-- .element class="fragment" -->snake_case for variables
- <!-- .element class="fragment" -->constants UPPERCASE


## align variables (opinionated!)

- <!-- .element: class="fragment" data-fragment-index="1" --> <code>response</code>
- <!-- .element: class="fragment" data-fragment-index="1" --> <code>json_response</code>
- <!-- .element: class="fragment" data-fragment-index="1" --> <code>dict_response</code>

vs.<!-- .element: class="fragment" data-fragment-index="2" -->

- <!-- .element: class="fragment" data-fragment-index="2" --> <code>response</code>
- <!-- .element: class="fragment" data-fragment-index="2" --> <code>response_json</code>
- <!-- .element: class="fragment" data-fragment-index="2" --> <code>response_dict</code>


![](images/bonkersworld-object-oriented.png)


![](images/bonkersworld-object-oriented-fix.png)


## Pathfinder Rule

> Always leave the code you're editing a little better than you found it
> <div style="text-align:right">- Robert C. Martin</div>


### Pathfinder Rule: Why?
- <!-- .element class="fragment" -->Code has a natural entropy
- <!-- .element class="fragment" -->Most projects start with best intentions
- <!-- .element class="fragment" -->But feature envy and "high speed" are the reasons for slow speed later
- <!-- .element class="fragment" -->Key factor: Constant refactoring while doing normal chores!
- <!-- .element class="fragment" -->Each bit of programming we do must contain business value AND keeping the old stuff clean


## YAGNI

#### You Aint Gonna Need It

- <!-- .element class="fragment" --> around 90% of the "better safe than sorry" features are not actually used
- <!-- .element class="fragment" --> the other 10% are far easier to implement without those 90%


YAGNI: Examples
## Over optimization
> “[...]premature optimization is the root of all evil (or at least most of it) in programming.” -- by awesome Donald Knuth<!-- .element class="fragment" -->


YAGNI: Examples
## Premature Generalization
e.g. throwing "design patterns" on everything which remotely looks like code<!-- .element class="fragment" -->

[gh:EnterpriseQualityCoding/FizzBuzzEnterpriseEdition](https://github.com/EnterpriseQualityCoding/)<!-- .element class="fragment" -->


![](images/fizzbuzz-enterprise.png)


YAGNI: Examples
## False Flags
Using false/true to divide completely different behaviour<!-- .element class="fragment" -->


## YAGNI: Generalization

```python [|9-11]
def extract_article(url, with_comments=True, with_url=True):
  
  article_raw_text = request.from_url(url)

  article_dict = extract_meta_data(article_raw_text)
  if with_comments:
    article_dict['comments'] = request.from_url(article_dict['comment_url'])

  if with_url:
    # maybe we need this later?
    article_dict['url'] = url

  return article_dict
```
- <!-- .element class="fragment" -->Do we really need the url in the result?


#### YAGNI: False Flags

```python [|1,6,7]
def extract_article(url, with_comments=True):
  
  article_raw_text = request.from_url(url)

  article_dict = extract_meta_data(article_raw_text)
  if with_comments:
    article_dict['comments'] = request.from_url(article_dict['comment_url'])

  if with_url:
    # maybe we need this later?
    article_dict['url'] = url

  return article_dict
```
- <!-- .element class="fragment" -->But that's also covered by KISS ->


### KISS / Do One(!) Thing

- Keep It Simple'n'Stupid
- Do one thing and do it well


KISS
## Example

- Lego¹ bricks: powerfull because of their simplicity
- We can combine stuff in endless possiblities
- but only if our bricks are small enough

(¹minecraft for the younger ones ;) )


#### KISS / False Flags

```python [1,6,7]
def extract_article(url, with_comments=True):
  
  article_raw_text = request.from_url(url)

  article_dict = extract_meta_data(article_raw_text)
  if with_comments:
    article_dict['comments'] = request.from_url(article_dict['comment_url'])

  if with_url:
    # maybe we need this later?
    article_dict['url'] = url

  return article_dict
```


#### KISS / False Flags

```python [1-3|5-11|]
def extract_article(url):
  article_raw_text = request.from_url(url)
  return extract_meta_data(article_raw_text)

def extract_article_with_comments(url):
  article_dict = extract_article(url)

  comment_url = article_dict['comment_url']
  article_dict['comments'] = request.from_url(comment_url)

  return article_dict
```


### Magic Numbers

- <!-- .element class="fragment" -->Relevant for all kinds of fixed scalar values 
- <!-- .element class="fragment" -->Easy to fix problem
- <!-- .element class="fragment" -->Huge benefit


Magic Numbers
## Example
```python [|10]
# old rainforest
scraping_log_db(
    message="Found additional columns {} for {}, {} and {}".format(
        add_cols_string,
        f"www.{platform_id}",
        platform_product_id,
        platform_review_id,
    ),
    message_type="WARNING",
    scraper="Reviews",
    task_id=None,
)
```
- <!-- .element class="fragment" -->The only appearance of "Reviews" instead of "Review"


### Effect
![](images/review-s.png)


### Magic Numbers Dos/Donts


### Remember? ;)
```python
scraping_log_db(
    message="Found additional columns {} for {}, {} and {}".format(
        add_cols_string,
        f"www.{platform_id}",
        platform_product_id,
        platform_review_id,
    ),
    message_type="WARNING",
    scraper="Reviews",
    task_id=None,
)
```


```python
# logging_utils.py
WARNING = "WARNING"
REVIEW = "Review"

scraping_log_db(
    message="Found additional columns {} for {}, {} and {}".format(
        add_cols_string,
        f"www.{platform_id}",
        platform_product_id,
        platform_review_id,
    ),
    message_type=WARNING,
    scraper=REVIEW,
    task_id=None,
)
```
- <!-- .element class="fragment" -->Also: KISS


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

- Code should do, what we think it does 
- No surprises
- <!-- .element class="fragment" -->(Ideally) no sideeffects
- <!-- .element class="fragment" -->From API to UX


Principle of Least Surprise
```ruby
# ❌ Dont
def concatenate(first, second)
  return first.camelize + second.camelize
end
```
Notiz: Rails Beispiel


Principle of Least Surprise

```ruby [1-4|6-9|11-15]
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
result = concatenate(first.camelize, second.camelize)
```

