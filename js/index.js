let masks = [];

let detecting = false;

$(function() {
  // Video
  setupCameraStream((stream) => {
    let video = document.getElementById('video');
    video.srcObject = stream;
    video.onloadedmetadata = (e) => {
      video.play();

      // Update開始
      setInterval(update, 5);
    };
  });

  // Face API
  faceapi.nets.tinyFaceDetector.load("lib/face-api/weights/");
  faceapi.nets.faceLandmark68Net.load("lib/face-api/weights/");

  // Mask
  for (let i = 0; i < 10; i++) {
    let mask = new Mask('mask' + (i + 1), './img/santa.png', 1.3);
    masks.push(mask);
  }

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
    if (results.length > 0) {
      let lostMasks = masks.concat();
      results.forEach(r => {
        let v = document.getElementById("video");
        let vw = v.videoWidth;
        let vh = v.videoHeight;

        if (window.innerWidth > window.innerHeight * vw / vh) {
          let s = window.innerHeight / vh;
          let mx = (window.innerWidth - vw * s) / 2;

          let x = r._box.x * s + mx;
          let y = r._box.y * s;
          let w = r._box.width * s;
          let h = r._box.height * s;

          let mask = lostMasks.sort((m1, m2) => m1.dist(x, y, w, h) - m2.dist(x, y, w, h))[0];
          lostMasks.shift();

          // Mask Update
          mask.update(x, y, w, h);
        } else {
          let s = window.innerWidth / vw;
          let my = (window.innerHeight - vh * s) / 2;

          let x = r._box.x * s;
          let y = r._box.y * s + my;
          let w = r._box.width * s;
          let h = r._box.height * s;

          let mask = lostMasks.sort((m1, m2) => m1.dist(x, y, w, h) - m2.dist(x, y, w, h))[0];
          lostMasks.shift();

          // Mask Update
          mask.update(x, y, w, h);
        }
      });

      lostMasks.forEach(m => m.hide());
    } else {
      masks.forEach(m => m.hide());
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
