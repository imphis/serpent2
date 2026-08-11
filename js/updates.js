(function () {
  const feedurl = 'https://raw.githubusercontent.com/setidentity/serpent/refs/heads/main/info.json';

  const platformlist = [
    {
      key: 'Serpent',
      label: 'Windows',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.5 10.4 4.5V11.4H3V5.5ZM11.3 4.4 21 3V11.3H11.3V4.4ZM3 12.4H10.4V19.4L3 18.4V12.4ZM11.3 12.4H21V20.8L11.3 19.5V12.4Z"/></svg>'
    },
    {
      key: 'SerpentAndroid',
      label: 'Android',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 9.48 19.44 6.3a.41.41 0 0 0-.15-.56.4.4 0 0 0-.55.15l-1.86 3.22a11 11 0 0 0-9.76 0L5.26 5.89a.4.4 0 0 0-.55-.15.41.41 0 0 0-.15.56L6.4 9.48A10.3 10.3 0 0 0 1.5 17h21a10.3 10.3 0 0 0-4.9-7.52ZM7 14.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"/></svg>'
    }
  ];

  const tabsel = document.getElementById('platformtabs');
  const listel = document.getElementById('changeloglist');

  let feedcache = null;
  let activekey = platformlist[0].key;
  let loaded = false;

  function formattimestamp(isostring) {
    const date = new Date(isostring);
    if (Number.isNaN(date.getTime())) return isostring;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function groupbyplatform(feed) {
    const groups = { Serpent: [], SerpentAndroid: [] };

    for (const entry of feed.changelogs || []) {
      groups.Serpent.push(entry);
    }

    for (const entry of feed.androidchangelogs || []) {
      groups.SerpentAndroid.push(entry);
    }

    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    return groups;
  }

  function buildtabs(groups) {
    tabsel.innerHTML = '';

    for (const tab of platformlist) {
      const tabbtn = document.createElement('button');
      tabbtn.type = 'button';
      tabbtn.className = 'platformchoice' + (tab.key === activekey ? ' active' : '');
      tabbtn.setAttribute('data-platform', tab.key === 'Serpent' ? 'windows' : 'android');
      tabbtn.setAttribute('aria-label', tab.label);
      tabbtn.title = tab.label;
      tabbtn.innerHTML = `${tab.svg}<span>${tab.label}</span>`;
      tabbtn.addEventListener('click', () => {
        activekey = tab.key;
        buildtabs(groups);
        renderchangelogs(groups[tab.key]);
      });
      tabsel.appendChild(tabbtn);
    }
  }

  function renderchangelogs(entries) {
    listel.classList.remove('changelogfade');
    void listel.offsetWidth;
    listel.classList.add('changelogfade');
    listel.innerHTML = '';

    if (!entries.length) {
      const emptyel = document.createElement('div');
      emptyel.className = 'changelogempty';
      emptyel.textContent = 'No changelogs published for this platform yet.';
      listel.appendChild(emptyel);
      return;
    }

    entries.forEach((entry, index) => {
      const entryel = document.createElement('div');
      entryel.className = 'changelogentry';
      entryel.style.setProperty('--entryindex', Math.min(index, 10));

      const headerel = document.createElement('div');
      headerel.className = 'changelogentryheader';

      const versionel = document.createElement('span');
      versionel.className = 'changelogversion';
      versionel.textContent = entry.title || entry.version_id;
      headerel.appendChild(versionel);

      if (index === 0) {
        const badgeel = document.createElement('span');
        badgeel.className = 'changelogbadge latest';
        badgeel.textContent = 'Latest';
        headerel.appendChild(badgeel);
      }

      const dateel = document.createElement('span');
      dateel.className = 'changelogdate';
      dateel.textContent = formattimestamp(entry.timestamp);
      headerel.appendChild(dateel);

      entryel.appendChild(headerel);

      const descel = document.createElement('p');
      descel.className = 'changelogdescription';
      descel.textContent = entry.description || '';
      entryel.appendChild(descel);

      listel.appendChild(entryel);
    });
  }

  async function loadfeed() {
    if (feedcache) return feedcache;

    const response = await fetch(feedurl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

    feedcache = await response.json();
    return feedcache;
  }

  async function activate() {
    if (loaded) return;
    loaded = true;

    listel.innerHTML = '<div class="changelogloading">Loading changelogs&hellip;</div>';

    try {
      const feed = await loadfeed();
      const groups = groupbyplatform(feed);
      buildtabs(groups);
      renderchangelogs(groups[activekey]);
    } catch (error) {
      listel.innerHTML = '';
      const errorel = document.createElement('div');
      errorel.className = 'changelogerror';
      errorel.textContent = 'Could not load changelogs right now. Please try again later.';
      listel.appendChild(errorel);
    }
  }

  window.krebskulmupdates = { activate };
})();
