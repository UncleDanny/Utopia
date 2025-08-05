import { allUniqueDates, usersByGuildByDate } from '../dataset.js';
import { Utils } from '../utils.js';
import { Selector } from '../components/selector.js';
import { Constants } from '../constants.js'

if (!window.Tabs) {
    window.Tabs = {};
}

window.Tabs.Overview = {
    render: function (container) {
        this.Content = container;
        this.Content.replaceChildren();

        this.renderToolbar();
        this.renderContainer();

        if (allUniqueDates.length > 0) {
            this.DatePicker.setValue(Utils.formatDate(allUniqueDates[0], true));
            this.UsersByGuild = usersByGuildByDate[allUniqueDates[0]];
            this.update();
        }
    },

    renderToolbar: function () {
        this.Toolbar = document.createElement('div');
        this.Toolbar.className = 'toolbar';
        this.Content.appendChild(this.Toolbar);

        const dateFilter = (dates, val) => {
            return dates.filter(dateStr => {
                const [month, day, year] = dateStr.split('/');
                const monthName = Constants.MONTH_NAMES[+month - 1] || '';
                const normalized = `${monthName} ${day} ${year}`.toLowerCase();
                return dateStr.toLowerCase().includes(val) || normalized.includes(val);
            });
        };

        this.DatePicker = new Selector({
            items: allUniqueDates,
            placeholder: 'Select date...',
            getItemText: date => Utils.formatDate(date, true),
            filterFunction: dateFilter,
            onSelect: date => {
                this.UsersByGuild = usersByGuildByDate[date];
                this.update();
            }
        });

        this.Toolbar.appendChild(this.DatePicker.render());
    },

    renderDateSelector: function (dates, onSelect) {
        return new Selector({
            items: dates,
            placeholder: 'Select date...',
            getItemText: date => Utils.formatDate(date, true),
            onSelect: onSelect
        });
    },

    renderContainer: function () {
        const guildCardContainer = document.createElement('div');
        guildCardContainer.className = 'guild-card-container';
        this.GuildCardContainer = this.Content.appendChild(guildCardContainer);
    },

    update: function () {
        this.GuildCardContainer.replaceChildren();
        if (!this.UsersByGuild) {
            return;
        }

        const orderedGuilds = Constants.GUILD_ORDER
            .map(name => [name, this.UsersByGuild[name]])
            .filter(([_, users]) => users);

        for (const guild of orderedGuilds) {
            const guildCard = document.createElement('div');
            guildCard.className = 'card guild-card';

            const guildHeader = document.createElement('div');
            guildHeader.className = 'guild-card-title';
            guildHeader.textContent = guild[0];
            guildCard.appendChild(guildHeader);

            guildCard.appendChild(this.renderStatSection("Power", guild[1].map(user => +user.Power), Utils.formatPower));
            guildCard.appendChild(this.renderStatSection("Chapter", guild[1].map(user => +user.Chapter), Math.round));

            this.GuildCardContainer.appendChild(guildCard);
        }
    },

    createTextElement(className, text, elementType = 'div') {
        const element = document.createElement(elementType);
        element.className = className;
        element.textContent = text;
        return element;
    },

    createStatRow(labelText, value) {
        const row = document.createElement('div');
        row.className = 'guild-card-row';

        row.appendChild(this.createTextElement('guild-card-label', labelText));
        row.appendChild(this.createTextElement('guild-card-value', value, 'span'));

        return row;
    },

    renderStatSection(title, values, formatter = (x) => x) {
        const section = document.createElement('div');
        section.appendChild(this.createTextElement('guild-card-header', title));

        const sorted = [...values].sort((a, b) => a - b);
        const total = values.reduce((sum, v) => sum + v, 0);
        const average = total / values.length;
        const median = values.length % 2 === 0
            ? (sorted[values.length / 2 - 1] + sorted[values.length / 2]) / 2
            : sorted[Math.floor(values.length / 2)];

        section.appendChild(this.createStatRow("Total", formatter(total)));
        section.appendChild(this.createStatRow("Average", formatter(average)));
        section.appendChild(this.createStatRow("Median", formatter(median)));
        section.appendChild(this.createStatRow("Highest", formatter(sorted[sorted.length - 1])));
        section.appendChild(this.createStatRow("Lowest", formatter(sorted[0])));

        return section;
    }
};