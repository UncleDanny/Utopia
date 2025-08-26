const TAB_LIST = [
    { name: 'overview', label: 'Guild Overview' },
    { name: 'users', label: 'User Stats' },
];

(async function initGuildStatistics() {
    const sidebar = document.getElementById('sidebar');
    const tabContent = document.getElementById('tab-content');
    const tabRenderers = {};

    sidebar.replaceChildren();
    tabContent.replaceChildren();

    for (const tab of TAB_LIST) {
        try {
            await import(`../../features/guild-statistics/tabs/${tab.name}/${tab.name}.js`);

            const tabKey = tab.name.charAt(0).toUpperCase() + tab.name.slice(1);
            if (window.Tabs?.[tabKey]?.render) {
                tabRenderers[tab.name] = window.Tabs[tabKey].render.bind(window.Tabs[tabKey]);
            }


            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `../../features/guild-statistics/tabs/${tab.name}/${tab.name}.css`;
            document.head.appendChild(link);
        } catch (err) {
            console.error(`Failed to load tab: ${tab.name}`, err);
        }
    }

    TAB_LIST.forEach((tab, idx) => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.setAttribute('data-tab', tab.name);
        btn.textContent = tab.label;
        sidebar.appendChild(btn);

        const section = document.createElement('section');
        section.id = tab.name;
        section.className = 'tab-section';
        section.style.display = idx === 0 ? 'flex' : 'none';
        tabContent.appendChild(section);
    });

    const tabSections = document.querySelectorAll('.tab-section');
    const tabButtons = document.querySelectorAll('.tab-btn');

    const savedTab = sessionStorage.getItem('activeTab');
    const defaultTab = TAB_LIST[0].name;
    const activeTabName = savedTab && TAB_LIST.some(t => t.name === savedTab) ? savedTab : defaultTab;

    function activateTab(tabName) {
        tabSections.forEach(sec => sec.style.display = sec.id === tabName ? 'flex' : 'none');
        tabButtons.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName));
        sessionStorage.setItem('activeTab', tabName);
        if (tabRenderers[tabName]) {
            tabRenderers[tabName](document.getElementById(tabName));
        }
    }

    activateTab(activeTabName);

    sidebar.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activateTab(btn.getAttribute('data-tab'));
        });
    });
})();
