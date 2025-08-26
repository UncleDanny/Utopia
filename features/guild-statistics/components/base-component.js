const styleSheetCache = new Map();

export class Component extends HTMLElement {
    constructor(cssPath = null) {
        super();
        this.attachShadow({ mode: 'open' });

        if (cssPath) {
            this.#loadAndApplyStyles(cssPath);
        }
    }

    async connectedCallback() {
        this.render();
    }

    async #loadAndApplyStyles(cssPath) {
        try {
            let sheet = styleSheetCache.get(cssPath);

            if (!sheet) {
                const cssText = await fetch(cssPath).then(res => {
                    if (!res.ok) throw new Error(`Failed to load CSS: ${res.status} ${res.statusText}`);
                    return res.text();
                });

                if ('adoptedStyleSheets' in Document.prototype && 'replaceSync' in CSSStyleSheet.prototype) {
                    sheet = new CSSStyleSheet();
                    sheet.replaceSync(cssText);
                } else {
                    sheet = document.createElement('style');
                    sheet.textContent = cssText;
                }

                styleSheetCache.set(cssPath, sheet);
            }

            if (sheet instanceof CSSStyleSheet) {
                this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, sheet];
            } else {
                this.shadowRoot.appendChild(sheet.cloneNode(true));
            }
        } catch (error) {
            console.warn(`[Component] Could not load CSS file "${cssPath}":`, error);
        }
    }
}