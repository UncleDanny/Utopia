const TAB_LIST = [
    { name: 'overview', label: 'Guild Overview' },
    { name: 'users', label: 'User Stats' },
];

TAB_LIST.forEach(tab => {
    const script = document.createElement('script');
    script.src = `tabs/${tab.name}.js`;
    script.type = 'module';
    document.head.appendChild(script);
});

window.addEventListener('DOMContentLoaded', async () => {
    const sidebar = document.getElementById('sidebar');
    const tabContent = document.getElementById('tab-content');
    sidebar.replaceChildren();

    for (const tab of TAB_LIST) {
        await import(`./tabs/${tab.name}.js`);
    }

    tabContent.replaceChildren();
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

    const tabRenderers = {};
    TAB_LIST.forEach(tab => {
        const tabKey = tab.name.charAt(0).toUpperCase() + tab.name.slice(1);
        if (window.Tabs && window.Tabs[tabKey] && window.Tabs[tabKey].render) {
            tabRenderers[tab.name] = window.Tabs[tabKey].render.bind(window.Tabs[tabKey]);
        }
    });

    const savedTab = sessionStorage.getItem('activeTab');
    const defaultTab = TAB_LIST[0].name;
    const activeTabName = savedTab && TAB_LIST.some(t => t.name === savedTab) ? savedTab : defaultTab;

    function activateTab(tabName) {
        document.querySelectorAll('.tab-section').forEach(sec => {
            sec.style.display = sec.id === tabName ? 'flex' : 'none';
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });

        sessionStorage.setItem('activeTab', tabName);

        if (tabRenderers[tabName]) {
            const section = document.getElementById(tabName);
            tabRenderers[tabName](section);
        }
    }

    activateTab(activeTabName);

    sidebar.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activateTab(btn.getAttribute('data-tab'));
        });
    });
});