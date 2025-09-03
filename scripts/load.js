import { sleep, check, group } from 'k6';
import http from 'k6/http';
import { Trend, Rate } from 'k6/metrics';
import { randomUser } from '../lib/helpers.js';

export const options = {
    stages: [
        { duration: '30s', target: 5 },   // ramp-up
        { duration: '1m', target: 20 },   // steady
        { duration: '30s', target: 0 },   // ramp-down
    ],
    thresholds: {
        'http_req_duration{api:home}': ['p(95)<1000'], // home API 的延遲
        'http_req_duration{api:login}': ['p(95)<1000'], // login API 的延遲
        'checks{api:home}': ['rate>0.95'], // home API 的成功率
        'checks{api:login}': ['rate>0.95'], // login API 的成功率
        'home_success_rate': ['rate>0.95'], // home API 的成功率
        'login_success_rate': ['rate>0.95'], // login API 的成功率
    },
};

const BASE_URL = __ENV.BASE_URL || 'https://test.k6.io';

// 自訂指標
const homeDuration = new Trend('home_duration');
const loginDuration = new Trend('login_duration');
const homeSuccessRate = new Rate('home_success_rate');
const loginSuccessRate = new Rate('login_success_rate');

export default function () {
    group('home', () => {
        const res = http.get(`${BASE_URL}/`);
        const success = check(res, {
            'status is 200 or 302': (r) => r.status === 200 || r.status === 302,
        });
        homeDuration.add(res.timings.duration, { api: 'home' });
        homeSuccessRate.add(success); // 記錄成功率
    });

    group('login (demo flow)', () => {
        const user = randomUser();
        const payload = JSON.stringify({ login: "default", password: '12345678' });
        const params = { headers: { 'Content-Type': 'application/json' } };
        const res = http.post(`${BASE_URL}/login`, payload, params);
        const success = check(res, {
            'status is 200 or 302': (r) => r.status === 200 || r.status === 302,
        });
        loginDuration.add(res.timings.duration, { api: 'login' });
        loginSuccessRate.add(success); // 記錄成功率
    });

    sleep(1);
}