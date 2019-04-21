module.exports = AddEditInterface;

var m = require("mithril");

/**
 * Add/Edit interface
 *
 * @since 3.1.0
 *
 * @param object interface Popup interface
 * @return void
 */
function AddEditInterface(popup) {
    // public methods
    this.view = view;

    // fields
    this.popup = popup;
}

/**
 * Generates vnodes for render
 *
 * @since 3.1.0
 *
 * @param function ctl    Controller
 * @param object   params Runtime params
 * @return []Vnode
 */
function view(ctl, params) {
    return [
        m("div.part", [
            m(
                "div.back",
                {
                    onclick: e => {
                        this.popup.inEditView = false;
                        console.log("back,", this.popup.searchPart.searchQuery);
                    }
                },
                "Back"
            ),
            m("div.save", "Save")
        ]),
        m("div.part", [
            m("select", m("option", { value: "pass" }, "pass")),
            m("div", "~/.password-store/")
        ]),
        m("div.part", [m("input[type=text]"), m("div", ".gpg")]),
        m("div.part", [m("input[type=text]"), m("button", "Generate")]),
        m("textarea")
    ];
}
