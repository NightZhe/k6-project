import { Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// Custom trend metric you can use from scripts
export const trend = new Trend('req_duration_ms');

// Load sample users from CSV once per VU (via SharedArray)
const users = new SharedArray('users', () => {
    // The CSV is small; parse manually to avoid extra deps
    const text = open('../data/users.csv');
    const lines = text.trim().split(/\r?\n/);
    const headers = lines.shift().split(',').map((h) => h.trim());
    return lines.map((line) => {
        const cols = line.split(',');
        const obj = {};
        headers.forEach((h, i) => (obj[h] = (cols[i] || '').trim()));
        return obj;
    });
});

export function randomUser() {
    return users[Math.floor(Math.random() * users.length)] || { email: 'guest@example.com', name: 'Guest' };
}
