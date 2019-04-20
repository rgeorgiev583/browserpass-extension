module.exports = SearchInterface;

const m = require("mithril");

/**
 * Search interface
 *
 * @since 3.0.0
 *
 * @param object interface Popup main interface
 * @return void
 */
function SearchInterface(popup) {
    // public methods
    this.view = view;

    // fields
    this.popup = popup;
}

/**
 * Generates vnodes for render
 *
 * @since 3.0.0
 *
 * @param function ctl    Controller
 * @param object   params Runtime params
 * @return []Vnode
 */
function view(ctl, params) {
    var self = this;
    return m(
        "form.part.search",
        {
            onkeydown: e => {
                switch (e.code) {
                    case "Tab":
                        e.preventDefault();
                        if (e.shiftKey) {
                            document.querySelector(".part.login:last-child").focus();
                            break;
                        }
                    // fall through to ArrowDown
                    case "ArrowDown":
                        e.preventDefault();
                        if (self.popup.results.length) {
                            document.querySelector("*[tabindex]").focus();
                        }
                        break;
                    case "Enter":
                        e.preventDefault();
                        if (self.popup.results.length) {
                            self.popup.results[0].doAction("fill");
                        }
                        break;
                }
            }
        },
        [
            this.popup.currentDomainOnly
                ? m("div.hint.badge", [
                      this.popup.settings.host,
                      m("div.remove-hint", {
                          onclick: e => {
                              var target = document.querySelector(
                                  ".part.search > input[type=text]"
                              );
                              target.focus();
                              self.popup.currentDomainOnly = false;
                              self.popup.search(this.popup.searchQuery);
                          }
                      })
                  ])
                : null,
            m("input[type=text]", {
                value: this.popup.searchQuery,
                focused: true,
                placeholder: "Search logins...",
                oncreate: e => {
                    e.dom.focus();
                },
                oninput: e => {
                    this.popup.searchQuery = e.target.value;
                    self.popup.search(this.popup.searchQuery);
                },
                onkeydown: e => {
                    switch (e.code) {
                        case "Backspace":
                            this.popup.searchQuery = e.target.value;

                            if (self.popup.currentDomainOnly) {
                                if (this.popup.searchQuery.length == 0) {
                                    self.popup.currentDomainOnly = false;
                                    self.popup.search("");
                                } else if (
                                    e.target.selectionStart == 0 &&
                                    e.target.selectionEnd == 0
                                ) {
                                    self.popup.currentDomainOnly = false;
                                    self.popup.search(this.popup.searchQuery);
                                }
                            }
                            break;
                        case "KeyC":
                            if (e.ctrlKey && e.target.selectionStart == e.target.selectionEnd) {
                                e.preventDefault();
                                self.popup.results[0].doAction(
                                    e.shiftKey ? "copyUsername" : "copyPassword"
                                );
                            }
                            break;
                        case "KeyG":
                            if (e.ctrlKey && e.target.selectionStart == e.target.selectionEnd) {
                                e.preventDefault();
                                self.popup.results[0].doAction(
                                    e.shiftKey ? "launchInNewTab" : "launch"
                                );
                            }
                            break;
                    }
                }
            })
        ]
    );
}
