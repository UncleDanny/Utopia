export class Utils {
    static formatPower(n) {
        return new Intl.NumberFormat('en', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 2
        }).format(n * 1_000_000);
    }

    static formatDate(date, isLong = false) {
        const d = new Date(date);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: isLong ? 'long' : 'short', day: 'numeric' });
    }
}