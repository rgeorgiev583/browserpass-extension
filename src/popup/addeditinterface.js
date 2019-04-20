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
        m("div", "hello"),
        m(
            "div",
            {
                onclick: e => {
                    this.popup.inEditView = false;
                    console.log("back,", this.popup.searchPart.searchQuery);
                }
            },
            "Back"
        )
    ];
}
