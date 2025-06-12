# Frontend - VGov Project Management System

Hệ thống quản lý dự án VGov được xây dựng với React, TypeScript, Vite và Tailwind CSS.

## 🚀 Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 hoặc **yarn** >= 1.22.0
- **Git**: Để clone repository

## 📦 Cài đặt

### 1. Cài đặt dependencies

```bash
# Sử dụng npm
npm install

# Hoặc sử dụng yarn
yarn install
```

### 2. Cấu hình môi trường

Sao chép file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin phù hợp:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# Environment
VITE_NODE_ENV=development
```

## 🏃‍♂️ Chạy ứng dụng

### Development mode

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

### Build production

```bash
npm run build
```

### Build development

```bash
npm run build:dev
```

### Preview build

```bash
npm run preview
```

### Lint code

```bash
npm run lint
```

## 🔗 Tích hợp với Backend

### Cấu hình API

1. Đảm bảo backend đang chạy tại `http://localhost:8080`
2. Kiểm tra file `src/config/api.ts` để xem cấu hình API
3. Cập nhật `VITE_API_BASE_URL` trong file `.env` nếu backend chạy ở port khác

## 🛠 Công nghệ sử dụng

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/UI** - UI Components
- **React Router DOM** - Routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **TanStack Query** - Data fetching
- **Lucide React** - Icons
- **Recharts** - Charts

## 📁 Cấu trúc thư mục

```
fe/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # Shadcn/UI components
│   │   ├── common/     # Common components
│   │   ├── employees/  # Employee-related components
│   │   ├── projects/   # Project-related components
│   │   └── ...
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── hooks/          # Custom hooks
│   ├── types/          # TypeScript types
│   ├── contexts/       # React contexts
│   ├── lib/           # Utility functions
│   └── config/        # Configuration files
├── package.json
└── README.md
```

## 🔧 Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm run build:dev` | Build development |
| `npm run preview` | Preview build |
| `npm run lint` | Lint code |

## 🌐 Ports

- **Frontend**: 3000
- **Backend**: 8080 (cần chạy trước)