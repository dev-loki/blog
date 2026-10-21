+++
title = "Speech recognition in 17 MB, entirely in the browser"
date = "2026-10-21T17:00:00Z"
description = "Cactus Compute released Whistle, a speech-to-text model that fits in a 17 MB file and runs without a GPU. I packed it into the browser as WebAssembly and compared it with Parakeet, Nemotron, Whisper and Moonshine."
[taxonomies]
tags = ["ki", "tooling"]
+++

*(Translation was done by AI. Sorry :/)*

<!-- TODO Torsten: add your own experience to the intro. -->

Until now, speech recognition mostly meant one of two things: send the audio
to a server, or run a local model that weighs a few hundred megabytes and
really wants a GPU. On October 2, Cactus Compute released
[Whistle](https://cactuscompute.com/blog/whistle). The whole model is a single
16.9 MB file, and it runs on the CPU.

At 17 MB the obvious question was: does this work in the browser, with no
server and without the audio ever leaving the tab? It does. The PoC took one
evening and lives here: [loki.dev/lab/whistle](/lab/whistle/).

## What Whistle is

Whistle runs on the same engine as
[Needle](https://huggingface.co/Cactus-Compute/needle3), the small
tool-calling model Cactus put out in May. Both share the `.cact` container
format, the quantisation (Cactus Quants, 2 to 4 bit) and the SIMD kernels.
There are no dependencies and no GPU is needed. The license is Apache 2.0.

According to the [model card](https://huggingface.co/Cactus-Compute/whistle),
Whistle understands seven languages: English, German, French, Spanish,
Italian, Dutch and Polish. If you don't name one, it detects it. It handles up
to 30 seconds in one pass and splits longer recordings into windows. For every
word it returns start, end and a probability, taken from the decoder's
attention. A keyword list lets you push names and jargon.

In live mode it transcribes while you talk and only commits the words two
passes agree on. If you don't need a transcript at all, you get the encoder
output as an embedding, one row per 80 ms, for something like search over
audio.

Cactus lists the limits themselves. Silence and steady noise give you an empty
transcript instead of an invented sentence. Music, on the other hand, can
still come out as text. If you leave a microphone open all the time, put a
voice activity detector or a wake word in front of it.

The [Hacker News thread](https://news.ycombinator.com/item?id=50008427) has
reports you won't find in the model card. The most striking one: a user ran it
on a TV episode and got nothing but "Thank you." in several places, once for
60 seconds of dialogue in a row. Polish is apparently only usable if you speak
loud, clear and slow, and with a Flemish accent Whistle kept guessing between
Dutch and German.

## How the PoC works

Cactus also ships the engine as a WebAssembly build: `needle.js` plus
`needle.wasm`, just under 1 MB together, 0.4 MB over the wire with gzip. Add `whistle.cact` to that. All of
it is hosted on loki.dev itself, so there are no requests to Hugging Face or a
CDN.

Everything heavy runs in a Web Worker so the page doesn't freeze. The worker
fetches engine and model as an `ArrayBuffer`, copies the model into
WebAssembly memory and loads it:

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

The `wasmBinary` is needed because the build ignores `locateFile` and would
otherwise look for the `.wasm` file in the wrong place.

After that, transcribing is a single C call through `ccall`. The samples go in
as a pointer, language and keywords as strings, and the result comes back as
JSON in a buffer reserved up front:

```js
const out = call('needle_transcribe', [...T, 'number', 'number', 'number'], [
  p, m.pcm.length, m.language || null, m.keywords || null, m.words ? 1 : 0, outPtr, OUT_CAP,
]);
```

`call` is a small wrapper around `M.ccall` that checks the return code and
reads the buffer with `JSON.parse`.

Whistle wants 16 kHz mono as a `Float32Array`. For the microphone, the browser
handles that: `new AudioContext({ sampleRate: 16000 })` resamples the mic
signal by itself. For files I first decode with `decodeAudioData` and then
render the result through an `OfflineAudioContext` with one channel at
16 kHz. That downmixes to mono and resamples in one step. Videos work too, as
long as the browser can decode the audio track.

In live mode there is only ever one pass in flight. As soon as a second of
audio has piled up and the worker is free, the buffer goes to
`needle_stream_transcribe_process`. Whatever arrives in the meantime goes into
the next pass. What comes back is the committed words plus a tentative tail,
which I show dimmed. On stop, `needle_stream_transcribe_stop` collects the
rest. Words the model is less than 60 % sure about get a dotted underline, and
the timestamps sit in the tooltip.

A service worker caches the page, the worker, the engine and the model. After
the first visit the page works in airplane mode. The audio never leaves the
tab, which you can check in the network tab of the DevTools.

<!-- TODO Torsten: confirm your own measurements (load time, RTF) and turn
them into a paragraph. Suggestion from a run in the Claude browser pane on
your Mac (Chromium, WASM, one worker), not yet checked by you:
- Model load: 86 ms from localhost, 655 ms from loki.dev (warm HTTP)
- Test clip: 6.8 s of German macOS TTS (voice Anna): "Ich baue meinen Blog mit
  Zola und deploye ihn per rsync auf Uberspace. Die Spracherkennung läuft
  komplett im Browser."
- No keywords: 502 ms, RTF 0.073, TTFT 125 ms, 196 tok/s. Output: "Ich baue
  meinen Block mit Solar- und Deckläuer-Interrünk auf Oberspasse, die
  Sprachörkennung läuft komplett im Brauser."
- Keywords Zola/Uberspace/rsync: 449 ms, RTF 0.066. Output: "...Block mit
  Solar- und Deckläuer in Parünk auf Uberspace, die Spracherkennung läuft
  komplett im Brauser." Biasing fixed Uberspace and Spracherkennung, not Zola
  or rsync.
- Live streaming gives the same text as the clip.
- Caveats: synthetic voice, English tech words inside German, and 196 tok/s in
  the browser is far below the 1,319 tok/s Cactus reports for the native
  engine on an M4 Pro.
-->

## The comparison

Up front: all numbers come from the vendors. Everyone measures with their own
setup, partly with different normalizers and scoring rules. The tables are
good enough for orders of magnitude, not for a ranking down to the decimal.

First, the fact sheets:

| Model | Download | Languages | License | Runs on |
|-------|----------|-----------|---------|---------|
| [Whistle](https://huggingface.co/Cactus-Compute/whistle) | 16.9 MB | 7, incl. German | Apache 2.0 | CPU, WebAssembly too |
| [Moonshine tiny](https://huggingface.co/UsefulSensors/moonshine-tiny) | 41.9 MB¹ | English only | MIT | CPU |
| [Whisper base](https://github.com/openai/whisper) | 145 MB¹ | 99 | MIT | CPU, GPU |
| [Parakeet TDT 0.6B v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3) | 714 MB (GGUF q8_0) | 25 European | CC-BY-4.0 | NVIDIA GPU with NeMo, locally via NeMo-Speech.cpp |
| [Nemotron Speech Streaming en 0.6B](https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b) | 700 MB (GGUF q8_0) | English only | NVIDIA Open Model License | same as Parakeet |
| [Nemotron 3.5 ASR Streaming 0.6B](https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b) | 742 MB (GGUF q8_0) | 40 locales, incl. de-DE | OpenMDW-1.1 | same as Parakeet, plus an ONNX export (int4) |

¹ Size from Whistle's benchmark chart. The NVIDIA models have 600 million
parameters each and weigh about 2.5 GB as `.nemo` files.

Then the word error rates (WER in %, lower is better):

| Model | LibriSpeech clean | LibriSpeech other | TED-LIUM | Earnings-22 | AMI | FLEURS de |
|-------|------:|------:|------:|------:|------:|------:|
| Whistle | 4.31 | 10.49 | 7.61 | 19.01 | 26.07 | n/a² |
| Moonshine tiny | 4.52 | 11.71 | 5.64 | 21.25 | 22.77 | en only |
| Whisper base | 4.9 | 11.0 | 5.0 | n/a | 21.5³ | 17.9 |
| Parakeet TDT 0.6B v3 | 1.93 | 3.59 | 2.75 | 11.42 | 11.31 | 5.04 |
| Nemotron en (1.12 s) | 2.32 | 4.84 | 3.50 | 12.52 | 11.73 | en only |
| Nemotron 3.5 (1.12 s) | n/a | n/a | n/a | n/a | n/a | 8.31 |

² For FLEURS, Whistle only gives the average over all seven languages: 21.4.
³ AMI-IHM. Whistle counts empty references on AMI, the way the Open ASR
Leaderboard does.

Sources: the linked model cards, for Whisper base the
[Whisper paper](https://arxiv.org/abs/2212.04356) (tables 9 and 13), for
Moonshine the [Moonshine paper](https://arxiv.org/abs/2410.15608) (table 3).
Whistle's own chart compares against exactly these values.

Whistle is roughly on par with Whisper base and Moonshine tiny. Slightly
ahead on LibriSpeech, behind on TED-LIUM and AMI. In Whistle's chart, the
Whisper base bar is higher on FLEURS and a bit lower on MLS (Multilingual
LibriSpeech), but those bars carry no numbers. It gets interesting with size:
17 MB against 145 MB for Whisper base. Then there's speed. On an M4 Pro,
Cactus measures 11.1 ms to the first token and 1,319 tokens per second.
Whisper base gets 73.2 ms and 266 tokens/s, Moonshine tiny 22.8 ms and 262
tokens/s. Vendor numbers again.

On accuracy, Parakeet and Whistle are far apart. If I average Parakeet's own
FLEURS results over Whistle's seven languages, I get about 5.2, while Whistle
is at 21.4. Even with a generous allowance for different measuring methods,
that leaves roughly a factor of four. Then again, Parakeet is more than 40
times the size.

Nemotron is designed for streaming: a cache-aware FastConformer with an RNN-T
decoder that only computes new audio chunks and keeps the encoder context
cached. You pick the chunk size at runtime, from 80 ms to 1.12 s. For the
English version, the average WER goes from 6.93 to 8.43 when you drop from
1.12 s to 80 ms. For Nemotron 3.5 on German (FLEURS) it's 8.31 and 9.81.

There are two more options for the browser. Chrome's Web Speech API can now
recognize speech on the device, but only if you set
[`processLocally`](https://developer.mozilla.org/docs/Web/API/SpeechRecognition/processLocally)
to `true`. Without it, the browser decides for itself, and the audio may well
end up on a server.

For Parakeet there's also a
[community ONNX port](https://huggingface.co/striimit/parakeet-tdt-0.6b-v3-webgpu)
that runs on WebGPU through onnxruntime-web. The encoder is fp16 and 1.24 GB,
because the int8 variant gives wrong results under WebGPU. The position
embeddings cover about 35 seconds, so you chunk longer recordings yourself,
and you write the TDT decoding yourself too. Doable, but a different calibre
than 17 MB.

## What I'd use for what

For anything that has to run in the browser or on small hardware without a
GPU, I'd take Whistle: dictation, short voice commands, a search bar with a
mic button, subtitles for your own short clips. A 17 MB download is fine
there, 700 MB is not. I'd only run an always-open microphone with a VAD in
front, though.

If there's a server with an NVIDIA GPU and accuracy matters, Parakeet is the
better choice. For long meetings or interviews whose transcript someone will
actually read, 26 % WER on AMI is just too much. For German and the other
European languages, Parakeet is the most accurate of the open models I've
looked at.

Nemotron pays off once latency matters, say for a voice agent that starts
answering while you're still talking. Then the en version for English and 3.5
for the rest.

And Whisper stays the pick when you need a language none of the others
support. Nobody else here does 99 languages, and the ecosystem around it is
huge.

As for the PoC, I'm sticking with Whistle. The page loads a little over 17 MB once and then
works on a plane.
