(function () {
  const viewels = document.querySelectorAll('.view');
  const navlinks = document.querySelectorAll('.navlinks a[data-view]');
  const platformtabs = document.getElementById('platformtabs');
  const signinwrap = document.getElementById('signinwrap');
  const downloadbtn = document.getElementById('downloadbtn');
  const downloadoverlay = document.getElementById('downloadoverlay');
  const downloadclose = document.getElementById('downloadclose');
  const downloadchoices = document.querySelectorAll('.dlplatformchoice');

  let currentview = 'home';

  function setview(viewname) {
    if (viewname === currentview) return;
    currentview = viewname;

    viewels.forEach((viewel) => {
      viewel.classList.toggle('isactive', viewel.dataset.view === viewname);
    });

    navlinks.forEach((linkel) => {
      linkel.classList.toggle('active', linkel.dataset.view === viewname);
    });

    const onupdates = viewname === 'updates';
    if (platformtabs) platformtabs.hidden = !onupdates;
    if (signinwrap) signinwrap.hidden = onupdates;

    if (onupdates && window.krebskulmupdates) {
      window.krebskulmupdates.activate();
    }

    if (typeof window.resetnavunderline === 'function') {
      window.resetnavunderline();
    }
  }

  navlinks.forEach((linkel) => {
    linkel.addEventListener('click', (event) => {
      event.preventDefault();
      setview(linkel.dataset.view);
    });
  });

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
