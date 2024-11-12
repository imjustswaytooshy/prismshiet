// ==UserScript==
// @name         PrismShiet
// @namespace    https://violentmonkey.github.io/
// @version      1.0.0
// @description  Removes the gia annoying red warning that stop you to watch movies
// @author       Prism
// @match        https://online-filmek.ac/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const overrideAdblockHunter = `
        (function() {
            function override() {
                if (window['adblock-hunter'] && typeof window['adblock-hunter'].isAdblocking === 'function') {
                    window['adblock-hunter'].isAdblocking = function() {
                        return Promise.resolve(false);
                    };
                } else {
                    requestAnimationFrame(override);
                }
            }
            override();
        })();
    `;
    const script = document.createElement('script');
    script.textContent = overrideAdblockHunter;
    script.type = 'text/javascript';
    document.documentElement.prepend(script);

    const originalFetch = window.fetch;
    window.fetch = function(resource, options) {
        if (typeof resource === 'string' && resource.includes('referral-stats.js')) {
            return Promise.resolve(new Response(null, {status: 200, statusText: 'OK'}));
        }
        return originalFetch.apply(this, arguments);
    };

    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (url.includes('referral-stats.js')) {
            this.abort();
        } else {
            originalXHROpen.apply(this, arguments);
        }
    };

    function hideAdblockElements() {
        const selectors = ['.buttons.detected', '#k8546uz0', '#megoszto_link'];
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.style.display = 'none');
        });
    }

    hideAdblockElements();

    const observer = new MutationObserver(hideAdblockElements);
    observer.observe(document.body, { childList: true, subtree: true });

    setInterval(hideAdblockElements, 2000);

    function continuouslyOverrideAdblock() {
        if (window['adblock-hunter'] && typeof window['adblock-hunter'].isAdblocking === 'function') {
            window['adblock-hunter'].isAdblocking = function() {
                return Promise.resolve(false);
            };
        }
    }

    setInterval(continuouslyOverrideAdblock, 1000);

})();
