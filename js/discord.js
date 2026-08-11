(function () {
  const tokenkey = 'discordtoken';
  const userkey = 'discorduser';

  const wrapel = document.getElementById('signinwrap');
  const btnel = document.getElementById('signinbtn');

  function buildauthurl() {
    const params = new URLSearchParams();
    params.set('client_id', '1536528675271475241');
    params.set('response_type', 'token');
    params.set('redirect_uri', window.location.href.split('#')[0]);
    params.set('scope', 'identify');
    return 'https://discord.com/api/oauth2/authorize?' + params.toString();
  }

  function openauthwindow() {
    const width = 560;
    const height = 760;
    window.open(buildauthurl(), 'discordoauth', 'width=' + width + ',height=' + height + ',left=' + (window.screenX + (window.outerWidth - width) / 2) + ',top=' + (window.screenY + (window.outerHeight - height) / 2) + ',popup=yes');
  }

  async function fetchuser(token) {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!response.ok) throw new Error('failed to fetch user');
    return response.json();
  }

  function avatarurl(user) {
    if (user.avatar) {
      return 'https://cdn.discordapp.com/avatars/' + user.id + '/' + user.avatar + '.png?size=128';
    }
    return 'https://cdn.discordapp.com/embed/avatars/0.png';
  }

  function getstoreduser() {
    try {
      const raw = localStorage.getItem(userkey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function renderavatar(user) {
    const btn = document.createElement('button');
    btn.className = 'useravatar';
    btn.type = 'button';
    btn.title = 'Signed in as ' + (user.global_name || user.username) + ' - click to sign out';
    btn.setAttribute('aria-label', 'Sign out');

    const img = document.createElement('img');
    img.src = avatarurl(user);
    img.alt = '';
    btn.appendChild(img);

    btn.addEventListener('click', signout);

    wrapel.innerHTML = '';
    wrapel.appendChild(btn);
  }

  function rendersignin() {
    wrapel.innerHTML = '';
    wrapel.appendChild(btnel);
  }

  function signout() {
    localStorage.removeItem(tokenkey);
    localStorage.removeItem(userkey);
    rendersignin();
  }

  function init() {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('access_token');

    if (token) {
      localStorage.setItem(tokenkey, token);
      fetchuser(token)
        .then((user) => {
          localStorage.setItem(userkey, JSON.stringify(user));
          renderavatar(user);
          window.close();
        })
        .catch(() => {
          localStorage.removeItem(tokenkey);
          window.close();
        });
      return;
    }

    if (btnel) {
      btnel.addEventListener('click', openauthwindow);
    }

    const user = getstoreduser();
    if (user) {
      renderavatar(user);
    } else {
      rendersignin();
    }
  }

  window.addEventListener('storage', (event) => {
    if (event.key === userkey && event.newValue) {
      try {
        renderavatar(JSON.parse(event.newValue));
      } catch (error) {}
    }
  });

  window.addEventListener('focus', () => {
    const user = getstoreduser();
    if (user) {
      renderavatar(user);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
