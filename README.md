# E-Learning Course Management System

A modern web-based e-learning platform built with Next.js, MongoDB, and Prisma. This system allows administrators to create and manage courses while students can register, enroll in courses, and track their learning progress.

## Features

### User Authentication & Authorization
- **Role-based access control** (Admin, Student)
- **Email/password authentication** using NextAuth.js
- **Secure session management**
- **Protected routes** based on user roles

### Course Management
- **CRUD operations** for courses (Create, Read, Update, Delete)
- **Course details** including title, description, instructor, duration, and price
- **Course status management** (Active/Inactive)
- **Admin dashboard** for course management

### Enrollment System
- **Student enrollment** in courses
- **Enrollment status tracking** (Active, Completed, Cancelled)
- **Duplicate enrollment prevention**
- **Enrollment history** for students

### Progress Tracking
- **Real-time progress tracking** for each enrolled course
- **Completion percentage** calculation
- **Lesson completion tracking**
- **Last accessed date** recording
- **Progress visualization** with progress bars

### User Interface
- **Responsive design** using Tailwind CSS
- **Modern and intuitive UI** components
- **Mobile-friendly** interface
- **Real-time updates** and feedback

## Technology Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **Password Hashing**: bcryptjs

## Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Git installed

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd e-learning-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/e-learning-system?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# App
NODE_ENV="development"
```

**Important**: Replace the MongoDB connection string with your actual database credentials.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Database Schema

### User Model
- `id`: Unique identifier (ObjectId)
- `email`: User email (unique)
- `password`: Hashed password
- `name`: User's full name
- `role`: User role (ADMIN or STUDENT)
- `createdAt`: Account creation date
- `updatedAt`: Last update date

### Course Model
- `id`: Unique identifier (ObjectId)
- `title`: Course title
- `description`: Course description
- `instructor`: Instructor name
- `duration`: Course duration in hours
- `price`: Course price
- `isActive`: Course status
- `createdAt`: Course creation date
- `updatedAt`: Last update date

### Enrollment Model
- `id`: Unique identifier (ObjectId)
- `userId`: Reference to User
- `courseId`: Reference to Course
- `enrollmentDate`: Enrollment date
- `status`: Enrollment status (ACTIVE, COMPLETED, CANCELLED)

### Progress Model
- `id`: Unique identifier (ObjectId)
- `enrollmentId`: Reference to Enrollment
- `completionPercentage`: Progress percentage (0-100)
- `lastAccessedDate`: Last access date
- `completedLessons`: Number of completed lessons
- `totalLessons`: Total number of lessons
- `createdAt`: Progress record creation date
- `updatedAt`: Last update date

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Courses
- `GET /api/courses` - Get all active courses
- `POST /api/courses` - Create new course (Admin only)
- `GET /api/courses/[id]` - Get specific course
- `PUT /api/courses/[id]` - Update course (Admin only)
- `DELETE /api/courses/[id]` - Delete course (Admin only)

### Enrollments
- `GET /api/enrollments` - Get user's enrollments
- `POST /api/enrollments` - Enroll in a course

### Progress
- `GET /api/progress` - Get user's progress
- `PUT /api/progress/[id]` - Update progress

## User Roles & Permissions

### Admin Role
- Create, update, and delete courses
- View all course enrollments
- Access admin dashboard
- Manage course status

### Student Role
- Browse available courses
- Enroll in courses
- Track learning progress
- Access course content
- View enrollment history

## Usage Guide

### For Administrators

1. **Sign up** with admin credentials
2. **Access admin dashboard** at `/admin`
3. **Create courses** using the "Add Course" form
4. **Manage existing courses** (edit, delete, activate/deactivate)
5. **Monitor student enrollments** and progress

### For Students

1. **Sign up** for a student account
2. **Browse available courses** on the dashboard
3. **Enroll in courses** by clicking "Enroll" button
4. **Access course content** and track progress
5. **View enrollment history** and progress

## Development

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # Student dashboard
│   └── course/            # Course detail pages
├── components/            # React components
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Prisma client
└── prisma/               # Database schema
    └── schema.prisma
```

### Key Features Implementation

- **Authentication**: NextAuth.js with credentials provider
- **Database**: Prisma ORM with MongoDB
- **UI**: Tailwind CSS for responsive design
- **State Management**: React hooks and context
- **API**: Next.js API routes with proper error handling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository or contact the development team.

## Future Enhancements

- Video content integration
- Quiz and assessment system
- Certificate generation
- Discussion forums
- Mobile app development
- Advanced analytics dashboard
- Payment integration
- Course categories and tags
- Instructor profiles
- Course reviews and ratings