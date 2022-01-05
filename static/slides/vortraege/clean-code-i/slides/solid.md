- ✔️ Vorstellung / Aufbau
- ✔️ Quicktips-Sammlung
- ✔️ Codesmells
- **SOLID**
- Diverses
- Ausblick
- Fragen & Co


#### SOLID

- Single Responsibility
- Open Closed Principle
- Liskovsches Substitutionsprinzip
- Interface Segregation
- Dependency Inversion

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

- Hier sind Account, HR, "Database" und der Angestellte gekoppelt


#### SOLID: Single Responsibility

```js
class Employee { /** fields & constructor Injection */ }
class PayCalculator { function calculatePay(data); }
class HourReporter { function reportHours(data); }
class EmployeeRepository { function save(data); }
```

- Jetzt muss Employee diese Lösungen aber alle nach außen transportieren.


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

- Nur eine Methode pro Klasse? <span class="fragment">Nope!</span>

Notiz:
- Tatsächlich ist calculatePay sicher kein Einzeiler
- Auch reportHours holt sich vlt Daten aus einer API usw.


#### SOLID: Open Closed Principle
- Software Entitäten sollen offen für Erweiterung, aber geschlossen für Veränderung sein
- Gedankenexperiment: Finanzreport
- Idealerweise ändert sich hier nur die eine Komponente, die für die Anzeige von Daten
  zuständig ist<!-- .element class="fragment" -->

Notiz:
- Software zum Anzeigen von Finanzreports als Tabelle auf Webseite
- Negative Zahlen sind rot
- FeatureRequest vom Boss: Soll auch via Fax verschickt werden
- Statt rot, sollen negative Zahlen geklammert und mit Minus gezeigt werden
**Hinweis** auf Moduleborders und Abhängigkeitsrichtung => Software Architektur


#### SOLID: Liskovsches Substitutionsprinzip
- Einziges nach einer Person benanntes: [Barbra Liskov](https://de.wikipedia.org/wiki/Barbara_Liskov)
- Auch "Ersetzbarkeitsprinzip"
- Square/Rectangle Problem
- --> Eher was für einen Architekturvortrag


#### SOLID: Interface Segregation
><!-- .element class="fragment" --> "Many client-specific interfaces are better than one general-purpose interface."


#### SOLID: Interface Segregation

```kotlin
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

- Aber was, wenn wir den Manager hinzufügen wollen?<!-- .element class="fragment" -->


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
- Interfaces werden in "Fähigkeiten" werden aufgesplittet<!-- .element class="fragment" -->
- Wir verlassen uns nur auf Dinge die ein Objekt kann - nicht mehr auf das spezifische Objekt<!-- .element class="fragment" -->
- Müssen wir den Code dann nicht häufig duplizieren?<!-- .element class="fragment" -->
  <span class="fragment"><span style="color:red">Nope!</span> Trait, DefaultInterface, Mixins, etc.</span>


#### SOLID: Dependency Inversion
> <!-- .element class="fragment" -->"Depend on Abstractions not concretions."


#### SOLID: Dependency Inversion

```kotlin
class Workplace
constructor (manager: Manager, workers: Set<Worker>, robots: Set<Robot>)
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

```kotlin
class Workplace(manager: CanManage, workers: CanWork)
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
 
