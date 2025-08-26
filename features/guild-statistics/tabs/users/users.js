import { allUniqueUsers, allUniqueDates, usersByDate } from '../../dataset.js';
import { BaseTab } from '../base-tab.js';
import '../../components/selector/selector.js';
import '../../components/user-card/user-card.js';

class UserTab extends BaseTab {
    renderToolbarContent() {
        this.Toolbar.appendChild(this.renderUserSelector(allUniqueUsers, e => {
            this.LeftPanel.Id = e.detail.item.UID;
            this.update();
        }));

        const compareButton = document.createElement('button');
        compareButton.textContent = 'Compare Mode';
        compareButton.className = 'compare-button';
        compareButton.onclick = () => {
            const compareMode = this.Content.classList.toggle('comparing');
            compareButton.textContent = compareMode ? 'Exit Compare Mode' : 'Compare Mode';
            document.querySelectorAll('user-card').forEach(card => {
                card.showArrows(compareMode);
            });
        };
        this.Toolbar.appendChild(compareButton);

        this.Toolbar.appendChild(this.renderUserSelector(allUniqueUsers, e => {
            this.RightPanel.Id = e.detail.item.UID;
            this.update();
        }));
    }

    renderUserSelector(users, onSelect) {
        const selector = document.createElement('item-selector');
        selector.items = users;
        selector.placeholder = 'Select name...';
        selector.formatItem = user => user.Name;
        selector.addEventListener('select', onSelect);
        return selector;
    }

    renderContent() {
        const compareContainer = document.createElement('div');
        compareContainer.className = 'compare-container';
        this.Content.appendChild(compareContainer);

        this.LeftPanel = document.createElement('div');
        this.LeftPanel.className = 'compare-panel';
        compareContainer.appendChild(this.LeftPanel);

        const cardNavigation = document.createElement('div');
        cardNavigation.className = 'user-card-navigation';

        this.arrowLeft = document.createElement('button');
        this.arrowLeft.className = 'arrow-left';
        this.arrowLeft.textContent = '←';
        this.arrowLeft.disabled = true;

        this.arrowRight = document.createElement('button');
        this.arrowRight.className = 'arrow-right';
        this.arrowRight.textContent = '→';
        this.arrowRight.disabled = true;

        const navigate = (direction) => {
            const newIndex = this.cardState.index + direction;
            if (newIndex >= 0 && newIndex < this.cardState.dates.length) {
                this.cardState.index = newIndex;
                this.updateCardNavigation();
            }
        };

        this.arrowLeft.onclick = () => navigate(-1);
        this.arrowRight.onclick = () => navigate(1);

        cardNavigation.appendChild(this.arrowLeft);
        cardNavigation.appendChild(this.arrowRight);
        compareContainer.appendChild(cardNavigation);

        this.RightPanel = document.createElement('div');
        this.RightPanel.className = 'compare-panel';
        compareContainer.appendChild(this.RightPanel);
    }

    update() {
        const leftPanel = this.LeftPanel;
        const rightPanel = this.RightPanel;

        leftPanel.replaceChildren();
        rightPanel.replaceChildren();

        const leftEntries = [];
        const rightEntries = [];
        for (const date of allUniqueDates) {
            const users = usersByDate[date];
            if (!users) {
                continue;
            }

            for (const user of users) {
                if (user.UID === leftPanel.Id) {
                    leftEntries.push({ date, ...user });
                }

                if (user.UID === rightPanel.Id) {
                    rightEntries.push({ date, ...user });
                }
            }
        }

        leftEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
        rightEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

        const leftMap = Object.fromEntries(leftEntries.map(e => [e.date, e]));
        const rightMap = Object.fromEntries(rightEntries.map(e => [e.date, e]));

        const allDates = Array.from(new Set([...leftEntries.map(e => e.date), ...rightEntries.map(e => e.date)]));
        allDates.sort((a, b) => new Date(b) - new Date(a));

        this.displayComparisonTable(leftPanel, leftMap, rightMap, allDates);
        this.displayComparisonTable(rightPanel, rightMap, leftMap, allDates);

        const previousDate = this.cardState?.dates?.[this.cardState.index];
        const newIndex = allDates.indexOf(previousDate);
        this.cardState = {
            index: newIndex >= 0 ? newIndex : 0,
            dates: allDates,
            leftCards: this.displayCards(leftPanel, leftMap, rightMap, allDates),
            rightCards: this.displayCards(rightPanel, rightMap, leftMap, allDates)
        };

        this.updateCardNavigation();
    }

