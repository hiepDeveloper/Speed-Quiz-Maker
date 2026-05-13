# SpeedQuizMaker 🚀

**SpeedQuizMaker** là một ứng dụng web hiện đại, giúp biến các tệp văn bản thô (.txt) thành các bộ đề trắc nghiệm sinh động và tương tác chỉ trong vài giây. Đây là công cụ hoàn hảo cho sinh viên và giáo viên để tự tạo nhanh các đề ôn tập cá nhân.

![Banner](https://img.shields.io/badge/Aesthetics-Premium-blueviolet?style=for-the-badge)
![Tech](https://img.shields.io/badge/Built%20with-React%20%2B%20Vite%20%2B%20Tailwind-blue?style=for-the-badge)

## ✨ Tính năng nổi bật

- 🎨 **Giao diện Cao cấp**: Thiết kế Dark Mode hiện đại với hiệu ứng Glassmorphism mượt mà.
- ⚡ **Tạo đề tức thì**: Chuyển đổi tệp `.txt` sang giao diện trắc nghiệm tương tác ngay lập tức.
- 📂 **Quản lý đề cá nhân**: Lưu trữ các bộ đề bạn đã tải lên vào `localStorage`, không lo mất dữ liệu khi tải lại trang.
- 📊 **Theo dõi tiến độ**: Tự động lưu vị trí câu hỏi đang làm và lịch sử điểm số sau mỗi lần hoàn thành.
- 🧭 **Điều hướng linh hoạt**: Danh sách câu hỏi dạng lưới giúp bạn nhảy nhanh đến bất kỳ câu nào.
- 📝 **Hướng dẫn chi tiết**: Trang hướng dẫn tích hợp giúp người dùng soạn đề đúng định dạng một cách dễ dàng.

## 🛠 Công nghệ sử dụng

- **Frontend**: React JS, Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Persistence**: LocalStorage API

## 📋 Định dạng đề chuẩn (.txt)

Để ứng dụng nhận diện chính xác, tệp câu hỏi của bạn cần tuân theo cấu trúc sau:

```text
Câu 1: Thủ đô của Việt Nam là gì?
A. TP. Hồ Chí Minh
*B. Hà Nội
C. Đà Nẵng
D. Hải Phòng

Câu 2: ...
```

- Mỗi câu bắt đầu bằng `Câu n:`.
- Đánh dấu đáp án đúng bằng dấu `*` ngay trước chữ cái (ví dụ: `*B.`).
- Lưu tệp với mã hóa **UTF-8**.

## 🚀 Cài đặt và Chạy thử

1. **Clone dự án**:
   ```bash
   git clone https://github.com/hiepDeveloper/Speed-Quiz-Maker.git
   cd Speed-Quiz-Maker/quiz-app
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Chạy môi trường phát triển**:
   ```bash
   npm run dev
   ```

4. **Truy cập**: Mở trình duyệt và truy cập `http://localhost:5173`.

## 📂 Cấu trúc dự án

- `src/components/`: Chứa các thành phần UI (QuestionCard, HistoryBoard).
- `src/utils/parser.js`: Logic xử lý và trích xuất dữ liệu từ tệp văn bản.
- `public/quiz/`: Chứa các bộ đề mặc định của hệ thống.
- `public/quizzes.json`: Tệp cấu hình danh sách đề thi hệ thống.

## 🤝 Đóng góp

Mọi ý kiến đóng góp hoặc báo lỗi vui lòng mở một [Issue](https://github.com/hiepDeveloper/Speed-Quiz-Maker/issues) hoặc gửi [Pull Request](https://github.com/hiepDeveloper/Speed-Quiz-Maker/pulls).

## 📄 Giấy phép

Dự án này được phát hành dưới giấy phép MIT.

---
Phát triển bởi [hiepDeveloper](https://github.com/hiepDeveloper) 💻
