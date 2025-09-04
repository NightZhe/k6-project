# k6 專案快速開始

這個資料夾已建立一個可直接執行的 k6 專案範例，包含：
- `scripts/smoke.js`：煙霧測試（快速、少流量）
- `scripts/load.js`：階段式壓力測試（可調整 VUs 與時間）
- `lib/helpers.js`：常用工具函式
- `data/users.csv`：範例資料檔（示範 `open()` 載入）

---

## 1. 安裝 k6（macOS）

```bash
brew install k6
```

安裝完成後確認版本：

```bash
k6 version
```

---

## 2. 目錄結構

```
./
├─ scripts/
│  ├─ smoke.js
│  └─ load.js
├─ lib/
│  └─ helpers.js
├─ data/
│  └─ users.csv
└─ README.md
```

---

## 3. 快速執行

預設以 `https://test.k6.io` 為目標，你可以用環境變數覆蓋：

```bash
# 煙霧測試（快速檢查）
BASE_URL=https://test.k6.io k6 run scripts/smoke.js

# 階段式壓測（可調整 stages）
BASE_URL=https://test.k6.io k6 run scripts/load.js
```

若要輸出測試摘要為 JSON：

```bash
k6 run --summary-export=summary.json scripts/smoke.js
```

---

## 4. 重要觀念與參數化

- **環境變數：** 在腳本中可用 `__ENV.VAR_NAME` 存取，例如 `__ENV.BASE_URL`。
- **選項（options）：** 在腳本上方定義 VUs、duration、stages、thresholds。
- **資料檔：** 以 `open()` 讀取檔案（需在頂層呼叫），例如 `open('../data/users.csv')`。

---

## 5. 常見調整

- **調整併發與時間：** 修改 `options.vus`, `options.duration` 或 `options.stages`。
- **設定 SLA 門檻：** `thresholds` 支援 http_req_duration、checks 等指標。
- **以標籤區分場景：** 在請求前後使用 `group('name', fn)`。

更多說明請參考官方文件：https://k6.io/docs/

---

## 6. 視覺化：Grafana + InfluxDB + k6

本專案已提供 docker-compose 一鍵啟動 Grafana 與 InfluxDB，並預先配置資料來源與儀表板。

### 6.1 啟動服務

首次執行會自動拉取所需的 Docker 映像檔：

```bash
docker compose up -d
```

### 6.2 開啟 Grafana

- URL: http://localhost:3000
- 帳密: `admin` / `admin`
- 已自動連線到 InfluxDB（資料庫：`k6`）並匯入儀表板「k6 Overview」。

### 6.3 讓 k6 將資料寫入 InfluxDB

執行測試時，加入 `--out influxdb` 選項：

```bash
BASE_URL=https://test.k6.io \
  k6 run \
  --out influxdb=http://localhost:8086/k6 \
  scripts/load.js
```

### 6.4 在 Grafana 中查看指標

#### **成功率**
- **查詢 `GET /` 的成功率：**
  ```sql
  SELECT mean("value") AS "success_rate"
  FROM "home_success_rate"
  WHERE $timeFilter
  GROUP BY time($__interval)
  ```

- **查詢 `POST /login` 的成功率：**
  ```sql
  SELECT mean("value") AS "success_rate"
  FROM "login_success_rate"
  WHERE $timeFilter
  GROUP BY time($__interval)
  ```

#### **回應時間**
- **查詢 `GET /` 的回應時間：**
  ```sql
  SELECT mean("value") AS "response_time"
  FROM "home_duration"
  WHERE $timeFilter
  GROUP BY time($__interval)
  ```

- **查詢 `POST /login` 的回應時間：**
  ```sql
  SELECT mean("value") AS "response_time"
  FROM "login_duration"
  WHERE $timeFilter
  GROUP BY time($__interval)
  ```

---

## 7. 小提示

- 將 `BASE_URL` 指向你本機服務（例如 `http://localhost:3000`）即可針對本機進行壓測。
- 使用 `group()` 將測試邏輯分組，方便在 Grafana 中查看分組指標。
- gafana 下載deshbord 模板 ID 14801。  https://grafana.com/grafana/dashboards/14801-k6-dashboard/  

```bash
BASE_URL=https://test.k6.io \
  k6 run \
  --out influxdb=http://localhost:8086/k6 \
  scripts/load.js
```