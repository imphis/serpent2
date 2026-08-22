(function () {
  const downloadbtn = document.getElementById('downloadbtn');
  const downloadoverlay = document.getElementById('downloadoverlay');
  const downloadclose = document.getElementById('downloadclose');
  const downloadchoices = document.querySelectorAll('.dlplatformchoice');

  let currentview = null;

  function setview(viewname) {
    if (viewname === currentview) return;
    currentview = viewname;

    document.querySelectorAll('.view').forEach((viewel) => {
      viewel.classList.toggle('isactive', viewel.id === 'view' + viewname);
    });

    document.querySelectorAll('.navlinks a').forEach((linkel) => {
      linkel.classList.toggle('active', linkel.id === 'nav' + viewname);
    });

    if (typeof window.resetnavunderline === 'function') {
      window.resetnavunderline();
    }
  }

  function viewfromhash() {
    const name = window.location.hash.replace('#', '');
    return document.getElementById('view' + name) ? name : 'home';
  }

  function syncfromhash() {
    setview(viewfromhash());
  }

  window.addEventListener('hashchange', syncfromhash);

  syncfromhash();

  if (downloadbtn && downloadoverlay) {
    downloadbtn.addEventListener('click', () => {
      downloadoverlay.classList.add('open');
    });
  }

  if (downloadclose && downloadoverlay) {
    downloadclose.addEventListener('click', () => {
      downloadoverlay.classList.remove('open');
    });
  }

  downloadchoices.forEach((choiceel) => {
    choiceel.addEventListener('click', () => {
      downloadoverlay.classList.remove('open');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && downloadoverlay && downloadoverlay.classList.contains('open')) {
      downloadoverlay.classList.remove('open');
    }
  });
})();
