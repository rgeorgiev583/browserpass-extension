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
    const items = [
        m("div.title", [
            m("div.btn.back", {
                onclick: e => {
                    this.popup.inEditView = false;
                }
            }),
            m("span", this.popup.isNew ? "Add credentials" : "Edit credentials"),
            m("div.btn.save", {
                onclick: e => {
                    this.popup.editLogin.doAction("save");
                    this.popup.inEditView = false;
                }
            })
        ]),
        m("div.location", [
            m("div.store", [
                m(
                    "select",
                    {
                        disabled: !this.popup.isNew,
                        onchange: e => {
                            this.popup.editLogin.store = this.popup.settings.stores[e.target.value];
                        }
                    },
                    Object.keys(this.popup.settings.stores).map(storeId =>
                        m("option", { value: storeId }, storeId)
                    )
                ),
                m("div.storePath", this.popup.editLogin.store.path)
            ]),
            m("div.path", [
                m("input[type=text]", {
                    placeholder: "filename",
                    disabled: !this.popup.isNew,
                    value: this.popup.editLogin.login,
                    onchange: e => {
                        this.popup.editLogin.login = e.target.value;
                    }
                }),
                m("div", ".gpg")
            ])
        ]),
        m("div.contents", [
            m("div.password", [
                m("input[type=text]", {
                    placeholder: "password",
                    value: this.popup.editLogin.password,
                    onchange: e => {
                        this.popup.editLogin.password = e.target.value;
                    }
                }),
                m("div.btn.generate")
            ]),
            m("div.options", [
                m("input[type=checkbox]", {
                    id: "include_symbols",
                    checked: true
                }),
                m("label", { for: "include_symbols" }, "symbols"),
                m("input[type=number]", {
                    value: "40"
                }),
                m("span", "length")
            ]),
            m(
                "div.details",
                m("textarea", {
                    placeholder: "user: johnsmith",
                    value: this.popup.editLogin.details,
                    onchange: e => {
                        this.popup.editLogin.details = e.target.value;
                    }
                })
            )
        ])
    ];

    if (!this.popup.isNew) {
        items.push(
            m(
                "div.actions",
                m(
                    "button.delete",
                    {
                        onclick: e => {
                            this.popup.editLogin.doAction("delete");
                        }
                    },
                    "Delete"
                )
            )
        );
    }

    return m("div.addEdit", items);
}
