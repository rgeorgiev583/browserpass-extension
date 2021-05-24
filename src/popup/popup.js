//------------------------------------- Initialisation --------------------------------------//
"use strict";

require("chrome-extension-async");
const m = require("mithril");
const Interface = require("./interface");
const helpers = require("../helpers");

run();

//----------------------------------- Function definitions ----------------------------------//

/**
 * Handle an error
 *
 * @since 3.0.0
 *
 * @param Error error Error object
 * @param string type Error type
 */
function handleError(error, type = "error") {
    if (type == "error") {
        console.log(error);
    }
    var errorNode = document.createElement("div");
    errorNode.setAttribute("class", "part " + type);
    errorNode.textContent = error.toString();
    document.body.innerHTML = "";
    document.body.appendChild(errorNode);
}

/**
 * Run the main popup logic
 *
 * @since 3.0.0
 *
 * @return void
 */
async function run() {
    try {
        var response = await chrome.runtime.sendMessage({ action: "getSettings" });
        if (response.status != "ok") {
            throw new Error(response.message);
        }
        var settings = response.settings;

        if (settings.hasOwnProperty("hostError")) {
            throw new Error(settings.hostError.params.message);
        }

        if (typeof settings.host === "undefined") {
            throw new Error("Unable to retrieve current tab information");
        }

        // get list of logins
        response = await chrome.runtime.sendMessage({ action: "listFiles" });
        if (response.status != "ok") {
            throw new Error(response.message);
        }

        const logins = helpers.prepareLogins(response.files, settings);
        for (let login of logins) {
            login.doAction = withLogin.bind({ settings: settings, login: login });
        }

        var popup = new Interface(settings, logins, createEditLoginObject);
        popup.attach(document.body);
    } catch (e) {
        handleError(e);
    }
}

/**
 * Do a login action
 *
 * @since 3.0.0
 *
 * @param string action Action to take
 * @return void
 */
async function withLogin(action) {
    try {
        // replace popup with a "please wait" notice
        switch (action) {
            case "fill":
                handleError("Filling login details...", "notice");
                break;
            case "launch":
                handleError("Launching URL...", "notice");
                break;
            case "launchInNewTab":
                handleError("Launching URL in a new tab...", "notice");
                break;
            case "copyPassword":
                handleError("Copying password to clipboard...", "notice");
                break;
            case "copyUsername":
                handleError("Copying username to clipboard...", "notice");
                break;
            case "fetch":
                break;
            case "save":
                handleError("Saving login details...", "notice");
                break;
            case "delete":
                handleError("Deleting login details...", "notice");
                break;
            default:
                handleError("Please wait...", "notice");
                break;
        }

        // Firefox requires data to be serializable,
        // this removes everything offending such as functions
        const login = JSON.parse(JSON.stringify(this.login));

        // hand off action to background script
        var response = await chrome.runtime.sendMessage({
            action: action,
            login: login
        });
        if (response.status != "ok") {
            throw new Error(response.message);
        } else if (action != "fetch") {
            window.close();
        }
        return response;
    } catch (e) {
        handleError(e);
    }
}

function createEditLoginObject(settings, login) {
    this.editLogin = {
        store: login ? login.store : settings.stores.default,
        login: login ? login.login : ""
    };
    this.editLogin.doAction = withLogin.bind({ settings: settings, login: this.editLogin });

    if (login) {
        withLogin
            .bind({ settings: settings, login: login })("fetch")
            .then(response => {
                if (!response || response.status != "ok") return;

                const contents = response.contents.split("\n", 2);
                this.editLogin.password = contents[0];
                this.editLogin.details = contents[1];
                m.redraw();
            });
    }
}
