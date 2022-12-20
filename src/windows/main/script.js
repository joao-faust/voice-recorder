document.addEventListener('DOMContentLoaded', () => {
  const { ipcRenderer } = require('electron');

  let isRecording = false;
  let selectedDevice = null;

  navigator.mediaDevices.enumerateDevices().then(devices => {
    const devicesSelect = document.querySelector('#devices');
    devices.forEach(device => {
      if (device.kind === 'audioinput') {
        const option = document.createElement('option');
        if (!selectedDevice) {
          selectedDevice = device.deviceId;
        } 
        option.value = device.deviceId;
        option.textContent = device.label;
        devicesSelect.appendChild(option);
      }
    });
  });

  function updateRecStatus() {
    const recorder = document.querySelector('#recorder');
    const mic = document.querySelector('#mic');
    if (!isRecording) {
      recorder.classList.add('recording');
      mic.classList.add('hide');
    } else {
      recorder.classList.remove('recording');
      mic.classList.remove('hide');
    }
    isRecording = !isRecording;
  }
  
  function updateDevice(e) {
    selectedDevice = e.target.value;
  }

  (function() {
    const devicesSelect = document.querySelector('#devices');
    devicesSelect.addEventListener('change', updateDevice);
  })();

  function formatDuration(duration) {
    let miliSeconds = parseInt((duration % 1000) / 100);
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / 1000 / 60) % 60);
    let hours = Math.floor((duration / 1000 / 60 / 60));

    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    hours = hours < 10 ? '0' + hours : hours;

    return `${hours}:${minutes}:${seconds}.${miliSeconds}`;
  }

  function updateTimer(startTime) {
    const timer = document.querySelector('#timer');
    timer.innerHTML = formatDuration(Date.now() - startTime);
    
    if (isRecording) {
      window.requestAnimationFrame(() => {
        updateTimer(startTime);
      });
    }
  }

  function saveAudio(chunks) {
    const blob = new Blob(chunks, { type: 'audio/ogg;code=opnus' });

    blob.arrayBuffer().then(blob => {
      const buffer = new Buffer(blob, 'binary');
      ipcRenderer.send('save-audio', buffer);
    });
  }

  let mediaRecorder = null;
  function startRecording() {
    if (isRecording) {
      let chunks = [];
      navigator.mediaDevices.getUserMedia({ audio: { deviceId: selectedDevice } })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        
        let startTime = Date.now();
        updateTimer(startTime);
        
        mediaRecorder.ondataavailable = event => {
          chunks.push(event.data);
        }
        mediaRecorder.onstop = () => {
          saveAudio(chunks);
          chunks = []; 
          startTime = 0;
        }
      });
    } else {
      mediaRecorder.stop();
    }  
  }

  (function() {
    const recorder = document.querySelector('#recorder'); 
    recorder.addEventListener('click', () => {
      updateRecStatus();
      startRecording();
    });
  })();
});

window.onload = () => {
  document.body.classList.remove('preload');
}
