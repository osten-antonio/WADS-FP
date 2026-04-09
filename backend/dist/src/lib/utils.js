export function normalizeQuestion(q) {
    return q.trim();
}
export function parseNumber(str) {
    if (!str)
        return 0;
    const s = str.replace(/\s+/g, '');
    if (s === '+' || s === '')
        return 1;
    if (s === '-')
        return -1;
    return parseFloat(s);
}
//# sourceMappingURL=utils.js.map