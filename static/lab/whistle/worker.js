// Runs the Whistle engine (Cactus needle wasm build) off the main thread.
// Messages in:  {type:'transcribe', id, pcm, language, keywords, words}
//               {type:'stream', pcm, language, keywords} | {type:'stop'}
// Messages out: {type:'ready', loadMs} | {type:'result', id, out, ms}
//               {type:'stream', out, ms} | {type:'stream-end', out} | {type:'error', message}
importScripts('vendor/needle.js');

let M;
let outPtr;
const OUT_CAP = 4 << 20; // ponytail: fixed 4 MB result buffer, enough for ~1 h with word times

const ready = (async () => {
  const t = performance.now();
  const [wasm, cact] = await Promise.all(
    ['vendor/needle.wasm', 'vendor/whistle.cact'].map((u) => fetch(u).then((r) => r.arrayBuffer())),
  );
  // The build ignores locateFile, so hand it the wasm bytes directly.
  M = await createNeedle({ wasmBinary: wasm });
  const p = M._malloc(cact.byteLength);
  M.HEAPU8.set(new Uint8Array(cact), p);
  if (M._needle_load(p, BigInt(cact.byteLength)) < 0) throw new Error(M.UTF8ToString(M._needle_last_error()));
  outPtr = M._malloc(OUT_CAP);
  postMessage({ type: 'ready', loadMs: Math.round(performance.now() - t) });
})().catch((e) => postMessage({ type: 'error', message: String(e) }));

// Copies samples into wasm memory; the caller frees. HEAPU8 is re-read because memory can grow.
function put(pcm) {
  const p = M._malloc(pcm.length * 4);
  new Float32Array(M.HEAPU8.buffer, p, pcm.length).set(pcm);
  return p;
}

function call(name, types, args) {
  const rc = M.ccall(name, 'number', types, args);
  if (rc < 0) throw new Error(`${name}: ${M.UTF8ToString(M._needle_last_error())}`);
  return JSON.parse(M.UTF8ToString(outPtr));
}

const T = ['number', 'number', 'string', 'string'];

onmessage = async ({ data: m }) => {
  await ready;
  const t = performance.now();
  let p = 0;
  try {
    if (m.type === 'transcribe') {
      p = put(m.pcm);
      const out = call('needle_transcribe', [...T, 'number', 'number', 'number'], [
        p, m.pcm.length, m.language || null, m.keywords || null, m.words ? 1 : 0, outPtr, OUT_CAP,
      ]);
      postMessage({ type: 'result', id: m.id, out, ms: performance.now() - t });
    } else if (m.type === 'stream') {
      p = put(m.pcm);
      const out = call('needle_stream_transcribe_process', [...T, 'number', 'number'], [
        p, m.pcm.length, m.language || null, m.keywords || null, outPtr, OUT_CAP,
      ]);
      postMessage({ type: 'stream', out, ms: performance.now() - t });
    } else if (m.type === 'stop') {
      postMessage({ type: 'stream-end', out: call('needle_stream_transcribe_stop', ['number', 'number'], [outPtr, OUT_CAP]) });
    }
  } catch (e) {
    postMessage({ type: 'error', message: String(e) });
  } finally {
    if (p) M._free(p);
  }
};
