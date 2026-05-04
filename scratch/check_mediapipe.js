const mediapipe = require('@mediapipe/selfie_segmentation');
console.log('Keys:', Object.keys(mediapipe));
console.log('Default keys:', mediapipe.default ? Object.keys(mediapipe.default) : 'no default');
console.log('SelfieSegmentation exists:', !!(mediapipe.SelfieSegmentation || (mediapipe.default && mediapipe.default.SelfieSegmentation)));
