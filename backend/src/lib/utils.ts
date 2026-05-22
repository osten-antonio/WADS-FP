export function normalizeQuestion(q: string) {
    return q.trim();
}

export function parseNumber(str: string) {
    const s = (str ?? '').replace(/\s+/g, '');
    if (s === '+' || s === '') return 1;
    if (s === '-') return -1;
    const n = parseFloat(s);
    return Number.isNaN(n) ? 0 : n;
}
