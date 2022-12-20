document.addEventListener('DOMContentLoaded', () => {
  const { ipcRenderer } = require('electron');

  ipcRenderer.on('update-dest-path', (event, dest) => {
    document.querySelector('#dest-path').value = dest;
  });

  function choosePath() {
    ipcRenderer.invoke('show-dialog').then(dest => {
      document.querySelector('#dest-path').value = dest;
    });
  }

  (function() {
    const choosePathBtn = document.querySelector('#choose-path-btn');
    choosePathBtn.addEventListener('click', choosePath);
  })();
});
