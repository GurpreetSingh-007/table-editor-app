# Interactive Table Editor

A collaborative real-time table editor built with React, Node.js, PostgreSQL, and Redis. Features nested tables, content types, freeze functionality, and real-time user collaboration.

## 🚀 Live Demo

- **Frontend**: [Live Application](https://table-editor-app.vercel.app)
- **Backend API**: [API Endpoint](https://table-editor-backend.railway.app)
- **Repository**: [GitHub Source](https://github.com/GurpreetSingh-007/table-editor-app)

## ✨ Features

### Core Functionality
- ✅ **Interactive Table Editing** - Add, edit, delete cells with various content types
- ✅ **Nested Tables** - Create tables within table cells with multiple size options
- ✅ **Content Types** - Support for text, images, code blocks, action lists, diagrams
- ✅ **Freeze Functionality** - Freeze rows and columns for better navigation
- ✅ **Real-time Collaboration** - See active users and collaborate in real-time

### Advanced Features
- ✅ **Drag & Drop** - Upload images via drag and drop
- ✅ **Context Menus** - Right-click for cell operations
- ✅ **Responsive Design** - Works on desktop and mobile devices
- ✅ **Professional UI** - Clean, modern interface with hover effects

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **JavaScript ES6+** - No external UI libraries (as per requirements)
- **CSS3** - Custom styling with flexbox and grid

### Backend
- **Node.js** - Express-like server implementation
- **PostgreSQL** - Relational database for data persistence
- **Redis** - In-memory store for real-time features (mocked for development)

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Railway PostgreSQL
- **Version Control**: GitHub

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GurpreetSingh-007/table-editor-app.git
   cd table-editor-app
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Setup database
   npm run setup-db
   
   # Start backend server
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Start frontend development server
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
table-editor-app/
├── backend/                 # Node.js Backend
│   ├── server.js           # Main server file
│   ├── database/           # Database setup and queries
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── InteractiveTable.js
│   │   │   ├── ActiveUsersList.js
│   │   │   └── TableEditor.js
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.js          # Main React app
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── README.md               # This file
└── .gitignore             # Git ignore rules
```

## 🚀 Deployment

### Backend Deployment (Railway)
1. Connect GitHub repository to Railway
2. Set environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `PORT` - Server port (auto-assigned by Railway)
   - `CORS_ORIGIN` - Frontend URL

### Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Set build settings:
   - Framework: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
3. Set environment variables:
   - `REACT_APP_API_URL` - Backend API URL

## 🔧 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/tabledb
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001
```

## 📊 Database Schema

### Tables Table
```sql
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Tables
- `GET /api/tables/:userId` - Get user tables
- `POST /api/tables` - Create new table
- `PUT /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table

### Real-time
- `POST /api/active-users/add` - Add active user
- `GET /api/active-users` - Get active users
- `DELETE /api/active-users/:userId` - Remove active user

## 🔍 Key Components

### InteractiveTable.js
- Main table component with editing capabilities
- Handles nested tables, content types, and freeze functionality
- Manages dropdown menus and context menus

### ActiveUsersList.js
- Sidebar component showing real-time active users
- Displays collaboration status and user management

### useActiveUsers.js
- Custom hook for managing real-time collaboration
- Handles API calls for active user tracking

## 🎨 Design Decisions

### No External Libraries
- Built entirely with vanilla React and CSS (as per assignment requirements)
- Custom implementations for all UI components and interactions

### Dropdown Positioning
- Advanced positioning system using fixed positioning and calculated coordinates
- Prevents table cell expansion while maintaining proper menu placement

### Real-time Collaboration
- Polling-based approach for active user tracking
- Optimized to minimize API calls while maintaining responsiveness

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Manual Testing Checklist
- [ ] Table creation and editing
- [ ] Nested table functionality
- [ ] Content type switching
- [ ] Freeze/unfreeze features
- [ ] Real-time collaboration
- [ ] Responsive design
- [ ] Cross-browser compatibility

## 🐛 Known Issues

- Real-time updates use polling (can be upgraded to WebSockets for production)
- Image uploads are base64 encoded (can be upgraded to cloud storage)

## 🚀 Future Enhancements

- WebSocket real-time updates
- Cloud image storage (AWS S3/Cloudinary)
- Table import/export functionality
- Advanced formatting options
- Collaborative cursors
- Version history

## 📝 Assignment Requirements Checklist

- ✅ **Interactive table editor** with full CRUD operations
- ✅ **Nested tables** with multiple size options
- ✅ **Content types** (text, images, code, etc.)
- ✅ **Real-time collaboration** with active users
- ✅ **No external libraries** (vanilla React/JS)
- ✅ **Professional UI/UX** with modern design
- ✅ **Cloud deployment** (Frontend + Backend + Database)
- ✅ **Public GitHub repository** with complete source code

## 👨‍💻 Developer

**Gurpreet Singh**
- GitHub: [@GurpreetSingh-007](https://github.com/GurpreetSingh-007)
- Email: abcjob485@gmail.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Assignment submitted for [Course Name] - [Date]**
