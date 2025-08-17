# 🧪 LIMS - Laboratory Information Management System

A full-stack **Next.js (TypeScript)** based Laboratory Information Management System (LIMS) for managing lab equipment issuance, department-level tracking, and instructor/incharge dashboards.

## 🔧 Features

* 📊 **Role-Based Dashboards** (Instructor & Incharge)
* 🧾 **Equipment Management** (Add, Edit, Issue, Track)
* 🏫 **Department Management** with API integration
* 🔍 Search & filter equipment and activities
* 🔒 Authentication system (Login & Signup APIs)
* 📈 Statistics module for lab usage trends

---

## 🚀 Tech Stack

### Frontend & Backend (Fullstack via Next.js):

* ⚛️ Next.js (App Router, TypeScript)
* 🎨 Tailwind CSS for styling
* 📦 ShadCN UI + Radix components
* 🔑 NextAuth.js (or custom API routes for auth)

### Database:

* MongoDB (via Mongoose/Prisma — confirm from your setup)

---

## 🔌 API Routes

| Method | Endpoint                      | Description                    |
| ------ | ----------------------------- | ------------------------------ |
| POST   | `/api/signup`                 | Register new user              |
| POST   | `/api/login`                  | User login                     |
| GET    | `/api/issuance`               | Fetch issued equipment records |
| POST   | `/api/issuance`               | Issue equipment                |
| GET    | `/api/incharge/equipment`     | Get all equipment for incharge |
| POST   | `/api/incharge/equipment`     | Add equipment                  |
| PUT    | `/api/incharge/equipment/:id` | Update equipment details       |
| DELETE | `/api/incharge/equipment/:id` | Delete equipment               |

*(More routes available under `/app/api/...`)*

---

## 📦 Installation

### 1. Clone the repo

```bash
git clone https://github.com/your-username/LIMS-MAIN.git
cd LIMS-MAIN-master
```

### 2. Install dependencies

```bash
pnpm install
# or
npm install
```

### 3. Setup Environment Variables

Create `.env.local` in project root:

```env
MONGO_URI=mongodb://localhost:27017/lims
NEXTAUTH_SECRET=your-secret-key
PORT=3000
```

### 4. Run the development server

```bash
pnpm dev
# or
npm run dev
```

App will run at: [http://localhost:3000](http://localhost:3000)

---

## ✅ Future Enhancements

* Multi-role authentication (Admin, Incharge, Instructor, Students)
* Export equipment logs as CSV/PDF
* Analytics dashboard with charts (lab usage, department trends)
* Cloud database support (MongoDB Atlas / Supabase)

---

## 🙌 Contributing

Pull requests are welcome! Please open an issue before contributing major changes.

---

## 📄 License

This project is open source.

---

## 👨‍💻 Developed By

**Lemuel Fernandes**
[LinkedIn](https://www.linkedin.com/in/lemuel-fernandes)

**Aiswarya**
\[LinkedIn]

**Vyshak**
\[LinkedIn]

**Jon**
\[LinkedIn]

**Sarah**
\[LinkedIn]

