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
        m("div.part.title", [
            m("div.btn.back", {
                onclick: e => {
                    this.popup.inEditView = false;
                }
            }),
            m("span", "Add credentials"),
            m("div.btn.save")
        ]),
        m("div.part", [
            m("select", m("option", { value: "pass" }, "pass")),
            m("div", "~/.password-store/")
        ]),
        m("div.part", [m("input[type=text]", { placeholder: "filename" }), m("div", ".gpg")]),
        m("div.part", [m("input[type=text]", { placeholder: "password" }), m("div.btn.generate")]),
        m("textarea", { placeholder: "user: johnsmith" }),
        m("button", "Delete")
    ];
}
