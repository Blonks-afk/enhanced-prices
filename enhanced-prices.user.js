// ==UserScript==
// @name         Enhanced Prices
// @namespace    https://prices.runescape.wiki
// @version      0.2.0-SNAPSHOT
// @description  A suite of enhancements for the Runescape Wiki prices website.
// @author       Blonks
// @match        https://prices.runescape.wiki/osrs/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=runescape.wiki
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_info
// @run-at       document-body
// ==/UserScript==

(function() {
    'use strict';

    const styleId = "wgl-fluid-container";

    // Ordering of arrays is preserved during JSON
    const defaultSettings = {
        settingGroups: [
            {
                displayName: 'Graph Settings',
                elementId: 'graph',
                groupSettings: [
                    {
                        displayName: 'Extended Graphs',
                        elementId: 'extendedGraphs',
                        value: false,
                    }
                ]
            },
            {
                displayName: 'Site Links',
                elementId: 'siteLinks',
                groupSettings: [
                    {
                        displayName: 'Cloud',
                        elementId: 'cloud',
                        url: "https://prices.osrs.cloud/item/",
                        value: false,
                    },
                    {
                        displayName: 'GE Tracker',
                        elementId: 'geTracker',
                        url: "https://www.ge-tracker.com/item/",
                        value: false,
                    },
                ]
            },
        ],
        version: GM_info.script.version
    };
    var settings = null;

    const settingsDropdownId = "pricesExtendedSettings";
    const settingsModalId = "pricesExtendedModal";

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

    function extendedGraph(target, mutation) {
        if (settings.settingGroups.find(map => map.displayName == 'Graph Settings').groupSettings.find(map => map.displayName == 'Extended Graphs').value) {

            // If the element that was mutated has the container class
            if (target.classList && target.classList.contains("wgl-page-container") && target.classList.contains("container")) {

                // If it does not also have our new custom fluid class, add it
                if (!target.classList.contains(styleId)) {
                    console.debug("The container div does not have the fluid class");
                    target.classList.add(styleId);
                    console.debug("Added fluid class to container");
                }
            }

            ensureStyleTagExists();
        }
    }

    function buttonFormat(href, id, text) {
        // tre
        const linkButton = document.createElement("a");
        linkButton.classList.add("btn");
        linkButton.classList.add("btn-secondary");
        linkButton.href = href;
        linkButton.innerHTML = text;
        linkButton.id = id;

        return linkButton;
    }

    function buttonFormatNew(id, text, hrefCallback) {
        // tre
        const linkButton = document.createElement("a");
        linkButton.classList.add("btn");
        linkButton.classList.add("btn-secondary");
        linkButton.innerHTML = text;
        linkButton.id = id;

        linkButton.onclick = () => hrefCallback(linkButton);

        return linkButton;
    }

    function additionalSiteLinks(target) {
        // add other buttons
        if (target.classList && target.classList.contains("wgl-page-container") && target.classList.contains("container")) {
            let appendFrom = target.querySelector('a[href*="itemdb"]');

            settings.settingGroups.forEach(settingGroup => {
                if (settingGroup.displayName === 'Site Links') {
                    settingGroup.groupSettings.forEach(siteSettings => {
                        if (siteSettings.value && !document.querySelector('#'+siteSettings.elementId+'Btn')) {
//                             let itemId = window.location.toString().substring(window.location.toString().lastIndexOf("/")+1);
//                             let newButton = buttonFormat(siteSettings.url + itemId, siteSettings.elementId+'Btn', siteSettings.displayName);
                            let newButton = buttonFormatNew(siteSettings.elementId+'Btn', siteSettings.displayName, ((button) => {
                                button.href = siteSettings.url + window.location.toString().substring(window.location.toString().lastIndexOf("/")+1);
                            }));
                            appendFrom.after(newButton);
                            appendFrom = newButton;
                            let whiteSpace = document.createTextNode("\u00A0");
                            appendFrom.before(whiteSpace);
                        }
                    });
                }
            });
        }
    }

    function logMutationRecord(mutation, debug) {
        if (!debug) {
            return;
        }
        var newVal = "";
        if (mutation.type === "attributes") {
            newVal = mutation.target.attributes.getNamedItem(mutation.attributeName);
        }
        console.log(`type=${mutation.type}, attributeName=${mutation.attributeName}, oldValue=${mutation.oldValue}, newValue=${newVal}`);
    }

    function settingsModalVisible() {
        console.debug("Setting visibility: " + true);
        document.getElementById(settingsModalId).hidden = false;
    }

    function settingsModalInvisible() {
        console.debug("Setting visibility: " + false);
        document.getElementById(settingsModalId).hidden = true;
    }

    function insertSettingsDropdownEntry() {
        if (!document.getElementById(settingsDropdownId)) {
            console.debug("Settings element does not exist.");
            // Graph Settings
            var extendedGraphs = GM_getValue("graph.extendedGraph", false);

            // Site Link Settings
            var pricesCloudLink = GM_getValue("siteLinks.pricesCloud", false);
            var geTrackerLink = GM_getValue("siteLinks.geTracker", false);

            if (!document.querySelector('#'+settingsDropdownId)) {
                console.debug("Extended Settings option does not exist, adding.");
                const separator = document.createElement("div");
                separator.classList.add("dropdown-divider");
                separator.role = "separator";

                const settingsAnchor = document.createElement("a");
                settingsAnchor.classList.add("dropdown-item");
                settingsAnchor.id = settingsDropdownId;
                settingsAnchor.innerHTML = "Extended Settings";

                var appendTo = document.querySelector("div.dropdown-menu.show");
                appendTo.appendChild(separator);
                appendTo.appendChild(settingsAnchor);
                settingsAnchor.addEventListener("click", settingsModalVisible);
            }
        }
    }

    function insertSettingsModal() {
        if (!document.getElementById(settingsModalId)) {

            let accordion = document.createElement('div');
            accordion.classList.add('accordion');
            accordion.classList.add('wgl-allitems-table-accordion');

            console.debug("Settings modal does not exist.");
            let settingsModal = document.createElement('div');
            settingsModal.id = settingsModalId;
            settingsModal.classList.add("card");
            settingsModal.style.position = 'fixed';
            settingsModal.style.top = '50%';
            settingsModal.style.left = '50%';
            settingsModal.style.transform = 'translate(-50%, -50%)';
            settingsModal.style.padding = '20px';
            settingsModal.style.border = '1px solid black';
            settingsModal.style.zIndex = '10000';
            settingsModal.hidden = true;

            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.onclick = settingsModalInvisible;
            settingsModal.appendChild(closeButton);

            const cardHead = document.createElement('div');
            cardHead.classList.add("card-head");

            const cardBody = document.createElement('div');
            cardBody.classList.add("card-body");
            const table = document.createElement("table");
            table.classList.add("table");
            table.classList.add("table-dark");

            const tbody = document.createElement("tbody");

            let currentSection = null;

            settings.settingGroups.forEach(settingGroup => {
                const sectionRow = document.createElement('tr');
                const sectionData = document.createElement('td');
                const sectionData2 = document.createElement('td');
                const sectionHeader =document.createElement('h1');
                sectionHeader.textContent = settingGroup.displayName;
                sectionData.appendChild(sectionHeader);

                sectionRow.appendChild(sectionData);
                sectionRow.appendChild(sectionData2);
                tbody.appendChild(sectionRow);

                settingGroup.groupSettings.forEach(setting => {
                    const settingRow = document.createElement('tr');

                    const settingTitle = document.createElement('td');
                    const settingLabel = document.createElement('label');
                    settingLabel.textContent = setting.displayName;
                    settingTitle.appendChild(settingLabel);

                    const settingInput = document.createElement('td');
                    const settingField = document.createElement('input');
                    settingField.type = 'checkbox';
                    console.log(`Setting: ${settingGroup.displayName}.${setting.displayName} = ${setting.value == true}`);
                    settingField.checked = (setting.value == true);
                    settingField.onchange = () => updateSettings(settings => {
                        let settingObj = settings.settingGroups.find(map => map.displayName === settingGroup.displayName ).groupSettings.find(map => map.displayName === setting.displayName);
                        settingObj.value = (settingField.checked == true);
                        console.log(settingField.checked==true);
                        console.log(settingObj.displayName);
                    });
                    //                     settingField.onchange = updateSettings(settings => {
                    //                         setting.value = settingInput.checked;
                    //                     });
                    settingInput.appendChild(settingField);

                    settingRow.appendChild(settingTitle);
                    settingRow.appendChild(settingInput);

                    tbody.appendChild(settingRow);
                });
            });

            table.appendChild(tbody);
            cardBody.appendChild(table);
            cardHead.appendChild(cardBody);
            settingsModal.appendChild(cardHead);
            accordion.appendChild(settingsModal);

            document.body.appendChild(accordion);
        }
    }

    function buildSettingsMenu(target, mutation) {
        if (target.classList && target.classList.contains("dropdown-menu") && target.classList.contains("show")) {
            insertSettingsDropdownEntry();
        }

        if (target.classList && target.classList.contains("dropdown")) {
            insertSettingsModal();
        }
    }

    /**
     * Function that checks through all mutations and determines
     * when the main container div is mutated. Adds the new custom css
     * to the element.
     */
    function checkAndUpdateClass(mutationsList) {
        mutationsList.forEach(mutation => {
            if (mutation.type != "characterData") {
                logMutationRecord(mutation);
            }
            const target = mutation.target;

            buildSettingsMenu(target, mutation);
            extendedGraph(target, mutation);

            additionalSiteLinks(target);
        });
    }

    function updateSettings(updateFunction) {
        updateFunction(settings);
        console.debug("New settings: " + JSON.stringify(settings));
        GM_setValue('settings', settings);
        return settings;
    }

    function initializeSettings() {
        var storedSettings = GM_getValue('settings', null);
        if (!storedSettings) {
            updateSettings(() => { settings = defaultSettings });
        } else {
            settings = storedSettings;
        }
    }

    initializeSettings();

    // Create the new mutation observer with the callback checkAndUpdateClass
    const observer = new MutationObserver(checkAndUpdateClass);
    console.log(document.body);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        characterDataOldValue: true,
    });
})();
