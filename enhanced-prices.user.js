// ==UserScript==
// @name         Enhanced Prices
// @namespace    https://prices.runescape.wiki
// @version      0.1.0
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
            console.log("Style element generated");
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

            // If the element that was mutated has the container class
            if (target.classList.contains("wgl-page-container") && target.classList.contains("container")) {
                console.log("The container div does not have the fluid class");
                // If it does not also have our new custom fluid class, add it
                if (!target.classList.contains(styleId)) {
                    target.classList.add(styleId);
                    console.log("Added fluid class to container");
                }
            }
        });

        ensureStyleTagExists();
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
