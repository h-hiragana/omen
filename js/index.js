let mask = null;

let detecting = false;

$(function() {
  // Video
  setupCameraStream((stream) => {
    let video = document.getElementById('video');
    video.srcObject = stream;
    video.onloadedmetadata = (e) => {
      video.play();

      // Update開始
      setInterval(update, 10);
    };
  });

  // Face API
  faceapi.nets.tinyFaceDetector.load("lib/face-api/weights/");
  faceapi.nets.faceLandmark68Net.load("lib/face-api/weights/");

  // Mask
  mask = new Mask('mask', './img/anpanman.png', 1.3);

  // 画像入力
  document.getElementById('image-input').addEventListener('change', function (e) {
    let fr = new FileReader();
    fr.addEventListener('load', () => mask.setImage(fr.result));
    fr.readAsDataURL(e.srcElement.files[0]);
  });
});

function update() {
  if (detecting) return;
  detecting = true;

  detectFaceAsync().then(results => {
    if (results && results.length > 0) {
      let r = results[0];
      let v = document.getElementById("video");
      let vw = v.videoWidth;
      let vh = v.videoHeight;

      if (window.innerWidth > window.innerHeight * vw / vh) {
        let s = window.innerHeight / vh;
        let mx = (window.innerWidth - vw * s) / 2;

        // Mask Update
        mask.update(r._box.x * s + mx, r._box.y * s, r._box.width * s, r._box.height * s);
      } else {
        let s = window.innerWidth / vw;
        let my = (window.innerHeight - vh * s) / 2;

        // Mask Update
        mask.update(r._box.x * s, r._box.y * s + my, r._box.width * s, r._box.height * s);
      }
    } else {
      mask.hide();
    }

    detecting = false;
  });
}

async function detectFaceAsync() {
  const results = await faceapi.detectAllFaces(
    video,
    new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.1
    })
  );
  return results;
}

function setupCameraStream(completion) {
  if (!videoValidate()) return;

  navigator.mediaDevices.getUserMedia({audio: false, video: {width: 1280, height: 720, facingMode: 'environment'}}).then((stream) => {
    if (completion) completion(stream);
  }).catch((e) => {
    console.log(e.name + ': ' + e.message);
  });
}

function videoValidate() {
  navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
     getUserMedia: (c) => {
       return new Promise((y, n) => {
         (navigator.mozGetUserMedia ||
          navigator.webkitGetUserMedia).call(navigator, c, y, n);
       });
     }
  } : null);

  if (!navigator.mediaDevices) {
    console.log('getUserMedia() not supported.');
    return false;
  }

  return true;
}
