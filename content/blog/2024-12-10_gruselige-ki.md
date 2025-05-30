+++
title = "Warum KI gar nicht so gruselig ist, wie sie erst wirkt"
date = "2024-12-10T10:00:00Z"
updated = "2024-12-10T10:52:23Z"
description = "Kurz meine 12cent, warum KI gar nicht so gruselig ist, wie man denkt, dass sie es ist. Dabei nehme ich bezug auf einen Artikel der soeben auf Golem erschienen ist."
draft = true
+++

Ich will hiermit ein paar Worte zu diesem Artikel (bzw. genauer zur Message dahinter) aufschreiben:
https://www.golem.de/news/kuenstliche-intelligenz-openais-o1-modell-soll-forscher-hintergangen-haben-2412-191576.html

Das alles klingt gruselig, ist aber nur rein rein statistisches Mittel was OpenAI dort anwendet. Ich dachte ich komme den Medien mal zuvor und erkläre, warum das nicht gruselig ist :D.

Im wesentlichen machen die KI Modelle so etwas:

> "Guten morgen, wie geht es [...]"

Nah? Welches Wort kommt als nächstes? Wahrscheinlich "dir?", aber es gibt auch eine geringe Wahrscheinlichkeit für Dinge wie "deinem Hund?" und Ähnliches.

Je nach Model sind folgene Varianten z.Bsp. ohne Kontext Wahrscheinlichsten:

- ... dir heute?
- ... Ihnen?
- ... deiner Familie?
- ... Ihnen an diesem schönen Tag?
- ... deinem Hund?

Aber es gibt auch eine klitzekleine Wahrscheinlichkeiten für:

- ... den Bäumen im Wald?
- ... mit der Mission auf dem Mars?
- ... den Quantencomputern?
- ... in der geheimnisvollen Welt der Tiefsee?

Was LLMs (Große Sprachmodelle) nun machen, ist natürlich mehr Inhalte einbeziehen. Wenn der Satz also wäre: "Oh, du bist Meeresforscher? Guten morgen, wie geht es ..." sind die Wahrscheinlichkeiten auf einmal ganz anders.

Das "menschliche" erreichen LLMS so:

1. Nimm ein paar der wahrscheinlichsten Antworten (z.Bsp. 5)
2. Wähle davon zufällig eine Antwort aus
3. Antworte

Für die Wahrscheinlichkeit werden Wortvektoren für Sinnwörter genommen ("das", "und", etc. werden fast komplett ignoriert).

Jedes Wort jeder Sprache ist dann einfach ein Pfeil der statt nur 2 Dimensionen (wir kennen Koordinatensysteme mit x und y noch aus der Schule) viele Tausend oder sogar Millionen Dimensionen haben kann. Aber die Nähe dieser Pfeile zueinander kann man ganz einfach berechnen.

- Auto und Cirrus Wolke sind zwei sehr weit entfernte Pfeile
- Lenkrad und Auto sind auf einigen dieser Dimensionen ganz Nahe
- Apfel und Birne sind ebenfalls ganz nah. Aber in anderen Dimensionen nah, wie Golden Delicious und Elstar

Die Entfernungen sind das, was man dann beim Trainieren einer KI berechnet.

Das letzte bisschen, was dann noch an "Magie" passiert, ist, dass alle großen Firmen ihren Sprachmodellen versteckte Texte mitgeben.
