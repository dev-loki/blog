# Speaker diarization files

Loaded by `../../diarize.js` only when the page's `[ speakers ]` toggle is on.

| file | source | license |
|---|---|---|
| `sherpa-onnx-wasm-main-speaker-diarization.wasm` | [sherpa-onnx v1.13.7](https://github.com/k2-fsa/sherpa-onnx/releases/tag/v1.13.7), `sherpa-onnx-wasm-simd-v1.13.7-speaker-diarization.tar.bz2`, unchanged. Contains onnxruntime 1.27.1. | Apache-2.0 (`LICENSE`), onnxruntime MIT (`LICENSE-onnxruntime`) |
| `sherpa-onnx-wasm-main-speaker-diarization.js` | same archive, **modified**: the emscripten file-packager block at the top is removed (see below) | Apache-2.0 |
| `sherpa-onnx-speaker-diarization.js` | same archive, unchanged | Apache-2.0 |
| `pyannote-segmentation-3.0.int8.onnx` | [csukuangfj/sherpa-onnx-pyannote-segmentation-3-0](https://huggingface.co/csukuangfj/sherpa-onnx-pyannote-segmentation-3-0) `model.int8.onnx`, unchanged, converted from [pyannote/segmentation-3.0](https://huggingface.co/pyannote/segmentation-3.0) | MIT (`LICENSE-pyannote`) |
| `3dspeaker-campplus-zh-en-advanced.fp16w.onnx` | sherpa-onnx release [speaker-recongition-models](https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-recongition-models) `3dspeaker_speech_campplus_sv_zh_en_16k-common_advanced.onnx` (sha256 `aa3cfc16...0ceba2`), from [3D-Speaker](https://github.com/modelscope/3D-Speaker) CAM++, **modified**: weights stored as float16 (see below) | Apache-2.0 (`LICENSE`) |

## Changes

The release glue fetches a 45 MB `.data` file with its own bundled models. The block that starts at
`if(!Module["expectedDataFileDownloads"])` and ends at `remote_package_size:45587685})})();` is cut out,
and `diarize.js` writes the two models above into the emscripten FS in `preRun` instead.

```python
import re, sys
src = open(sys.argv[1]).read()
a = src.index('if(!Module["expectedDataFileDownloads"])')
m = re.compile(r'remote_package_size:\d+\}\)\}\)\(\);').search(src, a)
open(sys.argv[2], "w").write(src[:a] + src[m.end():])
```

The embedding model's float32 weights (28 MB) are stored as float16 with a `Cast` back to float32 in front,
so the file is 14 MB and the math stays float32. On the test clips the speaker turns came out identical.

```python
import sys, numpy as np, onnx
from onnx import helper, numpy_helper, TensorProto
m = onnx.load(sys.argv[1]); g = m.graph; init, casts = [], []
for t in g.initializer:
    a = numpy_helper.to_array(t)
    if t.data_type == TensorProto.FLOAT and a.size >= 256:
        h = numpy_helper.from_array(a.astype(np.float16), t.name + "_fp16")
        init.append(h); casts.append(helper.make_node("Cast", [h.name], [t.name], to=TensorProto.FLOAT))
    else:
        init.append(t)
del g.initializer[:]; g.initializer.extend(init)
nodes = casts + list(g.node); del g.node[:]; g.node.extend(nodes)
onnx.save(m, sys.argv[2])
```

Why this embedding model: on two German TTS test clips (Anna/Eddy and Flo/Eddy, four turns each) the
CAM++ zh_en "advanced" model and NeMo SpeakerNet got every turn right at threshold 0.5, while both
VoxCeleb CAM++ models (3D-Speaker and WeSpeaker) merged or split the speakers. NeMo is smaller but its
license is less clear, so CAM++ it is.
