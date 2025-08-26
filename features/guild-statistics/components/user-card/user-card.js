import { Component } from "../base-component.js";
import { Utils } from '../../utils.js';

export class UserCard extends Component {
    #mainEntry;
    #otherEntry;
    #date;
    #createArrow = null;

    constructor() {
        super(new URL('./user-card.css', import.meta.url).href);
    }

    set mainEntry(value) {
        this.#mainEntry = value;
        this.render();
    }

    set otherEntry(value) {
        this.#otherEntry = value;
        this.#updateArrows();
    }

    set date(value) {
        this.#date = value;
        this.#updateDate();
    }

    set createArrow(fn) {
        this.#createArrow = fn;
        this.#updateArrows();
    }

    render() {
        this.shadowRoot.innerHTML = '';

        if (!this.#mainEntry) {
            this.shadowRoot.appendChild(this.#createNoDataMessage());
            return;
        }

        const fragment = document.createDocumentFragment();
        fragment.appendChild(this.#createHeader());

        const content = document.createElement('div');
        content.className = 'user-card-content';

        const statConfigs = [
            { label: "Power", key: "Power", type: "power", growthKey: "Power Growth" },
            { label: "Chapter", key: "Chapter", type: "integer", growthKey: "Chapter Growth" }
        ];

        for (const config of statConfigs) {
            content.appendChild(this.#createStatRow(config));
            if (config.growthKey) {
                content.appendChild(this.#createGrowthRow(config));
            }
        }

        fragment.appendChild(content);
        this.shadowRoot.appendChild(fragment);
    }

    showArrows(enabled) {
        this.classList.toggle("arrows-hidden", !enabled);
    }

    #createNoDataMessage() {
        const message = document.createElement('div');
        message.className = 'user-card-no-data';
        message.textContent = `No data for ${Utils.formatDate(this.#date)}`;
        return message;
    }

    #createHeader() {
        const wrapper = document.createElement('div');
        wrapper.className = 'user-card-header';

        wrapper.appendChild(this.#createTextElement('user-card-name', this.#mainEntry.Name));
        wrapper.appendChild(this.#createTextElement('user-card-guild', this.#mainEntry.Guild));

        const dateElem = this.#createTextElement("user-card-date", Utils.formatDate(this.#date));
        dateElem.dataset.role = "date";
        wrapper.appendChild(dateElem);

        return wrapper;
    }

    #createTextElement(className, text, elementType = 'div') {
        const element = document.createElement(elementType);
        element.className = className;
        element.textContent = text ?? "";
        return element;
    }

    #createStatRow(config) {
        const row = document.createElement('div');
        row.className = 'stat-row';

        row.appendChild(this.#createTextElement('stat-label', config.label));

        const valueContainer = document.createElement('div');
        valueContainer.className = 'stat-value-container';

        const valueElem = this.#createTextElement('stat-value', this.#formatValue(this.#mainEntry[config.key], config.type), 'span');
        valueElem.dataset.key = config.key;
        valueContainer.appendChild(valueElem);

        if (this.#createArrow) {
            const arrow = this.#createArrow(this.#mainEntry, this.#otherEntry, config.key);
            arrow.dataset.role = "arrow";
            valueContainer.appendChild(arrow);
        }

        row.appendChild(valueContainer);
        return row;
    }

    #createGrowthRow(config) {
        const row = document.createElement('div');
        row.className = 'stat-row';

        row.appendChild(this.#createTextElement("stat-label", "Growth"));

        const valueContainer = document.createElement('div');
        valueContainer.className = 'stat-value-container';

        const valueElem = document.createElement('span');
        valueElem.className = "stat-value";
        valueElem.dataset.key = config.growthKey;

        const parsed = Number(this.#mainEntry[config.growthKey]);
        if (!Number.isFinite(parsed) || parsed == 0) {
            valueElem.classList.add('neutral');
            valueElem.textContent = '-';
        } else {
            const formatted = this.#formatValue(parsed, config.type);
            if (parsed === 0) {
                valueElem.classList.add("neutral");
                valueElem.textContent = "0";
            } else {
                valueElem.classList.add(parsed > 0 ? "positive" : "negative");
                valueElem.textContent = parsed > 0 ? `+${formatted}` : `${formatted}`;
            }
        }

        valueContainer.appendChild(valueElem);

        if (this.#createArrow && this.#mainEntry[config.growthKey] !== "") {
            const arrow = this.#createArrow(this.#mainEntry, this.#otherEntry, config.growthKey);
            arrow.dataset.role = "arrow";
            valueContainer.appendChild(arrow);
        }

        row.appendChild(valueContainer);
        return row;
    }

    #formatValue(value, type) {
        if (type === "power") return Utils.formatPower(value);
        if (type === "integer") return Number(value).toLocaleString();
        return value ?? "";
    }

    #updateDate() {
        const dateElem = this.shadowRoot.querySelector("[data-role='date']");
        if (dateElem) dateElem.textContent = Utils.formatDate(this.#date);
    }

    #updateArrows() {
        this.shadowRoot.querySelectorAll("[data-role='arrow']").forEach(el => el.remove());
        if (!this.#createArrow || !this.#mainEntry) return;

        const statKeys = ["Power", "Chapter", "Power Growth", "Chapter Growth"];
        statKeys.forEach(key => {
            const container = this.shadowRoot.querySelector(`[data-key='${key}']`)?.parentNode;
            if (container) {
                const arrow = this.#createArrow(this.#mainEntry, this.#otherEntry, key);
                arrow.dataset.role = "arrow";
                container.appendChild(arrow);
            }
        });
    }
}

customElements.define('user-card', UserCard);