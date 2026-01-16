# 🚜 AgroShare - AI-Driven Farm Machinery Scheduling & Sharing Platform

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/MongoDB-6+-green?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss" />
</p>

AgroShare is a modern platform that connects farmers with farm machinery owners, enabling efficient sharing and scheduling of agricultural equipment. The platform uses AI-powered scheduling algorithms to optimize machine routes and minimize idle time.

---

## ✨ Features

### For Farmers
- 🔍 **Browse Machines** - Search and filter tractors, harvesters, rotavators, and more
- 📅 **Easy Booking** - Book machines with preferred date, time, and duration
- 📍 **Location-Based Search** - Find machines near your farm
- 📊 **Track Bookings** - Monitor booking status in real-time
- ⭐ **Ratings & Reviews** - Rate machines and owners after completion

### For Machine Owners
- ➕ **List Machines** - Add your machines with detailed specifications
- 📆 **Schedule Management** - View and manage bookings in calendar view
- 💰 **Earnings Dashboard** - Track your rental income
- ⚙️ **Availability Control** - Set working days, hours, and pricing
- 🔔 **Booking Notifications** - Get notified of new booking requests

### AI-Powered Scheduling
- 🗺️ **Route Optimization** - Uses Haversine formula for distance calculation
- 🎯 **Priority Handling** - Urgent > High > Normal booking priorities
- ⏰ **Time Slot Assignment** - Automatic sequential scheduling from 8 AM
- 📉 **Idle Time Minimization** - Nearest-neighbor algorithm for route planning

---

## 🏗️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| bcryptjs | Password Hashing |
| CORS | Cross-Origin Support |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Library |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router | Navigation |
| Axios | HTTP Client |
| Lucide React | Icons |
| date-fns | Date Utilities |
| react-hot-toast | Notifications |

---

## 📁 Project Structure

```
agroshare/
├── backend/
│   ├── algorithms/
│   │   └── scheduler.js      # AI scheduling algorithm
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── machineController.js
│   │   └── bookingController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Machine.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── machineRoutes.js
│   │   └── bookingRoutes.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MachineCard.jsx
│   │   │   ├── BookingCard.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Machines.jsx
│   │   │   ├── MachineDetails.jsx
│   │   │   ├── AddMachine.jsx
│   │   │   ├── Bookings.jsx
│   │   │   ├── CreateBooking.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Schedule.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/agroshare.git
cd agroshare
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agroshare
API_PREFIX=/api/v1
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/v1

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/register` | Register new user |
| POST | `/api/v1/users/login` | User login |
| GET | `/api/v1/users/profile` | Get user profile |
| PUT | `/api/v1/users/profile` | Update profile |

### Machines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/machines` | Get all machines |
| GET | `/api/v1/machines/:id` | Get machine by ID |
| POST | `/api/v1/machines` | Create machine (Owner) |
| PUT | `/api/v1/machines/:id` | Update machine |
| DELETE | `/api/v1/machines/:id` | Delete machine |
| GET | `/api/v1/machines/nearby` | Find nearby machines |
| PATCH | `/api/v1/machines/:id/availability` | Update availability |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/bookings` | Get user's bookings |
| GET | `/api/v1/bookings/:id` | Get booking by ID |
| POST | `/api/v1/bookings` | Create booking |
| PATCH | `/api/v1/bookings/:id/status` | Update booking status |
| DELETE | `/api/v1/bookings/:id` | Cancel booking |
| POST | `/api/v1/bookings/schedule` | Auto-schedule bookings |

---

## 🧠 Scheduling Algorithm

The AI scheduling algorithm (`algorithms/scheduler.js`) optimizes machine routes using:

1. **Priority Sorting** - Orders jobs by priority (urgent → high → normal)
2. **Location Clustering** - Groups nearby jobs using Haversine distance
3. **Nearest Neighbor** - Selects closest unvisited location for route
4. **Time Slot Assignment** - Assigns sequential slots starting from 8 AM

```javascript
// Example: Schedule pending bookings for a machine
POST /api/v1/bookings/schedule
{
  "machineId": "machine_id",
  "date": "2026-01-20"
}
```

---

## 🎨 Screenshots

### Home Page
Beautiful landing page with hero section, features, and testimonials.

### Machine Listing
Browse machines with filters for type, price, and location.

### Dashboard
Role-based dashboard showing stats, bookings, and quick actions.

### Schedule View
Calendar view for machine owners to manage daily bookings.

---

## 📱 Responsive Design

AgroShare is fully responsive and works seamlessly on:
- 📱 Mobile devices
- 📟 Tablets
- 💻 Desktops
- 🖥️ Large screens

---

## 🔐 User Roles

| Role | Capabilities |
|------|-------------|
| **Farmer** | Browse machines, create bookings, track orders |
| **Owner** | List machines, manage bookings, view earnings |
| **Admin** | Manage all users, machines, and bookings |

---

## 🛠️ Development

### Run Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Build for Production
```bash
# Frontend build
cd frontend && npm run build
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agroshare
API_PREFIX=/api/v1
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**AgroShare Team**

---

## 🙏 Acknowledgments

- Farmers and agricultural communities who inspired this project
- Open source contributors
- All beta testers and early adopters

---

<p align="center">
  Made with ❤️ for Indian Farmers
</p>
