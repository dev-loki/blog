+++
title = "Claude Code, Claw Code und das Ende der Geheimnisse?"
date = "2026-05-04T12:00:00Z"
description = "Ein Blick auf den Claude Code Leak, das daraus entstandene Claw Code Projekt und was das über die aktuelle KI-Entwicklung und deren rechtliche Grauzonen aussagt."
draft = false

[taxonomies]
tags = ["ki", "tooling"]
+++

Sorry für die lange Funkstille! Seit dem letzten Post ist ja doch einiges an Zeit ins Land gegangen. Ich hab hier noch einen ganzen Stapel an Entwürfen rumliegen (`.md.draft`), aber wenn ich mir die so anschaue, müssen die wohl alle erst mal grundlegend überarbeitet werden, die Welt (und vor allem die KI-Welt) dreht sich einfach zu schnell ;).

Aber jetzt treibt mich gerade genau diese KI rum und mir fehlt eine Stimme, die weder komplett vom Hype überrannt, noch in ihrem Loch lebt und die aktuelle Entwicklung ignoriert. Daher mache ich das jetzt einfach mal - sogar frei von KI geschrieben.

Claude Code direkt als erstes, da es ziemlich deutlich die Beliebtheitsskala bei Entwicklern anführt. Es ist schon faszinierend (und ein bisschen ironisch), dass ausgerechnet ein Tool, das uns beim Programmieren helfen soll, seinen eigenen Quellcode veröffentlicht - und das sogar nachdem Mythic (das Ding, was so gut ist, dass man es vor der Öffentlichkeit verstecken muss) bereits im Einsatz war; oder weil? 🤔 Manche erinnern sich vielleicht noch an GPT5 wo ähnliches behaupted wurde.


### Claw Code

Wer sich das Ganze mal im Detail anschauen will (solange es noch online ist), sollte einen Blick auf [Claw Code](https://claw-code.codes/) werfen. Das Projekt hat den geleakten Code quasi "deductiv" aufbereitet und zugänglich gemacht. Es ist ein extrem spannendes Stück Softwarearchitektur, das zeigt, wie Anthropic die Interaktion zwischen LLM und lokaler Shell orchestriert.


### Die rechtliche Seite: DMCA-Whack-A-Mole

Natürlich findet Anthropic das Ganze weniger witzig. Es gab wohl schon über 8100 Löschanfragen. [Heise hat dazu einen sehr guten Artikel geschrieben](https://www.heise.de/news/Claude-Code-Leck-8100-Loeschantraege-und-die-Geburtsstunde-von-Claw-Code-11279601.html), der die rechtlichen Aspekte beleuchtet. Es ist die klassische "Geburtsstunde" eines Tools aus einem Leak heraus, und der verzweifelte Versuch, die Katze wieder in den Sack zu kriegen.

Ich finde das ziemlich bezeichnend für den current State der KI:
- Die Tools werden immer mächtiger, aber auch komplexer.
- Der Code (und die Bugs) entstehen schneller und kriegen immer weniger echte Reviews
- "Security by Obscurity" funktioniert mit KI noch weniger als vorher

Gerade überlege ich noch, ob ich dazu mal einen tieferen Artikel schreibe, wo ich mich speziell um **KI Guardrails**, also eine Art Sicherheitskorsett für KI kümmere. Ich habe das Gefühl, dass dies vielen noch fehlt obwohl es echt eine schöne tief hängende Frucht ist.

