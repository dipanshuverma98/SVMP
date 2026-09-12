# SVMP — Mentorship Platform

A full-stack mentorship platform connecting mentors and mentees through separate portals.

## Features

* Gmail OTP verification
* Mentor and Mentee login portals
* JWT-based authentication
* Mentor group creation and mentee management
* Real-time group chat using Socket.IO
* Resource Library with Google Drive links
* Mentor-hosted video meetings using WebRTC
* Role-based access control

## Tech Stack

**Frontend:** React.js
**Backend:** Node.js, Express.js
**Database:** MongoDB
**Real-time:** Socket.IO, WebRTC
**Email:** Nodemailer/Gmail
**Authentication:** JWT

## Project Structure

```text
SVMP/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Navbar, ProtectedRoute
│   │   ├── context/            # AuthContext
│   │   ├── pages/              # Home, Login, Signup, VerifyOtp, VideoCall
│   │   │   ├── mentee/         # MenteeDashboard
│   │   │   └── mentor/         # MentorDashboard, GroupSpace, GroupResources
│   │   └── services/           # authService, authUtils, socket
│   └── package.json
└── server/                     # Node.js / Express backend
    ├── src/
    │   ├── models/             # User, Group, Chat, Otp, Message
    │   ├── middleware/         # authMiddleware, roleMiddleware
    │   ├── sockets/            # socket signaling
    │   ├── utils/              # sendEmail, generateOtp
    │   └── server.js           # Server entry point
    ├── .env.example
    └── package.json
```

## Setup

```bash
git clone <repository-url>
cd SVMP
```

### Backend

1. Navigate to `server` and install dependencies:
```bash
cd server
npm install
```

2. Configure environment variables in `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/svmp
JWT_SECRET=supersecretkey
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password
```

3. Start server:
```bash
npm start
# Or for development with live reload:
npm run dev
```

### Frontend

```bash
cd ../client
npm install
npm start
```

Runs on [http://localhost:3000](http://localhost:3000).

## Main API Routes

* `POST /api/auth/send-otp` - Generate and email 6-digit OTP
* `POST /api/auth/verify-otp` - Verify OTP and register user
* `POST /api/auth/login` - Authenticate user and return JWT token
* `POST /api/mentor/create-group` - Create new mentorship cohort
* `GET /api/mentor/groups/:mentorId` - Fetch all groups created by mentor
* `GET /api/mentee/groups/:userId` - Fetch enrolled groups for student
* `GET /api/groups/:groupId` - Get group details, roster, and resources
* `POST /api/groups/add-mentee` - Enroll student into group by email
* `POST /api/groups/add-resource` - Add resource / Google Drive link
* `GET /api/chat-history/:groupId` - Fetch persistent chat message history
* `Socket.IO` Events: `join-group-chat`, `send-group-message`, `receive-group-message`, `webrtc-offer`, `webrtc-answer`, `webrtc-ice-candidate`
