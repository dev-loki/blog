+++
title = "Spracherkennung in 17 MB, komplett im Browser"
date = "2026-10-21T17:00:00Z"
description = "Cactus Compute hat mit Whistle ein Spracherkennungsmodell veröffentlicht, das in eine 17-MB-Datei passt und ohne GPU läuft. Ich habe es als WebAssembly in den Browser gepackt und mit Parakeet, Nemotron, Whisper und Moonshine verglichen."
[taxonomies]
tags = ["ki", "tooling"]
+++

<!-- TODO Torsten: eigene Erfahrung im Intro -->

Spracherkennung hieß bisher meistens: Audio an einen Server schicken oder
lokal ein Modell laufen lassen, das ein paar hundert Megabyte groß ist und
sich über eine GPU freut. Am 2. Oktober hat Cactus Compute
[Whistle](https://cactuscompute.com/blog/whistle) veröffentlicht. Das ganze
Modell ist eine einzige Datei mit 16,9 MB und läuft auf der CPU.

Bei 17 MB lag die Frage nahe: Geht das auch im Browser, ohne Server und ohne
dass das Audio den Tab verlässt? Es geht. Der PoC hat einen Abend gedauert und
liegt hier: [loki.dev/lab/whistle](/lab/whistle/).

## Was Whistle ist

Whistle läuft auf derselben Engine wie
[Needle](https://huggingface.co/Cactus-Compute/needle3), dem kleinen
Tool-Calling-Modell, das Cactus im Mai rausgebracht hat. Beide teilen sich das
`.cact`-Containerformat, die Quantisierung (Cactus Quants, 2 bis 4 Bit) und die
SIMD-Kernel. Abhängigkeiten gibt es keine, eine GPU braucht es nicht. Lizenz
ist Apache 2.0.

Laut [Model Card](https://huggingface.co/Cactus-Compute/whistle) versteht
Whistle sieben Sprachen: Englisch, Deutsch, Französisch, Spanisch,
Italienisch, Niederländisch und Polnisch. Gibt man keine vor, erkennt es sie
selbst. Bis 30 Sekunden schafft es in einem Durchgang, längere Aufnahmen
zerlegt es in Fenster. Zu jedem Wort liefert es Start, Ende und eine
Wahrscheinlichkeit, abgeleitet aus der Attention des Decoders. Über eine
Keyword-Liste kann man Namen und Fachbegriffe bevorzugen lassen.

Im Live-Modus transkribiert es, während man spricht, und übernimmt nur die
Wörter fest, bei denen sich zwei Durchgänge einig sind. Wer gar kein
Transkript braucht, bekommt die Encoder-Ausgabe als Embedding, eine Zeile pro
80 ms, zum Beispiel für eine Suche über Audio.

Die Grenzen schreibt Cactus selbst dazu. Bei Stille und gleichmäßigem
Rauschen kommt ein leerer Text zurück statt eines erfundenen Satzes. Musik
kann aber trotzdem als Text rauskommen. Wer ein Mikrofon dauerhaft
mithören lässt, braucht also eine Voice Activity Detection oder ein Wake Word
davor.

Im [Hacker-News-Thread](https://news.ycombinator.com/item?id=50008427) stehen
Erfahrungen, die man in der Model Card nicht findet. Am auffälligsten: Ein Nutzer
hat eine TV-Folge transkribiert und an mehreren Stellen nur "Thank you."
bekommen, einmal für 60 Sekunden Dialog am Stück. Außerdem soll Polnisch nur
brauchbar sein, wenn man laut, klar und langsam spricht, und bei einem
flämischen Akzent hat Whistle zwischen Niederländisch und Deutsch geraten.

## Wie der PoC funktioniert

Cactus liefert die Engine auch als WebAssembly-Build: `needle.js` plus
`needle.wasm`, zusammen knapp 1 MB, mit gzip übertragen nur 0,4 MB. Dazu kommt `whistle.cact`. Beides liegt
auf loki.dev selbst, es gibt also keine Requests an Hugging Face oder ein CDN.

Alles Rechenintensive läuft in einem Web Worker, damit die Seite nicht
einfriert. Der Worker holt Engine und Modell als `ArrayBuffer`, kopiert das
Modell in den WebAssembly-Speicher und lädt es:

```js
const [wasm, cact] = await Promise.all(
  ['vendor/needle.wasm', 'vendor/whistle.cact'].map((u) => fetch(u).then((r) => r.arrayBuffer())),
);
// The build ignores locateFile, so hand it the wasm bytes directly.
M = await createNeedle({ wasmBinary: wasm });
const p = M._malloc(cact.byteLength);
M.HEAPU8.set(new Uint8Array(cact), p);
if (M._needle_load(p, BigInt(cact.byteLength)) < 0) throw new Error(M.UTF8ToString(M._needle_last_error()));
```

Das `wasmBinary` ist nötig, weil der Build `locateFile` ignoriert und die
`.wasm`-Datei sonst am falschen Ort sucht.

Transkribieren ist dann ein einziger C-Aufruf über `ccall`. Die Samples gehen
als Pointer rein, Sprache und Keywords als Strings, und das Ergebnis kommt als
JSON in einen vorher reservierten Puffer:

```js
const out = call('needle_transcribe', [...T, 'number', 'number', 'number'], [
  p, m.pcm.length, m.language || null, m.keywords || null, m.words ? 1 : 0, outPtr, OUT_CAP,
]);
```

`call` ist ein kleiner Wrapper um `M.ccall`, der den Rückgabewert prüft und
den Puffer mit `JSON.parse` liest.

Whistle will 16 kHz Mono als `Float32Array`. Beim Mikrofon erledigt das der
Browser: `new AudioContext({ sampleRate: 16000 })` resampelt das
Mikrofonsignal selbst. Bei Dateien dekodiere ich erst mit `decodeAudioData`
und rendere das Ergebnis dann durch einen `OfflineAudioContext` mit einem
Kanal und 16 kHz. Der mischt auf Mono runter und resampelt in einem Schritt.
Damit gehen auch Videos, solange der Browser die Tonspur dekodieren kann.

Im Live-Modus ist immer nur ein Durchgang unterwegs. Sobald eine Sekunde Audio
gesammelt ist und der Worker frei ist, geht der Puffer an
`needle_stream_transcribe_process`. Was in der Zwischenzeit reinkommt, landet
im nächsten Durchgang. Zurück kommen die festen Wörter und ein vorläufiger
Rest, den ich blasser anzeige. Beim Stoppen holt
`needle_stream_transcribe_stop` den Rest ab. Wörter, bei denen sich das Modell
unter 60 % sicher ist, unterstreiche ich gepunktet. Die Zeitstempel stehen im
Tooltip.

Ein Service Worker legt Seite, Worker, Engine und Modell in den Cache. Nach
dem ersten Besuch funktioniert die Seite im Flugmodus. Das Audio verlässt den
Tab nie, das kann man im Netzwerk-Tab der DevTools nachprüfen.

<!-- TODO Torsten: eigene Messwerte (Ladezeit, RTF) bestätigen und als Absatz
einbauen. Vorschlag aus einer Messung im Claude-Browser-Pane auf deinem Mac
(Chromium, WASM, ein Worker), noch nicht von dir geprüft:
- Modell laden: 86 ms von localhost, 655 ms von loki.dev (HTTP warm)
- Testclip: 6,8 s deutsche macOS-TTS (Stimme Anna): "Ich baue meinen Blog mit
  Zola und deploye ihn per rsync auf Uberspace. Die Spracherkennung läuft
  komplett im Browser."
- Ohne Keywords: 502 ms, RTF 0,073, TTFT 125 ms, 196 tok/s. Ergebnis: "Ich
  baue meinen Block mit Solar- und Deckläuer-Interrünk auf Oberspasse, die
  Sprachörkennung läuft komplett im Brauser."
- Mit Keywords Zola/Uberspace/rsync: 449 ms, RTF 0,066. Ergebnis: "...Block
  mit Solar- und Deckläuer in Parünk auf Uberspace, die Spracherkennung läuft
  komplett im Brauser." Biasing hat Uberspace und Spracherkennung repariert,
  Zola und rsync nicht.
- Live-Streaming liefert denselben Text wie der Clip.
- Einschränkungen: synthetische Stimme, englische Fachbegriffe im deutschen
  Satz, und 196 tok/s im Browser liegen weit unter den 1.319 tok/s, die
  Cactus für die native Engine auf dem M4 Pro angibt.
-->

## Der Vergleich

Wichtig vorweg: Alle Zahlen stammen von den Herstellern. Jeder misst mit
eigenem Setup, teils mit unterschiedlichen Normalisierern und
Scoring-Regeln. Für Größenordnungen taugen die Tabellen, für eine Rangliste
auf die Nachkommastelle nicht.

Erst die Steckbriefe:

| Modell | Download | Sprachen | Lizenz | Läuft auf |
|--------|----------|----------|--------|-----------|
| [Whistle](https://huggingface.co/Cactus-Compute/whistle) | 16,9 MB | 7, inkl. Deutsch | Apache 2.0 | CPU, auch WebAssembly |
| [Moonshine tiny](https://huggingface.co/UsefulSensors/moonshine-tiny) | 41,9 MB¹ | nur Englisch | MIT | CPU |
| [Whisper base](https://github.com/openai/whisper) | 145 MB¹ | 99 | MIT | CPU, GPU |
| [Parakeet TDT 0.6B v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3) | 714 MB (GGUF q8_0) | 25 europäische | CC-BY-4.0 | NVIDIA-GPU mit NeMo, lokal über NeMo-Speech.cpp |
| [Nemotron Speech Streaming en 0.6B](https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b) | 700 MB (GGUF q8_0) | nur Englisch | NVIDIA Open Model License | wie Parakeet |
| [Nemotron 3.5 ASR Streaming 0.6B](https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b) | 742 MB (GGUF q8_0) | 40 Locales, inkl. de-DE | OpenMDW-1.1 | wie Parakeet, dazu ein ONNX-Export (int4) |

¹ Größe aus dem Benchmark-Chart von Whistle. Die NVIDIA-Modelle haben 600
Millionen Parameter, als `.nemo` sind es jeweils rund 2,5 GB.

Dann die Wortfehlerraten (WER in %, kleiner ist besser):

| Modell | LibriSpeech clean | LibriSpeech other | TED-LIUM | Earnings-22 | AMI | FLEURS de |
|--------|------:|------:|------:|------:|------:|------:|
| Whistle | 4,31 | 10,49 | 7,61 | 19,01 | 26,07 | k. A.² |
| Moonshine tiny | 4,52 | 11,71 | 5,64 | 21,25 | 22,77 | nur en |
| Whisper base | 4,9 | 11,0 | 5,0 | k. A. | 21,5³ | 17,9 |
| Parakeet TDT 0.6B v3 | 1,93 | 3,59 | 2,75 | 11,42 | 11,31 | 5,04 |
| Nemotron en (1,12 s) | 2,32 | 4,84 | 3,50 | 12,52 | 11,73 | nur en |
| Nemotron 3.5 (1,12 s) | k. A. | k. A. | k. A. | k. A. | k. A. | 8,31 |

² Whistle nennt für FLEURS nur den Schnitt über alle sieben Sprachen: 21,4.
³ AMI-IHM. Whistle zählt bei AMI leere Referenzen mit, wie es das Open ASR
Leaderboard macht.

Quellen: die verlinkten Model Cards, für Whisper base das
[Whisper-Paper](https://arxiv.org/abs/2212.04356) (Tabelle 9 und 13), für
Moonshine das [Moonshine-Paper](https://arxiv.org/abs/2410.15608) (Tabelle 3).
Whistle vergleicht sich im eigenen Chart mit genau diesen Werten.

Whistle liegt ungefähr auf dem Niveau von Whisper base und Moonshine tiny.
Bei LibriSpeech knapp vorn, bei TED-LIUM und AMI hinten. Bei FLEURS ist der
Whisper-base-Balken im Whistle-Chart höher, bei MLS (Multilingual LibriSpeech)
etwas niedriger, Zahlen stehen an diesen Balken aber nicht dran. Interessant
wird es bei der Größe: 17 MB gegen 145 MB bei Whisper base. Dazu kommt die
Geschwindigkeit. Auf einem M4 Pro misst Cactus 11,1 ms bis zum ersten Token
und 1.319 Token pro Sekunde. Whisper base kommt auf 73,2 ms und 266 Token/s,
Moonshine tiny auf 22,8 ms und 262 Token/s. Auch das sind Herstellerzahlen.

Bei der Genauigkeit liegen Parakeet und Whistle weit auseinander. Wenn ich
Parakeets eigene FLEURS-Werte über die sieben Whistle-Sprachen mittle, komme
ich auf etwa 5,2, Whistle liegt bei 21,4. Selbst mit einem großzügigen
Abschlag für unterschiedliche Messmethoden bleibt da ungefähr der Faktor
vier. Dafür ist Parakeet über 40-mal so groß.

Nemotron ist auf Streaming ausgelegt: ein Cache-aware FastConformer mit
RNN-T-Decoder, der nur neue Audio-Chunks rechnet und den Encoder-Kontext im
Cache behält. Die Chunk-Größe wählt man zur Laufzeit zwischen 80 ms und
1,12 s. Bei der englischen Version steigt die durchschnittliche WER dabei von
6,93 auf 8,43, wenn man von 1,12 s auf 80 ms runtergeht. Bei Nemotron 3.5 auf
Deutsch (FLEURS) sind es 8,31 und 9,81.

Für den Browser gibt es noch zwei Alternativen. Die Web Speech API kann in
Chrome inzwischen auf dem Gerät erkennen, aber nur, wenn man
[`processLocally`](https://developer.mozilla.org/docs/Web/API/SpeechRecognition/processLocally)
auf `true` setzt. Ohne das entscheidet der Browser selbst, und das Audio geht
im Zweifel an einen Server.

Für Parakeet gibt es außerdem einen
[Community-Port auf ONNX](https://huggingface.co/striimit/parakeet-tdt-0.6b-v3-webgpu),
der mit onnxruntime-web auf WebGPU läuft. Der Encoder ist fp16 und 1,24 GB
groß, weil die int8-Variante unter WebGPU falsche Ergebnisse liefert. Die
Positions-Embeddings reichen für etwa 35 Sekunden, längere Aufnahmen muss man
selbst stückeln, und das TDT-Decoding schreibt man auch selbst. Machbar, aber
ein anderes Kaliber als 17 MB.

## Was ich wofür nehmen würde

Für alles, was im Browser oder auf kleiner Hardware ohne GPU laufen soll,
nehme ich Whistle: Diktat, kurze Sprachbefehle, eine Suchleiste mit Mikrofon,
Untertitel für eigene kurze Clips. 17 MB Download sind da noch okay, 700 MB
nicht. Ein dauerhaft offenes Mikrofon würde ich aber nur mit VAD davor
betreiben.

Steht ein Server mit NVIDIA-GPU bereit und zählt Genauigkeit, ist Parakeet die
bessere Wahl. Bei langen Meetings oder Interviews, deren Transkript später
wirklich jemand liest, sind 26 % WER auf AMI einfach zu viel. Für Deutsch und
die anderen europäischen Sprachen ist Parakeet von den offenen Modellen, die
ich mir angeschaut habe, das genaueste.

Nemotron lohnt sich, sobald es auf Latenz ankommt, etwa bei einem Voice Agent,
der schon antwortet, während man noch spricht. Dann die en-Version für
Englisch und 3.5 für den Rest.

Und Whisper bleibt die Wahl, wenn eine Sprache gebraucht wird, die keins der
anderen kann. 99 Sprachen schafft sonst niemand hier, und das Ökosystem
drumherum ist riesig.

Für den PoC bleibe ich bei Whistle. Die Seite lädt einmal gut 17 MB und
funktioniert danach im Flugzeug.
