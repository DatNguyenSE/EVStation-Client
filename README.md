# ⚡ EvoltStation - EV Charging Management System

[![Deploy Status](https://img.shields.io/website?url=https%3A%2F%2Fevoltstation.io.vn&label=Live%20Demo)](https://evoltstation.io.vn)
![Backend](https://img.shields.io/badge/.NET-9.0-purple)
![Frontend](https://img.shields.io/badge/Angular-20-red)
![Database](https://img.shields.io/badge/SQL_Server-Latest-lightgrey)

**EvoltStation** là nền tảng quản lý trạm sạc xe điện toàn diện, tích hợp đặt chỗ thông minh, thanh toán ví điện tử và giám sát thời gian thực.

🔗 **Live Demo:** [https://evoltstation.io.vn](https://evoltstation.io.vn)

---

## 🛠 Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Backend** | **.NET 9 Web API**, Entity Framework Core, **SignalR** (Real-time), Identity (JWT). |
| **Frontend** | **Angular**, Tailwind CSS, DaisyUI, **Leaflet** (Map), Chart.js. |
| **Database** | Microsoft SQL Server. |
| **Integrations** | **VNPay** (Payment), **Cloudinary** (Media), **MailKit** (Email), **QRCoder**. |

---

## 🚀 Key Features

* **🗺️ Smart Booking & Map:** Tìm trạm trên bản đồ tương tác, lọc trụ sạc tương thích và đặt chỗ giữ chỗ (Reservation) theo khung giờ.
* **⚡ QR Charging Flow:** Quy trình sạc khép kín: Quét QR -> Xác thực người dùng -> Kích hoạt sạc -> Trừ tiền tự động.
* **💳 E-Wallet System:** Ví điện tử tích hợp, hỗ trợ nạp tiền qua cổng thanh toán và quản lý lịch sử giao dịch.
* **🤖 AI Support Bot:** Chatbot hỗ trợ khách hàng tích hợp qua SignalR Custom Adapter.
* **📊 Admin Dashboard:** Thống kê doanh thu, giám sát trạng thái trụ sạc và xử lý báo cáo sự cố thời gian thực.

---

## ⚙️ Installation

**1. Clone Repo**
```bash
git clone [https://github.com/your-username/evolt-station.git](https://github.com/your-username/evolt-station.git)
```
2. Backend Setup (.NET)

```Bash
cd EvoltStation_Backend

# Update connection string in appsettings.json
dotnet ef database update
dotnet run
```
3. Frontend Setup (Angular)

```Bash

cd EvoltStation_Frontend
npm install
npm start
```
