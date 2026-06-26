- ✔️  Quicktips
- ✔️  Codesmells
- **SOLID**
- Various stuff
- Looking Forward
- Questions


#### SOLID

- **S** ingle Responsibility
- **O** pen Closed Principle
- **L** iskovsches Substitutionsprinzip
- **I** nterface Segregation
- **D** ependency Inversion

Notiz:
 - Gehe gleich drauf ein -> Keine detailerklärung notwendig ;)
 - Generell eher für den Architektur/Patterns Vortrag


#### SOLID: Single Responsibility

```js
class Employee{
  // fields
  function calculatePay() { } // Fürs Accounting
  function reportHours() { } // Für HR
  function save() { } // In Database
}
```
- <!-- .element class="fragment" -->Tightly Coupled: Accounting, HR, Database and Employee 


#### SOLID: Single Responsibility

```js
class Employee { /** fields & constructor Injection */ }
class PayCalculator { function calculatePay(data); }
class HourReporter { function reportHours(data); }
class EmployeeRepository { function save(data); }
```

- <!-- .element class="fragment" -->Problem: Now our Employee needs to give this solutions to the outside


#### SOLID: Single Responsibility

```js
class EmployeeData { /** fields */ }
class EmployeeFacade {
  constructor(PayCalculator, HourReporter, EmployeeRepository)
  {}
}
class PayCalculator { function calculatePay(data); }
class HourReporter { function reportHours(data); }
class EmployeeRepository { function save(data); }
```

- <!-- .element class="fragment" -->But now we only have one method per class :/ 

NOPE! <!-- .element class="fragment" -->
 
Notiz:
- Tatsächlich ist calculatePay sicher kein Einzeiler
- Auch reportHours holt sich vlt Daten aus einer API usw.


#### SOLID: Open Closed Principle
- Software entities shall be open for enhancement but closed for change
- <!-- .element class="fragment" -->Thought experiment: finance report
- <!-- .element class="fragment" -->Ideally we only change the ONE component responsible for the display of data

Notiz:
- Software zum Anzeigen von Finanzreports als Tabelle auf Webseite
- Negative Zahlen sind rot
- FeatureRequest vom Boss: Soll auch via Fax verschickt werden
- Statt rot, sollen negative Zahlen geklammert und mit Minus gezeigt werden
**Hinweis** auf Moduleborders und Abhängigkeitsrichtung => Software Architektur


#### SOLID: Liskovsches Substitution
- Only principle named after a person: [Barbra Liskov](https://de.wikipedia.org/wiki/Barbara_Liskov)
- <!-- .element class="fragment" -->Also known as "replaceable principle"
  - <!-- .element class="fragment" -->Again: more for architecture talk
  - <!-- .element class="fragment" -->Google in context with: Square/Rectangle problem


#### SOLID: Interface Segregation

> <!-- .element class="fragment" -->"Many client-specific interfaces are better than one general-purpose interface."


#### SOLID: Interface Segregation

```kotlin [|1-4|6-9|11-14]
interface IWorker {
  fun hardWork();
  fun eat();
}

class Worker : IWorker {
  fun hardWork() { /** normal amount of work */ }
  fun eat() { /** normal amount of food */ }
}

class SuperWorker : IWorker {
  fun hardWork() { /** 10x amount of work */ }
  fun eat() { /** 2x amount of food */ }
}
```
- <!-- .element class="fragment" -->Python Interfaces: Protocol (python3.8) else abc.ABC


- But now we want to add the manager. What to do about it??
  - <!-- .element class="fragment" -->(S)He obviously cannot do hard work (right?)
  - <!-- .element class="fragment" -->Eating will be there, but also managing as new capability!


#### SOLID: Interface Segregation

```kotlin
interface CanWork { fun hardWork(); }
interface CanEat { fun eat(); }
interface CanDelegate { fun delegate(); }

class Worker : CanEat, CanWork {
  public void hardWork();
  public void eat();
}

class Manager : CanEat, CanDelegate { /** ... */ }

class Robot : CanWork { /** .... */ }
```


#### SOLID: Interface Segregation
- "Many client-specific interfaces are better than one general-purpose interface."
- <!-- .element class="fragment" -->Interfaces are split into "capabilities" 
- <!-- .element class="fragment" -->We only depend on things an object can - no longer on the object itself!
- <!-- .element class="fragment" -->Won't this lead to a lot of duplicate code?

<span class="fragment"><span style="color:red">Nope!</span> Trait, DefaultInterface, Mixins, etc.</span>


#### SOLID: Dependency Inversion
> <!-- .element class="fragment" -->"Depend on Abstractions not concretions."

Same example, but now the application<!-- .element class="fragment" -->


#### SOLID: Dependency Inversion
Before:
```kotlin
class Workplace(manager: Manager, workers: Set<Worker>, robots: Set<Robot>)
{
  fun startTheDay() {
    manager.delegate()
    workers.forEach { worker.work(); }
    robots.forEach { robot.work(); }
    workers.forEach { worker.eat(); }
  }
}
```


#### SOLID: Dependency Inversion
Better:
```kotlin
class Workplace(manager: CanManage, workers: Set<CanWork>)
{
  fun startTheDay() {
    manager.delegate()
    workers.forEach { worker.work(); }
    workers
      .filter{ worker -> worker is CanEat }
      .forEach{ worker.eat(); }
  }
}
```
 
