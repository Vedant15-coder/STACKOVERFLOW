# 🚀 DevQuery - Stack Overflow Clone

A full-stack Q&A platform inspired by Stack Overflow, built with modern web technologies. DevQuery features AI-powered assistance, multi-language support, public space for social interactions, subscription-based question posting, and advanced security features.

![DevQuery](https://img.shields.io/badge/DevQuery-Stack%20Overflow%20Clone-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.4.1-black)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Key Features Explained](#-key-features-explained)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features
- ✅ **User Authentication & Authorization**
  - Email/Password registration and login
  - JWT-based authentication
  - OTP verification for enhanced security
  - Login history tracking with device detection
  - Conditional access based on browser and device type

- ✅ **Question & Answer System**
  - Post questions with rich text formatting
  - Answer questions with detailed explanations
  - Upvote/downvote questions and answers
  - Accept best answers
  - Comment on questions and answers
  - Tag-based categorization

- ✅ **AI-Powered Assistance**
  - Integrated Google Gemini AI for intelligent responses
  - Context-aware answers to programming questions
  - Code snippet generation and explanation

- ✅ **Public Space (Social Feed)**
  - Post images and videos
  - Like, comment, and share posts
  - Friend-based posting restrictions:
    - 0 friends: Cannot post
    - 1 friend: 1 post per day
    - 2 friends: 2 posts per day
    - 3-10 friends: Posts equal to friend count per day
    - 10+ friends: Unlimited posts

- ✅ **Friend System**
  - Send and receive friend requests
  - Accept/reject friend requests
  - View friends list
  - Friend-based features unlocking

- ✅ **Multi-Language Support**
  - 6 languages: English, Hindi, Spanish, Portuguese, French, Chinese
  - OTP verification for language changes (except English)
  - Email OTP for French, Mobile OTP for others

- ✅ **Subscription & Payment System**
  - Mock Razorpay integration (production-ready architecture)
  - Free tier: Limited questions per month
  - Premium tier: Unlimited questions
  - Automatic invoice generation via email

- ✅ **Reputation & Points System**
  - Earn points for contributions
  - Transfer points between users
  - Reputation-based privileges
  - Leaderboard and rankings

- ✅ **Notification System**
  - Real-time notifications for:
    - Friend requests
    - Post interactions (likes, comments, shares)
    - Question/answer votes
    - Accepted answers
  - Mark as read/unread
  - Notification history

- ✅ **Advanced Security**
  - Password hashing with bcrypt
  - JWT token-based sessions
  - Rate limiting for OTP requests
  - Device fingerprinting
  - IP address masking for privacy

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.4.1 (React 19.1.0)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Lucide React
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Internationalization**: i18next, next-i18next
- **Notifications**: React Toastify

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.1.0
- **Language**: JavaScript (ES Modules)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcryptjs
- **AI Integration**: Google Generative AI (Gemini)
- **Device Detection**: ua-parser-js
- **Environment**: dotenv

### Database
- **Primary Database**: MongoDB Atlas
- **ODM**: Mongoose 8.16.5

### Development Tools
- **Backend Dev Server**: Nodemon
- **Package Manager**: npm
- **Version Control**: Git

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **MongoDB Atlas Account**: [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git**: [Download](https://git-scm.com/)
- **Google Gemini API Key**: [Get API Key](https://makersuite.google.com/app/apikey)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Vedant15-coder/STACKOVERFLOW.git
cd stackoverflow-clone
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../stack
npm install
```

### Step 4: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user with password
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string (replace `<password>` with your actual password)

Example connection string:
```
mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/devquery?retryWrites=true&w=majority
```

### Step 5: Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key for use in environment variables

---

## 🔐 Environment Variables

### Backend Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/devquery?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Email Configuration (Optional - for OTP emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Mock Razorpay (for development)
RAZORPAY_KEY_ID=mock_key_id
RAZORPAY_KEY_SECRET=mock_key_secret
```

### Frontend Environment Variables

Create a `.env.local` file in the `stack` directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# App Configuration
NEXT_PUBLIC_APP_NAME=DevQuery
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 Running the Application

### Option 1: Run Both Servers Separately

#### Terminal 1 - Backend Server
```bash
cd server
npm start
```
The backend will run on **http://localhost:5000**

#### Terminal 2 - Frontend Server
```bash
cd stack
npm run dev
```
The frontend will run on **http://localhost:3000**

### Option 2: Using Concurrent Commands (Recommended)

You can install `concurrently` to run both servers with one command:

```bash
# In the root directory
npm install -g concurrently

# Create a script in root package.json or run:
concurrently "cd server && npm start" "cd stack && npm run dev"
```

### Verify Installation

1. **Backend**: Visit http://localhost:5000 - You should see a server response
2. **Frontend**: Visit http://localhost:3000 - You should see the DevQuery homepage
3. **Database**: Check MongoDB Atlas dashboard for connection

---

## 📁 Project Structure

```
stackoverflow-clone/
├── server/                          # Backend (Node.js + Express)
│   ├── controller/                  # Route controllers
│   │   ├── auth.js                 # Authentication logic
│   │   ├── question.js             # Question CRUD operations
│   │   ├── answer.js               # Answer operations
│   │   ├── friend.js               # Friend system
│   │   ├── publicspace.js          # Public space posts
│   │   ├── notification.js         # Notifications
│   │   ├── gemini.js               # AI integration
│   │   ├── languageController.js   # Language switching
│   │   ├── loginHistory.js         # Login tracking
│   │   └── ...
│   ├── models/                      # Mongoose schemas
│   │   ├── auth.js                 # User model
│   │   ├── question.js             # Question model
│   │   ├── answer.js               # Answer model
│   │   ├── post.js                 # Public space post model
│   │   ├── notification.js         # Notification model
│   │   ├── LoginHistory.js         # Login history model
│   │   ├── otp.js                  # OTP model
│   │   └── ...
│   ├── routes/                      # API routes
│   │   ├── auth.js                 # Auth routes
│   │   ├── question.js             # Question routes
│   │   ├── answer.js               # Answer routes
│   │   ├── publicspace.js          # Public space routes
│   │   └── ...
│   ├── middleware/                  # Custom middleware
│   │   └── auth.js                 # JWT verification
│   ├── services/                    # Business logic services
│   │   ├── otpService.js           # OTP generation/verification
│   │   └── smsService.js           # SMS sending
│   ├── utils/                       # Utility functions
│   │   ├── emailService.js         # Email sending
│   │   ├── deviceDetection.js      # Device fingerprinting
│   │   ├── conditionalAccess.js    # Access control
│   │   └── mockRazorpay.js         # Mock payment
│   ├── index.js                     # Server entry point
│   ├── package.json                 # Backend dependencies
│   └── .env                         # Environment variables
│
├── stack/                           # Frontend (Next.js + TypeScript)
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── Navbar.tsx          # Navigation bar
│   │   │   ├── Sidebar.tsx         # Sidebar navigation
│   │   │   ├── LoginOTPModal.tsx   # OTP verification modal
│   │   │   ├── LoginHistory.tsx    # Login history display
│   │   │   ├── PublicSpace/        # Public space components
│   │   │   └── ui/                 # Reusable UI components
│   │   ├── pages/                  # Next.js pages
│   │   │   ├── index.tsx           # Homepage
│   │   │   ├── auth/               # Authentication pages
│   │   │   ├── questions/          # Question pages
│   │   │   ├── ai-assist/          # AI assistant page
│   │   │   ├── public/             # Public space page
│   │   │   ├── users/              # User profile pages
│   │   │   └── subscription/       # Subscription page
│   │   ├── lib/                    # Utilities and configs
│   │   │   ├── axiosinstance.js    # Axios configuration
│   │   │   ├── AuthContext.js      # Auth context provider
│   │   │   └── utils.ts            # Helper functions
│   │   └── styles/                 # Global styles
│   ├── public/                      # Static assets
│   ├── package.json                 # Frontend dependencies
│   ├── tsconfig.json                # TypeScript config
│   ├── tailwind.config.js           # Tailwind CSS config
│   └── next.config.js               # Next.js config
│
└── README.md                        # This file
```

---

## 🎨 Key Features Explained

### 1. Authentication System

**Registration Flow:**
1. User enters email, name, and password
2. Password is hashed using bcrypt
3. User account is created in MongoDB
4. JWT token is generated and returned

**Login Flow:**
1. User enters email and password
2. Password is verified against hashed password
3. Device and browser are detected
4. If Chrome on desktop/laptop: OTP is sent to email
5. User verifies OTP
6. Login history is recorded
7. JWT token is issued

**Security Features:**
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with expiration
- OTP verification for sensitive operations
- Device fingerprinting
- Login history tracking
- IP address masking

### 2. Public Space Posting Rules

The posting frequency is controlled by friend count:

| Friend Count | Posts Per Day |
|-------------|---------------|
| 0 friends   | Cannot post   |
| 1 friend    | 1 post/day    |
| 2 friends   | 2 posts/day   |
| 3-10 friends| Equal to friend count |
| 10+ friends | Unlimited     |

**Implementation:**
- Daily counter resets at midnight
- Backend validates friend count before allowing posts
- Frontend displays remaining posts for the day

### 3. Language Switching with OTP

**Language Support:**
- 🇬🇧 English (No OTP required)
- 🇮🇳 Hindi (Mobile OTP)
- 🇪🇸 Spanish (Mobile OTP)
- 🇵🇹 Portuguese (Mobile OTP)
- 🇫🇷 French (Email OTP)
- 🇨🇳 Chinese (Mobile OTP)

**OTP Flow:**
1. User selects new language
2. If not English, OTP is generated
3. OTP sent via email (French) or mobile (others)
4. User enters 6-digit OTP
5. Language preference is updated
6. UI switches to new language

### 4. Subscription System

**Free Tier:**
- Limited questions per month
- Access to basic features
- View all content

**Premium Tier:**
- Unlimited questions
- Priority support
- Ad-free experience
- Special badge

**Mock Payment Flow:**
1. User selects subscription plan
2. Mock Razorpay order is created
3. User "pays" (no real money)
4. Subscription is activated
5. Invoice email is sent

### 5. AI Assistant (Gemini Integration)

**Features:**
- Ask programming questions
- Get code explanations
- Generate code snippets
- Debug assistance
- Best practices recommendations

**Usage:**
1. Navigate to AI Assist page
2. Type your question
3. AI processes and responds
4. View formatted answer with code highlighting

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/signup              # Register new user
POST   /api/auth/login               # Login user
POST   /api/auth/verify-otp          # Verify login OTP
GET    /api/auth/user                # Get current user
POST   /api/auth/logout              # Logout user
```

### Questions
```
GET    /api/questions                # Get all questions
GET    /api/questions/:id            # Get single question
POST   /api/questions                # Create question
PUT    /api/questions/:id            # Update question
DELETE /api/questions/:id            # Delete question
POST   /api/questions/:id/vote       # Vote on question
```

### Answers
```
GET    /api/answers/:questionId      # Get answers for question
POST   /api/answers                  # Create answer
PUT    /api/answers/:id              # Update answer
DELETE /api/answers/:id              # Delete answer
POST   /api/answers/:id/vote         # Vote on answer
POST   /api/answers/:id/accept       # Accept answer
```

### Public Space
```
GET    /api/publicspace              # Get all posts
POST   /api/publicspace              # Create post
POST   /api/publicspace/:id/like     # Like/unlike post
POST   /api/publicspace/:id/comment  # Comment on post
POST   /api/publicspace/:id/share    # Share post
GET    /api/publicspace/stats        # Get user posting stats
```

### Friends
```
GET    /api/friends                  # Get friends list
POST   /api/friends/request          # Send friend request
POST   /api/friends/accept/:id       # Accept friend request
POST   /api/friends/reject/:id       # Reject friend request
DELETE /api/friends/:id              # Remove friend
```

### Notifications
```
GET    /api/notifications            # Get notifications
GET    /api/notifications/unread     # Get unread count
PUT    /api/notifications/:id/read   # Mark as read
PUT    /api/notifications/read-all   # Mark all as read
```

### Language
```
POST   /api/language/request-otp     # Request language change OTP
POST   /api/language/verify-otp      # Verify OTP and change language
GET    /api/language/current         # Get current language
```

### AI Assistant
```
POST   /api/gemini/ask               # Ask AI a question
```

### Login History
```
GET    /api/login-history/:userId    # Get user's login history
```

---

## 🗄 Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  language: String (default: 'en'),
  friends: [ObjectId],
  reputation: Number,
  points: Number,
  dailyPostCount: Number,
  lastPostDate: Date,
  subscription: {
    plan: String,
    status: String,
    expiresAt: Date
  },
  createdAt: Date
}
```

### Question Schema
```javascript
{
  title: String,
  body: String,
  tags: [String],
  author: ObjectId,
  votes: Number,
  answers: [ObjectId],
  views: Number,
  acceptedAnswer: ObjectId,
  createdAt: Date
}
```

### Post Schema (Public Space)
```javascript
{
  author: ObjectId,
  caption: String,
  mediaUrl: String,
  mediaType: String ('image' | 'video'),
  likes: [ObjectId],
  comments: [{
    author: ObjectId,
    text: String,
    createdAt: Date
  }],
  shares: Number,
  createdAt: Date
}
```

### Notification Schema
```javascript
{
  recipient: ObjectId,
  sender: ObjectId,
  type: String,
  message: String,
  post: ObjectId,
  read: Boolean,
  createdAt: Date
}
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] OTP verification for login
- [ ] Question posting and editing
- [ ] Answer posting and voting
- [ ] Friend requests (send, accept, reject)
- [ ] Public space posting with friend restrictions
- [ ] Language switching with OTP
- [ ] AI assistant queries
- [ ] Notification system
- [ ] Subscription flow
- [ ] Point transfers
- [ ] Login history viewing

### Test Accounts

You can create test accounts or use these credentials if seeded:

```
Email: test@example.com
Password: Test123!
```

---

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: MongoServerError: bad auth
```
**Solution:** 
- Check your MongoDB URI in `.env`
- Verify username and password
- Ensure IP is whitelisted in MongoDB Atlas

**2. JWT Token Error**
```
Error: jwt malformed
```
**Solution:**
- Ensure `JWT_SECRET` is set in `.env`
- Clear browser cookies and localStorage
- Re-login to get new token

**3. Port Already in Use**
```
Error: Port 5000 is already in use
```
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**4. Module Not Found**
```
Error: Cannot find module 'xyz'
```
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**5. CORS Error**
```
Error: CORS policy blocked
```
**Solution:**
- Verify `FRONTEND_URL` in server `.env`
- Check CORS configuration in `server/index.js`

---

## 📝 Development Guidelines

### Code Style
- Use ES6+ features
- Follow consistent naming conventions
- Add comments for complex logic
- Keep functions small and focused

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Commit Message Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Vedant** - [GitHub](https://github.com/Vedant15-coder)

---

## 🙏 Acknowledgments

- Stack Overflow for inspiration
- Next.js team for the amazing framework
- MongoDB for the database
- Google for Gemini AI
- Radix UI for accessible components
- All contributors and testers

---

## 📞 Support

For support, email vedant@example.com or open an issue on GitHub.

---

## 🔮 Future Enhancements

- [ ] Real-time chat between users
- [ ] Code playground integration
- [ ] Mobile app (React Native)
- [ ] Advanced search with filters
- [ ] Markdown editor for questions
- [ ] Email notifications
- [ ] Social media integration
- [ ] Dark mode
- [ ] Progressive Web App (PWA)
- [ ] Analytics dashboard

---

## 📊 Project Status

**Current Version:** 1.0.0  
**Status:** Active Development  
**Last Updated:** January 2026

---

**Made with ❤️ by the DevQuery Team**
