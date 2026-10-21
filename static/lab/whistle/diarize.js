// Speaker diarization after the fact: sherpa-onnx wasm with pyannote segmentation 3.0,
// CAM++ speaker embeddings and fast clustering. Only started when [ speakers ] is on.
// Messages in:  {id, pcm, speakers}   (speakers -1 = unknown, decided by the clustering threshold)
// Messages out: {type:'ready', loadMs} | {type:'result', id, segs: [{start, end, speaker}], ms}
//               {type:'error', id, message}
const V = 'vendor/sherpa/';
let sd;

const ready = (async () => {
  const t = performance.now();
  const [wasm, seg, emb] = await Promise.all(
    ['sherpa-onnx-wasm-main-speaker-diarization.wasm', 'pyannote-segmentation-3.0.int8.onnx', '3dspeaker-campplus-zh-en-advanced.fp16w.onnx']
      .map((f) => fetch(V + f).then((r) => r.arrayBuffer())),
  );
  await new Promise((resolve) => {
    self.Module = {
      wasmBinary: wasm,
      preRun: [() => {
        Module.FS_createDataFile('/', 'seg.onnx', new Uint8Array(seg), true, false, false);
        Module.FS_createDataFile('/', 'emb.onnx', new Uint8Array(emb), true, false, false);
      }],
      onRuntimeInitialized: resolve,
    };
    importScripts(`${V}sherpa-onnx-wasm-main-speaker-diarization.js`, `${V}sherpa-onnx-speaker-diarization.js`);
  });
  sd = createOfflineSpeakerDiarization(Module, {
    segmentation: { pyannote: { model: '/seg.onnx' } },
    embedding: { model: '/emb.onnx' },
    // ponytail: 0.5 split both TTS test pairs, 0.6 already merged Flo and Eddy; a known count overrides it
    clustering: { numClusters: -1, threshold: 0.5 },
    minDurationOn: 0.3,
    minDurationOff: 0.5,
  });
  postMessage({ type: 'ready', loadMs: Math.round(performance.now() - t) });
})().catch((e) => postMessage({ type: 'error', message: String(e) }));

onmessage = async ({ data: m }) => {
  await ready;
  const t = performance.now();
  try {
    sd.setConfig({ ...sd.config, clustering: { numClusters: m.speakers, threshold: 0.5 } });
    postMessage({ type: 'result', id: m.id, segs: sd.process(m.pcm), ms: performance.now() - t });
  } catch (e) {
    postMessage({ type: 'error', id: m.id, message: String(e) });
  }
};
