class UtopiaDataset {
    constructor() {
        this.url = 'https://gist.githubusercontent.com/UncleDanny/df83f58ece59cb4b35d830fd40594b67/raw/utopia.json';
        this.data = null;
    }

    async load() {
        if (this.data) {
            return this.data;
        }

        try {
            const response = await fetch(this.url);
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }

            this.data = await response.json();
        } catch (error) {
            console.error('Failed to load dataset JSON:', error);
            return null;
        }
    }

    getAllUsersForDate(date) {
        return this.data?.[date] ? Object.values(this.data[date]) : [];
    }

    getAllUniqueUsers() {
        const userMap = new Map();

        for (const [date, users] of Object.entries(this.data)) {
            const ts = Date.parse(date);
            for (const [uid, entry] of Object.entries(users)) {
                const existing = userMap.get(uid);
                if (!existing || ts > existing.ts) {
                    userMap.set(uid, { ...entry, ts });
                }
            }
        }

        return Array.from(userMap.values())
            .map(({ ts, ...entry }) => entry)
            .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }));
    }

    getAllUniqueDates() {
        return Object.keys(this.data).sort((a, b) => Date.parse(b) - Date.parse(a));
    }

    getUsersByGuildForDate(date) {
        const users = this.getAllUsersForDate(date);
        const usersByGuild = {};

        for (const user of users) {
            const guild = user.Guild || 'Unknown';
            if (!usersByGuild[guild]) usersByGuild[guild] = [];
            usersByGuild[guild].push(user);
        }

        return usersByGuild;
    }
}

const dataset = new UtopiaDataset();
await dataset.load();

export const allUniqueUsers = dataset.getAllUniqueUsers();
export const allUniqueDates = dataset.getAllUniqueDates();

export const usersByDate = {};
for (const date of allUniqueDates) {
    usersByDate[date] = dataset.getAllUsersForDate(date);
}

export const usersByGuildByDate = {};
for (const date of allUniqueDates) {
    usersByGuildByDate[date] = dataset.getUsersByGuildForDate(date);
}