    displayComparisonTable(panel, mainMap, otherMap, allDates) {
        const table = document.createElement('table');
        table.className = 'user-compare-table';

        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        this.Constants.COLUMN_CONFIG.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.label;
            headerRow.appendChild(th);
        });

        const tbody = table.createTBody();
        const fragment = document.createDocumentFragment();
        allDates.forEach(date => {
            const row = fragment.appendChild(document.createElement('tr'));
            const mainEntry = mainMap[date];
            const otherEntry = otherMap[date];

            if (!mainEntry) {
                row.classList.add('row-empty');
            }

            this.Constants.COLUMN_CONFIG.forEach(col => {
                const td = row.insertCell();
                let value = mainEntry?.[col.key];

                if (value == null || value === '') {
                    td.textContent = '-';
                    td.classList.add('cell-empty');
                    return;
                }

                if (col.type === 'date') {
                    td.textContent = this.Utils.formatDate(value);
                } else if (col.type === 'number' || col.type == 'growth') {
                    let displayValue = value;
                    if (col.type === 'number') {
                        if (col.key === 'Power') {
                            displayValue = this.Utils.formatPower(value);
                        }

                        td.style.textAlign = 'right';
                    } else {
                        const parsed = Number(value);
                        if (!Number.isFinite(parsed) || parsed == 0) {
                            td.classList.add('cell-empty');
                            displayValue = '-';
                        } else {
                            const formatted = col.key === 'Chapter Growth' ? parseInt(parsed).toLocaleString() : this.Utils.formatPower(parsed);
                            td.classList.add(parsed > 0 ? 'positive' : 'negative');
                            displayValue = parsed > 0 ? `+${formatted}` : `${formatted}`;
                            td.style.textAlign = 'right';
                        }
                    }

                    const valueContainer = document.createElement('div');
                    valueContainer.className = 'value-container';

                    const valueText = document.createElement('span');
                    valueText.className = 'value-text';
                    valueText.textContent = displayValue;
                    valueContainer.appendChild(valueText);

                    if (displayValue !== '-') {
                        valueContainer.appendChild(this.createArrow(mainEntry, otherEntry, col.key));
                    }

                    td.appendChild(valueContainer);
                } else {
                    td.textContent = value;
                }
            });
        });

        tbody.appendChild(fragment);
        panel.appendChild(table);
    }

    displayCards(panel, mainMap, otherMap, allDates) {
        const container = document.createElement('div');
        container.className = 'user-card-wrapper';

        const cardContainer = document.createElement('div');
        cardContainer.className = 'user-card-container';
        container.appendChild(cardContainer);

        panel.appendChild(container);

        const cards = [];
        allDates.forEach(date => {
            const mainEntry = mainMap[date];
            const otherEntry = otherMap[date];

            let card = null;
            if (Object.keys(mainMap).length > 0) {
                card = document.createElement('user-card');
                card.mainEntry = mainEntry;
                card.otherEntry = otherEntry;
                card.date = date;
                card.createArrow = this.createArrow;
            } else {
                card = document.createElement('div');
                card.className = 'card user-card';

                const noUser = document.createElement('div');
                noUser.className = 'user-card-no-user';
                noUser.textContent = `No user selected`;
                card.appendChild(noUser);
            }

            card.style.display = 'none';
            cards.push(card);
            cardContainer.appendChild(card);
        });

        return cards;
    }

    updateCardNavigation() {
        const { index, dates, leftCards, rightCards } = this.cardState;

        leftCards.forEach((c, i) => c.style.display = i === index ? 'flex' : 'none');
        rightCards.forEach((c, i) => c.style.display = i === index ? 'flex' : 'none');

        if (this.arrowLeft) this.arrowLeft.disabled = index === 0;
        if (this.arrowRight) this.arrowRight.disabled = index === dates.length - 1;
    }

    createArrow(mainEntry, otherEntry, column) {
        const arrow = document.createElement('span');
        arrow.className = 'compare-arrow';
        if (!otherEntry) {
            return arrow;
        }

        const mainValue = mainEntry[column];
        const otherValue = otherEntry[column];
        if (mainValue == null || otherValue == null) {
            return arrow;
        }

        const mainNum = parseFloat(mainValue.replace(/,/g, '')) || 0;
        const otherNum = parseFloat(otherValue.replace(/,/g, '')) || 0;
        if (isNaN(mainNum) || isNaN(otherNum)) {
            return arrow;
        }

        if (!(mainNum === 0 && otherNum === 0)) {
            let symbol, color;
            if (mainNum > otherNum) {
                symbol = '▲';
                color = 'var(--color-success)';
            } else if (mainNum < otherNum) {
                symbol = '▼';
                color = 'var(--color-error)';
            } else {
                symbol = '-';
                color = 'var(--color-muted)';
            }

            arrow.textContent = symbol;
            arrow.style.color = color;
        }

        return arrow;
    }
}

if (!window.Tabs) {
    window.Tabs = {};
}

window.Tabs.Users = new UserTab();