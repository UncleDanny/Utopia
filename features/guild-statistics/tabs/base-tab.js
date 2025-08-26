import { Utils } from '../utils.js';
import { Constants } from '../constants.js'

export class BaseTab {
    constructor() {
        this.Utils = Utils;
        this.Constants = Constants;
    }

    render(container) {
        this.Content = container;
        this.Content.replaceChildren();

        if (this.renderToolbarContent) {
            this.renderToolbar();
        }

        this.renderContent();
    }

    renderToolbar() {
        this.Toolbar = document.createElement('div');
        this.Toolbar.className = 'toolbar';
        this.Content.appendChild(this.Toolbar);

        this.renderToolbarContent();
    }

    createButton(label, onClick, className = '') {
        const btn = document.createElement('button');
        btn.textContent = label;
        if (className) btn.className = className;
        btn.onclick = onClick;
        return btn;
    }
}