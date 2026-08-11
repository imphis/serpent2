(function () {
  const paymentmethods = [
    { name: 'Visa', file: 'visa.svg' },
    { name: 'Mastercard', file: 'mastercard.svg' },
    { name: 'American Express', file: 'amex.svg' },
    { name: 'Discover', file: 'discover.svg' },
    { name: 'Apple Pay', file: 'applepay.svg' },
    { name: 'Google Pay', file: 'googlepay.svg' },
    { name: 'Amazon Pay', file: 'amazonpay.svg' },
    { name: 'PayPal', file: 'paypal.svg' },
    { name: 'Klarna', file: 'klarna.svg' },
    { name: 'Alipay', file: 'alipay.svg' }
  ];

  let tooltipel = null;

  function gettooltip() {
    if (tooltipel) return tooltipel;

    tooltipel = document.createElement('div');
    tooltipel.className = 'paymenttooltip';
    document.body.appendChild(tooltipel);
    return tooltipel;
  }

  function positiontooltip(event) {
    if (!tooltipel) return;
    tooltipel.style.left = `${event.clientX}px`;
    tooltipel.style.top = `${event.clientY - 14}px`;
  }

  function showtooltip(text, event) {
    const el = gettooltip();
    el.textContent = text;
    el.classList.add('isvisible');
    positiontooltip(event);
  }

  function hidetooltip() {
    if (!tooltipel) return;
    tooltipel.classList.remove('isvisible');
  }

  function buildpaymentitem(method) {
    const itemel = document.createElement('div');
    itemel.className = 'paymentitem';
    itemel.setAttribute('aria-label', method.name);
    itemel.setAttribute('tabindex', '0');

    const imgel = document.createElement('img');
    imgel.src = `images/payments/${method.file}`;
    imgel.alt = method.name;
    imgel.className = 'paymenticon';
    imgel.loading = 'lazy';
    itemel.appendChild(imgel);

    itemel.addEventListener('mouseenter', (event) => showtooltip(method.name, event));
    itemel.addEventListener('mousemove', positiontooltip);
    itemel.addEventListener('mouseleave', hidetooltip);
    itemel.addEventListener('focus', () => {
      const rect = itemel.getBoundingClientRect();
      showtooltip(method.name, { clientX: rect.left + rect.width / 2, clientY: rect.top });
    });
    itemel.addEventListener('blur', hidetooltip);

    return itemel;
  }

  function renderpaymentsmarquee() {
    const trackel = document.getElementById('paymentstrack');
    if (!trackel) return;

    const fragment = document.createDocumentFragment();
    for (const method of paymentmethods) {
      fragment.appendChild(buildpaymentitem(method));
    }
    trackel.appendChild(fragment);

    const duplicatefragment = document.createDocumentFragment();
    for (const method of paymentmethods) {
      duplicatefragment.appendChild(buildpaymentitem(method));
    }
    trackel.appendChild(duplicatefragment);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderpaymentsmarquee);
  } else {
    renderpaymentsmarquee();
  }
})();
