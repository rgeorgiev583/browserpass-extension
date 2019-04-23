module.exports = Interface;

const m = require("mithril");
const Moment = require("moment");
const SearchInterface = require("./searchinterface");
const AddEditInterface = require("./addeditinterface");
const helpers = require("../helpers");

const LATEST_NATIVE_APP_VERSION = 3000003;

/**
 * Popup main interface
 *
 * @since 3.0.0
 *
 * @param object settings Settings object
 * @param array  logins   Array of available logins
 * @return void
 */
function Interface(settings, logins) {
    // public methods
    this.attach = attach;
    this.view = view;
    this.renderMainView = renderMainView;
    this.search = search;

    // fields
    this.settings = settings;
    this.logins = logins;
    this.results = [];
    this.currentDomainOnly = !settings.tab.url.match(/^(chrome|about):/);
    this.searchQuery = "";
    this.searchPart = new SearchInterface(this);

    // initialise with empty search
    this.search("");
}

/**
 * Attach the interface on the given element
 *
 * @since 3.0.0
 *
 * @param DOMElement element Target element
 * @return void
 */
function attach(element) {
    m.mount(element, this);
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
    const nodes = [];

    if (this.inEditView) {
        nodes.push(m(new AddEditInterface(this)));
    } else {
        nodes.push(...this.renderMainView(ctl, params));
    }

    if (this.settings.version < LATEST_NATIVE_APP_VERSION) {
        nodes.push(
            m("div.updates", [
                m("span", "Update native host app: "),
                m(
                    "a",
                    {
                        href: "https://github.com/browserpass/browserpass-native#installation",
                        target: "_blank"
                    },
                    "instructions"
                )
            ])
        );
    }

    return nodes;
}

/**
 * Generates vnodes for rendering main view
 *
 * @since 3.1.0
 *
 * @param function ctl    Controller
 * @param object   params Runtime params
 * @return []Vnode
 */
function renderMainView(ctl, params) {
    var nodes = [];
    nodes.push(m(this.searchPart));

    nodes.push(
        m(
            "div.logins",
            this.results.map(result => {
                const storeBgColor = result.store.bgColor || result.store.settings.bgColor;
                const storeColor = result.store.color || result.store.settings.color;

                return m(
                    "div.part.login",
                    {
                        key: result.index,
                        tabindex: 0,
                        onclick: e => {
                            var action = e.target.getAttribute("action");
                            if (action === "edit") {
                                this.inEditView = true;
                                this.isNew = false;
                            } else if (action) {
                                result.doAction(action);
                            } else {
                                result.doAction("fill");
                            }
                        },
                        onkeydown: keyHandler.bind(result)
                    },
                    [
                        m("div.name", [
                            m("div.line1", [
                                m(
                                    "div.store.badge",
                                    {
                                        style: `background-color: ${storeBgColor};
                                                color: ${storeColor}`
                                    },
                                    result.store.name
                                ),
                                m("div.path", [m.trust(result.path)]),
                                result.recent.when > 0
                                    ? m("div.recent", {
                                          title:
                                              "Used here " +
                                              result.recent.count +
                                              " time" +
                                              (result.recent.count > 1 ? "s" : "") +
                                              ", last " +
                                              Moment(new Date(result.recent.when)).fromNow()
                                      })
                                    : null
                            ]),
                            m("div.line2", [m.trust(result.display)])
                        ]),
                        m("div.action.copy-password", {
                            tabindex: 0,
                            title: "Copy password",
                            action: "copyPassword"
                        }),
                        m("div.action.copy-user", {
                            tabindex: 0,
                            title: "Copy username",
                            action: "copyUsername"
                        }),
                        m("div.action.edit", {
                            tabindex: 0,
                            title: "Edit",
                            action: "edit"
                        })
                    ]
                );
            })
        ),
        m(
            "div.part.add",
            {
                onclick: e => {
                    this.inEditView = true;
                    this.isNew = true;
                }
            },
            "Add credentials"
        )
    );

    return nodes;
}

/**
 * Run a search
 *
 * @param string searchQuery Search query
 * @return void
 */
function search(searchQuery) {
    this.results = helpers.filterSortLogins(this.logins, searchQuery, this.currentDomainOnly);
}

/**
 * Handle result key presses
 *
 * @param Event  e    Keydown event
 * @param object this Result object
 * @return void
 */
function keyHandler(e) {
    e.preventDefault();
    var login = e.target.classList.contains("login") ? e.target : e.target.closest(".login");
    switch (e.code) {
        case "Tab":
            var partElement = e.target.closest(".part");
            var targetElement = e.shiftKey ? "previousElementSibling" : "nextElementSibling";
            if (partElement[targetElement] && partElement[targetElement].hasAttribute("tabindex")) {
                partElement[targetElement].focus();
            } else {
                document.querySelector(".part.search input[type=text]").focus();
            }
            break;
        case "ArrowDown":
            if (login.nextElementSibling) {
                login.nextElementSibling.focus();
            }
            break;
        case "ArrowUp":
            if (login.previousElementSibling) {
                login.previousElementSibling.focus();
            } else {
                document.querySelector(".part.search input[type=text]").focus();
            }
            break;
        case "ArrowRight":
            if (e.target.classList.contains("login")) {
                e.target.querySelector(".action").focus();
            } else if (e.target.nextElementSibling) {
                e.target.nextElementSibling.focus();
            }
            break;
        case "ArrowLeft":
            if (e.target.previousElementSibling.classList.contains("action")) {
                e.target.previousElementSibling.focus();
            } else {
                login.focus();
            }
            break;
        case "Enter":
            if (e.target.hasAttribute("action")) {
                this.doAction(e.target.getAttribute("action"));
            } else {
                this.doAction("fill");
            }
            break;
        case "KeyC":
            if (e.ctrlKey) {
                this.doAction(e.shiftKey ? "copyUsername" : "copyPassword");
            }
            break;
        case "KeyG":
            if (e.ctrlKey) {
                this.doAction(e.shiftKey ? "launchInNewTab" : "launch");
            }
            break;
    }
}
