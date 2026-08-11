function movenavunderline(targetel) {
  const underlineel = document.getElementById('navunderline');
  const containerel = targetel.closest('.navlinks');
  const containerrect = containerel.getBoundingClientRect();
  const targetrect = targetel.getBoundingClientRect();

  underlineel.style.width = targetrect.width + 'px';
  underlineel.style.left = (targetrect.left - containerrect.left) + 'px';
  underlineel.style.opacity = '1';
}

function resetnavunderline() {
  const activeel = document.querySelector('.navlinks a.active');
  const underlineel = document.getElementById('navunderline');

  if (activeel) {
    movenavunderline(activeel);
  } else {
    underlineel.style.opacity = '0';
  }
}

const navlinksel = document.querySelector('.navlinks');
const linkelements = document.querySelectorAll('.navlinks a');

linkelements.forEach((linkel) => {
  linkel.addEventListener('mouseenter', () => movenavunderline(linkel));
});

navlinksel.addEventListener('mouseleave', resetnavunderline);
window.addEventListener('load', resetnavunderline);
window.addEventListener('resize', resetnavunderline);
