// ==UserScript==
// @name         prismshiet
// @namespace    https://violentmonkey.github.io/
// @version      1.1.0
// @description  Removes the annoying red warning that stops you from watching movies
// @author       Prism
// @match        https://online-filmek.ac/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    "use strict";

    const OVERRIDE_ADBLOCK_HUNTER = `
        (function() {
            function overrideAdblockHunter() {
                if (window['adblock-hunter'] && typeof window['adblock-hunter'].isAdblocking === 'function') {
                    window['adblock-hunter'].isAdblocking = function() {
                        return Promise.resolve(false);
                    };
                } else {
                    requestAnimationFrame(overrideAdblockHunter);
                }
            }
            overrideAdblockHunter();
        })();
    `;

    const REFERRAL_STATS_SCRIPT = "referral-stats.js";
    const HIDE_SELECTORS = [".buttons.detected", "#k8546uz0", "#megoszto_link"];
    const OVERRIDE_INTERVAL = 1000;
    const HIDE_INTERVAL = 2000;

    const injectScript = (scriptContent) => {
        const script = document.createElement("script");
        script.textContent = scriptContent;
        script.type = "text/javascript";
        document.documentElement.prepend(script);
    };

    injectScript(OVERRIDE_ADBLOCK_HUNTER);

    const overrideFetch = () => {
        const originalFetch = window.fetch;
        window.fetch = function (resource) {
            if (
                typeof resource === "string" &&
                resource.includes(REFERRAL_STATS_SCRIPT)
            ) {
                return Promise.resolve(
                    new Response(null, { status: 200, statusText: "OK" })
                );
            }
            return originalFetch.apply(this, arguments);
        };
    };

    overrideFetch();

    const overrideXMLHttpRequest = () => {
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            if (url.includes(REFERRAL_STATS_SCRIPT)) {
                this.abort();
            } else {
                originalXHROpen.apply(this, arguments);
            }
        };
    };

    overrideXMLHttpRequest();

    const hideAdblockElements = () => {
        HIDE_SELECTORS.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el) => {
                el.style.display = "none";
            });
        });
    };

    hideAdblockElements();

    const observeDOM = () => {
        const observer = new MutationObserver(() => {
            hideAdblockElements();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    };

    observeDOM();

    setInterval(hideAdblockElements, HIDE_INTERVAL);

    const continuouslyOverrideAdblock = () => {
        if (
            window["adblock-hunter"] &&
            typeof window["adblock-hunter"].isAdblocking === "function"
        ) {
            window["adblock-hunter"].isAdblocking = function () {
                return Promise.resolve(false);
            };
        }
    };

    setInterval(continuouslyOverrideAdblock, OVERRIDE_INTERVAL);
})();
