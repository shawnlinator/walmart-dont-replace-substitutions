// Sets "Don't replace" for every item in Walmart's "Pick substitutions" sidebar.
// Every query is scoped to that dialog so nothing on the checkout page itself
// (tip, Place order, etc.) is ever clicked.

const HEADER_SEL = 'button[aria-label*="Edit substitution preference"]';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let running = false;
let stopRequested = false;

function findDialog() {
  const closeBtn = document.querySelector('button[aria-label="Close dialog"]');
  const dialog = closeBtn && closeBtn.closest('[role="dialog"]');
  if (dialog && /substitution/i.test(dialog.textContent)) return dialog;
  return [...document.querySelectorAll('[role="dialog"]')].find((d) =>
    /Pick substitutions/i.test(d.textContent)
  );
}

function dontReplaceRadio(dialog, itemName) {
  const key = itemName.slice(0, 20);
  return [...dialog.querySelectorAll('input[type="radio"]')].find((r) => {
    const label = r.getAttribute('aria-label') || '';
    return /^Don't replace/i.test(label) && label.includes(key);
  });
}

async function setAll(setStatus) {
  const dialog = findDialog();
  if (!dialog) {
    setStatus('Open the "Pick substitutions" sidebar first.');
    return;
  }

  const done = new Set();
  const failed = [];
  let ok = 0;

  // Items that are already expanded show up as radios without a header button.
  for (const r of dialog.querySelectorAll('input[type="radio"]')) {
    if (/^Don't replace/i.test(r.getAttribute('aria-label') || '') && !r.checked) {
      r.click();
      await sleep(300);
      ok++;
    }
  }

  while (!stopRequested) {
    const header = [...dialog.querySelectorAll(HEADER_SEL)].find(
      (b) => !done.has(b.getAttribute('aria-label'))
    );
    if (!header) break;

    const label = header.getAttribute('aria-label');
    done.add(label);
    const name = label.split('Edit substitution preference for ')[1] || '';

    header.scrollIntoView({ block: 'center' });
    header.click();
    await sleep(1200);

    const radio = dontReplaceRadio(dialog, name);
    if (radio && !radio.checked) {
      radio.scrollIntoView({ block: 'center' });
      radio.click();
      await sleep(400);
    }
    if (radio && radio.checked) ok++;
    else failed.push(name);

    setStatus(`Working... ${ok} set, ${failed.length} failed`);
  }

  const prefix = stopRequested ? 'Stopped' : 'Done';
  setStatus(`${prefix}: ${ok} set, ${failed.length} failed. Please verify before ordering.`);
  if (failed.length) console.warn('[Walmart Dont Replace] failed items:', failed);
}

function buildPanel() {
  const panel = document.createElement('div');
  panel.id = 'wdr-panel';

  const status = document.createElement('span');
  const run = document.createElement('button');
  run.textContent = "Set all to Don't replace";
  const stop = document.createElement('button');
  stop.id = 'wdr-stop';
  stop.textContent = 'Stop';
  stop.style.display = 'none';

  const setStatus = (t) => { status.textContent = t; };

  run.addEventListener('click', async () => {
    if (running) return;
    running = true;
    stopRequested = false;
    run.disabled = true;
    stop.style.display = '';
    try {
      await setAll(setStatus);
    } finally {
      running = false;
      run.disabled = false;
      stop.style.display = 'none';
    }
  });
  stop.addEventListener('click', () => { stopRequested = true; });

  panel.append(status, run, stop);
  document.body.append(panel);
  return panel;
}

// Only show the panel while the substitutions sidebar is open.
const panel = buildPanel();
new MutationObserver(() => {
  panel.style.display = findDialog() ? 'flex' : 'none';
}).observe(document.body, { childList: true, subtree: true });
