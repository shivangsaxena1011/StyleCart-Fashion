// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('SW registered:', reg.scope);
    }).catch(err => console.warn('SW registration failed:', err));
  });
}

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const dismissed = localStorage.getItem('stylecart_install_dismissed');
  if (dismissed) {
    const dismissedAt = parseInt(dismissed, 10);
    if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
  }
  setTimeout(() => showInstallPopup(), 3000);
});

function showInstallPopup() {
  if (document.getElementById('stylecart-install-popup')) return;

  const isMobile = window.innerWidth <= 768;
  const popup = document.createElement('div');
  popup.id = 'stylecart-install-popup';

  const pos = isMobile
    ? 'bottom:0;left:0;width:100%;border-radius:24px 24px 0 0;'
    : 'bottom:20px;right:20px;width:380px;border-radius:24px;';

  popup.style.cssText =
    'position:fixed;' + pos +
    'background:rgba(18,18,18,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);' +
    'border:1px solid rgba(255,255,255,0.1);box-shadow:0 10px 40px rgba(0,0,0,0.5);' +
    'padding:24px;z-index:99999;color:white;font-family:Inter,Arial,sans-serif;' +
    'transform:translateY(100%);opacity:0;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);box-sizing:border-box;';

  var flexDir = isMobile ? 'flex-direction:column;' : '';
  popup.innerHTML =
    '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">' +
      '<div style="width:56px;height:56px;background:#8f1d2d;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 4px 12px rgba(143,29,45,0.4);">\uD83D\uDECD\uFE0F</div>' +
      '<div>' +
        '<h3 style="margin:0 0 4px 0;font-size:18px;font-weight:700;">Install StyleCart Fashion</h3>' +
        '<p style="margin:0;font-size:14px;color:#a0a0a0;line-height:1.4;">Get faster access, offline browsing &amp; push notifications</p>' +
      '</div>' +
    '</div>' +
    '<div style="display:flex;gap:12px;' + flexDir + '">' +
      '<button id="sc-install-btn" style="flex:1;padding:12px 24px;background:#8f1d2d;color:white;border:none;border-radius:12px;font-weight:600;font-size:16px;cursor:pointer;transition:background 0.2s;">Install App</button>' +
      '<button id="sc-dismiss-btn" style="flex:1;padding:12px 24px;background:rgba(255,255,255,0.1);color:white;border:none;border-radius:12px;font-weight:600;font-size:16px;cursor:pointer;transition:background 0.2s;">Not Now</button>' +
    '</div>';

  document.body.appendChild(popup);

  requestAnimationFrame(function() {
    popup.style.transform = 'translateY(0)';
    popup.style.opacity = '1';
  });

  document.getElementById('sc-install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User response to install prompt:', outcome);
      deferredPrompt = null;
    }
    dismissInstallPopup();
  });

  document.getElementById('sc-dismiss-btn').addEventListener('click', () => {
    dismissInstallPopup();
  });
}

function dismissInstallPopup() {
  localStorage.setItem('stylecart_install_dismissed', Date.now().toString());
  var popup = document.getElementById('stylecart-install-popup');
  if (popup) {
    popup.style.transform = 'translateY(100%)';
    popup.style.opacity = '0';
    setTimeout(function() { popup.remove(); }, 500);
  }
}

// iOS detection
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

// For iOS Safari, show instruction to use Share > Add to Home Screen
window.addEventListener('load', () => {
  if (isIOS() && !isInStandaloneMode()) {
    var dismissed = localStorage.getItem('stylecart_install_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 60 * 60 * 1000) return;
    setTimeout(() => showIOSInstallPrompt(), 4000);
  }
});

function showIOSInstallPrompt() {
  if (document.getElementById('stylecart-install-popup')) return;

  var popup = document.createElement('div');
  popup.id = 'stylecart-install-popup';

  popup.style.cssText =
    'position:fixed;bottom:0;left:0;width:100%;border-radius:24px 24px 0 0;' +
    'background:rgba(18,18,18,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);' +
    'border-top:1px solid rgba(255,255,255,0.1);box-shadow:0 -10px 40px rgba(0,0,0,0.5);' +
    'padding:24px;z-index:99999;color:white;font-family:Inter,Arial,sans-serif;' +
    'transform:translateY(100%);opacity:0;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);box-sizing:border-box;';

  popup.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
      '<div style="display:flex;align-items:center;gap:12px;">' +
        '<div style="width:40px;height:40px;background:#8f1d2d;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">\uD83D\uDECD\uFE0F</div>' +
        '<h3 style="margin:0;font-size:16px;font-weight:700;">Install StyleCart</h3>' +
      '</div>' +
      '<button id="sc-dismiss-btn" style="background:none;border:none;color:#a0a0a0;font-size:24px;cursor:pointer;padding:0;">&times;</button>' +
    '</div>' +
    '<p style="margin:0 0 16px 0;font-size:15px;color:#ddd;line-height:1.5;">' +
      'Install StyleCart on your iPhone: tap the <strong>Share</strong> icon at the bottom of Safari, then tap <strong>Add to Home Screen</strong> \u2795' +
    '</p>';

  document.body.appendChild(popup);

  requestAnimationFrame(function() {
    popup.style.transform = 'translateY(0)';
    popup.style.opacity = '1';
  });

  document.getElementById('sc-dismiss-btn').addEventListener('click', () => {
    dismissInstallPopup();
  });
}
