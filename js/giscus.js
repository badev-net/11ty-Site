// Giscus Comments Theme Sync
(function() {
  'use strict';

  function getGiscusTheme(siteTheme) {
    return siteTheme === 'light' ? 'light' : 'dark_dimmed';
  }

  function setGiscusTheme(theme) {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;

    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: getGiscusTheme(theme) } } },
      'https://giscus.app'
    );
  }

  document.addEventListener('themeChanged', function(e) {
    setGiscusTheme(e.detail.theme);
  });

  window.addEventListener('message', function(e) {
    if (e.origin !== 'https://giscus.app') return;
    if (typeof e.data !== 'object' || !e.data.giscus) return;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setGiscusTheme(currentTheme);
  });
})();
