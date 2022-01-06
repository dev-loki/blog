+++
title = "Advanced GIT: Git Worktree"
date = "2021-11-25"
description = "git worktree ist ein super Werkzeug um mit mehreren Branches parallel zu arbeiten"
draft = false
+++

Eines der geilsten Features von Git. Gleichzeitig eines der am wenigsten benutzten Features.

**Folgende Situation:**

Ihr seid gerade an eurem `feature/blubb_feature` dran und dann kommt ein MR vom Kollegen,
wo ihr bitte ganz schnell `hotfix/make_that_users_dont_die_immediately` reviewen sollt,
damit das super flott live gehen kann. Leider ist der branch zu komplex um alles direkt im
Gitlab zu machen.

Also wirklich auschecken und deep-dive in den Code...

### Klassisches Vorgehen

1. `git stash` eurer Änderungen
2. `git checkout hotfix/...` um den Branch anzugucken und alles durch zu gehen.
3. Freigabe oder eben nicht

### Viel besseres Vorgehen

Ihr habt `git worktree` eingerichtet (ist nativ bei git dabei) und habt sowieso schon folgende Ordnerstruktur:

```
project_name/
 - main/
 - develop/
 - feature/
   - blubb_feature/
 - hotfix/
   - make_that_users_dont_die_immediately/
```

Jeder Ordner ist quasi ein eigenes Git Repository. Aber alle teilen sich die
Git Metadaten. Statt also euren Stand zu verlassen und komplett zu wechseln,
reicht ein `git worktree add BRANCH_NAME` und ein Ordner, der auf einen zeigt,
wird für euch erstellt.

## Aber wie geht das jetzt?

Super simpel - wirklich :).

1. `mkdir my_project` (Projektverzeichnis erstellen) und via `cd` dort rein wechseln: `cd my_project`
2. Repository klonen (Achtung - hier ist die erste Besonderheit) `git clone --bare GIT_URL .bare`.
   - Wir klonen also nur das bare Repository ohne einen Branch auszuchecken
   - Diese Metadaten speichern wir im Order `.bare` (Durch den `.` am Anfang ist der Ordner unter MacOS/Linux versteckt)
3. Eine Datei `my_project/.git` erstellen und folgende Zeile eintragen:
   ```
   gitdir: ./.bare
   ```
   Damit weiß Git jetzt, wo sich unsere Repository Metadaten befinden
4. Ab jetzt funktioniert worktree perfekt:
   - `git worktree add main` fügt unseren Main-Branch hinzu
   - `git worktree add feature/ABC_new_stuff_to_play feature/ABC_new_stuff_to_play` um Branches mit `/` im Namen auszuchecken oder zu erstellen
   - Tatsächlich könnt ihr aber auch beliebig im Dateisystem euren Ordner mit dem Branch erstellen. Das Format sieht in etwa so aus:
     `git worktree add PATH BRANCHNAME`

## Weitere hilfreiche Befehle

- Branch löschen:
  - Variante 1: `rm -r BRANCH_NAME` und dann `git worktree prune`
  - Variante 2: `git worktree list` Listet alle worktree branches.
- Branch verschieben: `git worktree move SOURCE DESTINATION`
