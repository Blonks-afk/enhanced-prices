// ==UserScript==
// @name         Enhanced Prices
// @namespace    https://prices.runescape.wiki
// @version      0.2.0
// @description  A suite of enhancements for the Runescape Wiki prices website.
// @author       Blonks
// @match        https://prices.runescape.wiki/osrs/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=runescape.wiki
// @grant        none
// @run-at       document-body
// ==/UserScript==

(function() {
    'use strict';

    const styleId = "wgl-fluid-container";

    /**
     * Function that ensures the custom style tag element has not been
     * overwritten when react re-renders a component.
     */
    function ensureStyleTagExists() {
        let styleTag = document.getElementById(styleId);
        if (!styleTag) {
            console.log("The custom css style element does not exist");
            styleTag = document.createElement("style");
            styleTag.id = styleId;
            styleTag.textContent = `
            .wgl-fluid-container {
                max-width:90%
            }
            `;
            document.head.appendChild(styleTag);
            console.debug("Style element generated");
        }
    }

    function extendedGraph(target) {
        // If the element that was mutated has the container class
        if (target.classList.contains("wgl-page-container") && target.classList.contains("container")) {
            // If it does not also have our new custom fluid class, add it
            if (!target.classList.contains(styleId)) {
                console.debug("The container div does not have the fluid class");
                target.classList.add(styleId);
                console.debug("Added fluid class to container");
            }
        }

        ensureStyleTagExists();
    }

    function buttonFormat(href, text) {
        // tre
        const linkButton = document.createElement("a");
        linkButton.classList.add("btn");
        linkButton.classList.add("btn-secondary");
        linkButton.href = href;
        linkButton.innerHTML = text;
        linkButton.id = text;

        return linkButton;
    }

    function additionalSiteLinks(target) {
        let siteUrls = {
            "Cloud": "https://prices.osrs.cloud/item/",
            "GE-Tracker": "https://www.ge-tracker.com/item/",
        };

        let siteSettings = {
            "Cloud": true,
            "GE-Tracker": true,
        };

        // add other buttons
        if (target.classList.contains("wgl-page-container") && target.classList.contains("container")) {
            let appendFrom = target.querySelector('a[href*="itemdb"]');

            for (let [key, value] of Object.entries(siteSettings)) {
                if (value) {
                    if (!document.querySelector('#'+key)) {
                        let itemId = window.location.toString().substring(window.location.toString().lastIndexOf("/")+1);
                        let newButton = buttonFormat(siteUrls[key] + itemId, key);
                        appendFrom.after(newButton);
                        appendFrom = newButton;
                        let whiteSpace = document.createTextNode("\u00A0");
                        appendFrom.before(whiteSpace);
                    }

                }
            }

        }
    }

    /**
     * Function that checks through all mutations and determines
     * when the main container div is mutated. Adds the new custom css
     * to the element.
     */
    function checkAndUpdateClass(mutationsList) {
        mutationsList.forEach(mutation => {
            const target = mutation.target;

            extendedGraph(target);

            additionalSiteLinks(target);
        });
    }

    // Create the new mutation observer with the callback checkAndUpdateClass
    const observer = new MutationObserver(checkAndUpdateClass);
    console.log(document.body);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
    });


})();
