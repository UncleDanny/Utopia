export class Selector {
    constructor({ items = [], placeholder = '', getItemText = item => String(item), onSelect = () => { }, filterFunction = null }) {
        this.items = items;
        this.placeholder = placeholder;
        this.getItemText = getItemText;
        this.onSelect = onSelect;
        this.filterFunction = filterFunction;
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'selector-wrapper';

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = this.placeholder;
        this.input.autocomplete = 'off';
        this.input.className = 'selector-input';

        this.list = document.createElement('div');
        this.list.className = 'selector-list';

        this.wrapper.appendChild(this.input);
        this.wrapper.appendChild(this.list);

        this.#attachEvents();
        return this.wrapper;
    }

    setValue(value) {
        this.input.value = value;
    }

    #attachEvents() {
        this.input.addEventListener('input', () => {
            const val = this.input.value.toLowerCase().trim();
            const filtered = this.filterFunction
                ? this.filterFunction(this.items, val)
                : this.items.filter(item => this.getItemText(item).toLowerCase().includes(val));
            this.#showList(filtered);
        });

        this.input.addEventListener('focus', () => this.#showList(this.items));
        this.input.addEventListener('blur', () => setTimeout(() => this.list.style.display = 'none', 150));
    }

    #showList(items) {
        this.list.replaceChildren();
        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'selector-item';
            itemEl.textContent = this.getItemText(item);
            itemEl.addEventListener('mousedown', () => {
                this.input.value = this.getItemText(item);
                this.list.style.display = 'none';
                this.onSelect(item);
            });
            this.list.appendChild(itemEl);
        });
        this.list.style.display = items.length ? 'block' : 'none';
    }
}
