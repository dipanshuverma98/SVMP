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
├── client/
└── server/
    ├── models/
    └── server.js
```

## Setup

```bash
git clone <repository-url>
cd SVMP
```

### Backend

```bash
cd server
npm install
node server.js
```

### Frontend

```bash
cd client
npm install
npm start
```

## Main API Routes

* `POST /send-otp`
* `POST /verify-otp`
* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/mentor/create-group`
* `GET /api/mentor/groups/:mentorId`
* `POST /api/groups/add-mentee`
* `POST /api/groups/add-resource`

## Note

Store Gmail credentials and other secrets in `.env` instead of hardcoding them in the source code.
