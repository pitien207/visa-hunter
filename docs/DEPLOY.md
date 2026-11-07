# Triển khai Visa Hunter lên Azure Static Web Apps (M10)

Mục tiêu: game chạy tại **https://visahunter.nghiapham.org**, tự cập nhật mỗi lần push lên nhánh `main`.

Những gì đã có sẵn trong repo:

| File | Tác dụng |
|---|---|
| `.github/workflows/azure-static-web-apps.yml` | GitHub Actions: `npm ci` → `npm run build` → upload `dist/` lên Azure. Mỗi pull request có một URL xem thử riêng. |
| `public/staticwebapp.config.json` | Cấu hình Azure: mọi đường dẫn lạ trả về `index.html`; `assets/` cache 1 năm (tên file có hash); `index.html` và `sw.js` không cache (để bản mới tới ngay); MIME cho `.webmanifest` và `.wasm`; vài header bảo mật. |
| `public/manifest.webmanifest`, `dist/sw.js` (tạo lúc build) | PWA: cài lên màn hình chính, chơi offline sau lần mở đầu tiên. |

Gói **Free** của Static Web Apps là đủ (100 GB băng thông/tháng, 2 custom domain, SSL miễn phí).

---

## 1. Đưa code lên GitHub

```bash
git init
git add .
git commit -m "Visa Hunter 1.0"
git branch -M main
git remote add origin https://github.com/<tài-khoản>/visa-hunter.git
git push -u origin main
```

`.gitignore` đã bỏ qua `node_modules/` và `dist/`.

## 2. Tạo Static Web App

**Cách A — Azure Portal (dễ nhất):**

1. Portal → *Create a resource* → **Static Web App**.
2. Plan: **Free**. Region: *West Europe* (gần Đức và Việt Nam đều ổn).
3. Deployment source: **Other**. Ta dùng workflow có sẵn trong repo, nên **không** chọn GitHub ở đây; nếu chọn GitHub, Azure sẽ tự thêm một workflow thứ hai.
4. Create → mở resource → **Manage deployment token** → copy token.

**Cách B — Azure CLI:**

```bash
az login
az group create -n rg-visa-hunter -l westeurope
az staticwebapp create -n visa-hunter -g rg-visa-hunter -l westeurope --sku Free
az staticwebapp secrets list -n visa-hunter -g rg-visa-hunter --query "properties.apiKey" -o tsv
```

## 3. Cho GitHub quyền deploy

GitHub repo → *Settings → Secrets and variables → Actions → New repository secret*:

- Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
- Value: token vừa copy

Sau đó vào tab **Actions** → *Deploy to Azure Static Web Apps* → **Run workflow** (hoặc push một commit). Khoảng 2 phút sau, game chạy ở địa chỉ mặc định dạng `https://<tên-ngẫu-nhiên>.azurestaticapps.net` (xem ở trang Overview của resource).

## 4. Gắn subdomain `visahunter.nghiapham.org`

1. Ở nơi quản lý DNS của `nghiapham.org`, thêm bản ghi:

   | Type | Name | Value | TTL |
   |---|---|---|---|
   | CNAME | `visahunter` | `<tên-ngẫu-nhiên>.azurestaticapps.net` | 3600 |

   Nếu dùng Cloudflare: để **DNS only** (mây xám) cho tới khi Azure cấp xong chứng chỉ.

2. Azure Portal → Static Web App → **Custom domains** → *Add* → *Custom domain on other DNS* → nhập `visahunter.nghiapham.org` → Validate (CNAME) → Add.

   Hoặc bằng CLI:

   ```bash
   az staticwebapp hostname set -n visa-hunter -g rg-visa-hunter --hostname visahunter.nghiapham.org
   ```

3. Chờ trạng thái **Ready** (vài phút đến 1 giờ). Chứng chỉ HTTPS do Azure tự cấp và tự gia hạn.

## 5. Kiểm tra sau khi deploy

- [ ] Mở `https://visahunter.nghiapham.org` trên **iPhone (Safari)** và **Android (Chrome)**: màn hình tiêu đề hiện ngay, bấm **▶ Chơi** → vào phố.
- [ ] Âm thanh có sau lần chạm đầu tiên (iOS cần tắt chế độ im lặng).
- [ ] Safari: *Chia sẻ → Thêm vào MH chính*. Chrome: menu → *Cài đặt ứng dụng*. Mở từ icon → toàn màn hình.
- [ ] Bật chế độ máy bay → mở lại từ icon → vẫn chơi được (save nằm trong máy).
- [ ] Đổi code, push → sau ~2 phút tải lại trang hai lần (lần đầu service worker tải bản mới, lần sau dùng nó).

## Ghi chú

- Save game nằm trong `localStorage` của từng trình duyệt; đổi domain thì save cũ không theo sang. Dùng *Cài đặt → Dữ liệu → Xuất* để chuyển save.
- Muốn host chỗ khác (Netlify, Cloudflare Pages, GitHub Pages): chỉ cần upload thư mục `dist/` sau `npm run build`. Nếu đặt game trong thư mục con (vd. `/visa-hunter/`), build với `npx vite build --base=/visa-hunter/`.
