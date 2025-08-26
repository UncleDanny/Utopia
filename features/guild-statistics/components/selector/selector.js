import { Component } from "../base-component.js";

export class Selector extends Component {
    #input;
    #list;

    #value = '';
    #placeholder = '';
    #items = [];
    #formatItem = item => String(item);

    #onFocus = () => this.#renderList(this.#items);
    #onClick = () => this.#renderList(this.#items);

    #onInput = () => {
        const val = this.#input.value.toLowerCase().trim();
        const filtered = this.filterFunction
            ? this.filterFunction(this.#items, val)
            : this.#items.filter(item => this.#formatItem(item).toLowerCase().includes(val));
        this.#renderList(filtered);
    };

    #onBlur = () => {
        requestAnimationFrame(() => {
            this.#list.style.display = 'none';
        });
    };

    constructor() {
        super(new URL('./selector.css', import.meta.url).href);
    }

    get value() {
        return this.#input?.value ?? this.#value;
    }
    set value(val) {
        this.#value = val ?? '';
        if (this.#input) this.#input.value = this.#value;
    }

    get placeholder() {
        return this.#input?.placeholder ?? this.#placeholder;
    }
    set placeholder(val) {
        this.#placeholder = val ?? '';
        if (this.#input) this.#input.placeholder = this.#placeholder;
    }

    get items() {
        return this.#items;
    }
    set items(val) {
        if (!Array.isArray(val)) throw new TypeError('items must be an array');
        this.#items = val;
        if (this.#input) this.#renderList(this.#items);
    }

    get formatItem() {
        return this.#formatItem;
    }
    set formatItem(fn) {
        if (typeof fn !== 'function') {
            throw new TypeError('formatItem must be a function');
        }

        this.#formatItem = fn;
    }

    render() {
        if (this.#input) {
            this.#input.removeEventListener('input', this.#onInput);
            this.#input.removeEventListener('focus', this.#onFocus);
            this.#input.removeEventListener('blur', this.#onBlur);
            this.#input.removeEventListener('click', this.#onClick);
        }

        this.shadowRoot.innerHTML = '';

        this.#input = document.createElement('input');
        this.#input.type = 'text';
        this.#input.placeholder = this.#placeholder;
        this.#input.autocomplete = 'off';
        this.#input.className = 'selector-input';
        this.#input.value = this.#value;

        this.#list = document.createElement('div');
        this.#list.className = 'selector-list';

        this.shadowRoot.append(this.#input, this.#list);

        this.#input.addEventListener('input', this.#onInput);
        this.#input.addEventListener('focus', this.#onFocus);
        this.#input.addEventListener('blur', this.#onBlur);
        this.#input.addEventListener('click', this.#onClick);
    }

    #renderList(items) {
        this.#list.replaceChildren();
        for (const item of items) {
            const el = document.createElement('div');
            el.className = 'selector-item';
            el.textContent = this.#formatItem(item);
            el.addEventListener('pointerdown', e => {
                e.preventDefault();
                this.#input.value = this.#formatItem(item);
                this.#list.style.display = 'none';
                this.dispatchEvent(new CustomEvent('select', { detail: { item }, bubbles: true, composed: true }));
            });
            this.#list.appendChild(el);
        }
        this.#list.style.display = items.length ? 'block' : 'none';
    }
}

customElements.define('item-selector', Selector);