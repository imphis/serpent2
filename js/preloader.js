(function () {
  const preloaderel = document.getElementById('preloader');
  if (!preloaderel) return;

  const starttime = Date.now();
  let finished = false;

  function hidepreloader() {
    if (finished) return;
    finished = true;

    const remaining = 500 - (Date.now() - starttime);

    setTimeout(() => {
      preloaderel.classList.add('done');
      setTimeout(() => {
        if (preloaderel.parentNode) {
          preloaderel.parentNode.removeChild(preloaderel);
        }
      }, 650);
    }, Math.max(0, remaining));
  }

  window.addEventListener('load', hidepreloader);
  setTimeout(hidepreloader, 4500);
})();
