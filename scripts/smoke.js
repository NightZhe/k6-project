import { sleep, check, group } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

// 自定義指標
const contactsTrend = new Trend('contacts_duration');
const newsTrend = new Trend('news_duration');
const messagesTrend = new Trend('messages_duration');

export const options = {
    // stages: [
    //     { duration: '30s', target: 5 },  // 30 秒內從 0 增加到 5 個 VUs
    //     { duration: '1m', target: 20 }, // 持續 1 分鐘保持 20 個 VUs
    //     { duration: '30s', target: 0 },  // 30 秒內從 20 減少到 0 個 VUs
    // ],
    vus: 10,          // 固定 10 個 VUs
    duration: '10m',   // 測試持續 10 分鐘

    thresholds: {
        http_req_duration: ['p(95)<1000'], // 95% 的請求延遲小於 1000ms
        checks: ['rate>0.95'],            // 驗證通過率需大於 95%
    },
};

const BASE_URL = __ENV.BASE_URL || 'https://test.k6.io';

export default function () {
    group('API Tests', () => {
        // 測試 /contacts.php
        const contactsRes = http.get(`${BASE_URL}/contacts.php`);
        check(contactsRes, {
            'contacts status is 200': (r) => r.status === 200,
        });
        contactsTrend.add(contactsRes.timings.duration);
        sleep(1 + Math.random() * 2); // 隨機暫停 1 到 3 秒

        // 測試 /news.php
        const newsRes = http.get(`${BASE_URL}/news.php?user=alice@example.com`);
        check(newsRes, {
            'news status is 200': (r) => r.status === 200,
        });
        newsTrend.add(newsRes.timings.duration);
        sleep(1 + Math.random() * 2); // 隨機暫停 1 到 3 秒

        // 測試 /my_messages.php
        const messagesRes = http.get(`${BASE_URL}/my_messages.php`);
        check(messagesRes, {
            'messages status is 200': (r) => r.status === 200,
        });
        messagesTrend.add(messagesRes.timings.duration);
        sleep(1 + Math.random() * 2); // 隨機暫停 1 到 3 秒
    });

    sleep(1);
}