import { Utils } from '../utils.js';

export class UserCard {
    constructor(mainEntry, otherEntry, date, createArrow) {
        this.mainEntry = mainEntry;
        this.otherEntry = otherEntry;
        this.date = date;
        this.createArrow = createArrow;
    }

    render() {
        const card = document.createElement('div');
        card.className = 'card user-card';

        if (!this.mainEntry) {
            card.appendChild(this.createNoDataMessage());
            return card;
        }

        card.appendChild(this.createHeader());

        const content = document.createElement('div');
        content.className = 'user-card-content';

        content.appendChild(this.createStatRow('Power', this.mainEntry.Power, 'Power', true));
        content.appendChild(this.createGrowthRow('Growth', this.mainEntry['Power Growth'], 'Power Growth'));

        content.appendChild(this.createStatRow('Chapter', this.mainEntry.Chapter, 'Chapter'));
        content.appendChild(this.createGrowthRow('Growth', this.mainEntry['Chapter Growth'], 'Chapter Growth', true));

        card.appendChild(content);

        return card;
    }

    createNoDataMessage() {
        const message = document.createElement('div');
        message.className = 'user-card-no-data';
        message.textContent = `No data for ${Utils.formatDate(this.date)}`;
        return message;
    }

    createHeader() {
        const wrapper = document.createElement('div');
        wrapper.className = 'user-card-header';

        wrapper.appendChild(this.createTextElement('user-card-name', this.mainEntry.Name));
        wrapper.appendChild(this.createTextElement('user-card-guild', this.mainEntry.Guild));
        wrapper.appendChild(this.createTextElement('user-card-date', Utils.formatDate(this.date)));

        return wrapper;
    }

    createTextElement(className, text, elementType = 'div') {
        const element = document.createElement(elementType);
        element.className = className;
        element.textContent = text;
        return element;
    }

    createStatRow(labelText, value, statKey, isPowerStat = false) {
        const row = document.createElement('div');
        row.className = 'stat-row';

        row.appendChild(this.createTextElement('stat-label', labelText));

        const valueContainer = document.createElement('div');
        valueContainer.className = 'stat-value-container';

        valueContainer.appendChild(this.createTextElement('stat-value', isPowerStat ? Utils.formatPower(value) : value, 'span'));
        valueContainer.appendChild(this.createArrow(this.mainEntry, this.otherEntry, statKey));
        row.appendChild(valueContainer);

        return row;
    }

    createGrowthRow(labelText, growthValue, statKey, isInteger = false) {
        const row = document.createElement('div');
        row.className = 'stat-row';

        row.appendChild(this.createTextElement('stat-label', labelText));

        const valueContainer = document.createElement('div');
        valueContainer.className = 'stat-value-container';

        const valueElem = document.createElement('span');
        valueElem.className = 'stat-value';

        const parsed = Number(growthValue);
        if (!Number.isFinite(parsed) || parsed == 0) {
            valueElem.classList.add('neutral');
            valueElem.textContent = '-';
        } else {
            const formatted = isInteger ? parseInt(parsed).toLocaleString() : Utils.formatPower(parsed);
            valueElem.classList.add(parsed > 0 ? 'positive' : 'negative');
            valueElem.textContent = parsed > 0 ? `+${formatted}` : `${formatted}`;
        }

        valueContainer.appendChild(valueElem);

        if (growthValue !== '') {
            valueContainer.appendChild(this.createArrow(this.mainEntry, this.otherEntry, statKey));
        }

        row.appendChild(valueContainer);
        return row;
    }
}