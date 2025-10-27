"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: number
  price: number
  isActive: boolean
  createdAt: string
}

interface Student {
  id: string
  name: string
  email: string
  createdAt: string
  enrollments: any[]
}

interface Lesson {
  id: string
  title: string
  description?: string
  content: string
  videoUrl?: string
  duration: number
  order: number
  isActive: boolean
  createdAt: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'courses' | 'students' | 'lessons'>('courses')
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    duration: "",
    price: ""
  })
  const [studentFormData, setStudentFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: ""
  })
  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    duration: "",
    order: ""
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if ((session.user as any)?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    fetchCourses()
    fetchStudents()
  }, [session, status, router])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      if (response.ok) {
        const coursesData = await response.json()
        setCourses(coursesData)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/students")
      if (response.ok) {
        const studentsData = await response.json()
        setStudents(studentsData)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchLessons = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`)
      if (response.ok) {
        const lessonsData = await response.json()
        setLessons(lessonsData)
      }
    } catch (error) {
      console.error("Error fetching lessons:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ title: "", description: "", instructor: "", duration: "", price: "" })
        setShowForm(false)
        fetchCourses()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create course")
      }
    } catch (error) {
      console.error("Error creating course:", error)
      alert("Failed to create course")
    }
  }

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentFormData),
      })

      if (response.ok) {
        setStudentFormData({ name: "", email: "", password: "", college: "" })
        setShowStudentForm(false)
        fetchStudents()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create student")
      }
    } catch (error) {
      console.error("Error creating student:", error)
      alert("Failed to create student")
    }
  }

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return
    
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lessonFormData),
      })

      if (response.ok) {
        setLessonFormData({ title: "", description: "", content: "", videoUrl: "", duration: "", order: "" })
        setShowLessonForm(false)
        fetchLessons(selectedCourse.id)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create lesson")
      }
    } catch (error) {
      console.error("Error creating lesson:", error)
      alert("Failed to create lesson")
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCourses()
      } else {
        alert("Failed to delete course")
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      alert("Failed to delete course")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  if (activeTab === 'courses') {
                    setShowForm(!showForm)
                  } else if (activeTab === 'students') {
                    setShowStudentForm(!showStudentForm)
                  } else if (activeTab === 'lessons') {
                    setShowLessonForm(!showLessonForm)
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              >
                {activeTab === 'courses' 
                  ? (showForm ? "Cancel" : "Add Course")
                  : activeTab === 'students'
                  ? (showStudentForm ? "Cancel" : "Add Student")
                  : (showLessonForm ? "Cancel" : "Add Lesson")
                }
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'courses'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('lessons')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lessons'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lessons
              </button>
            </nav>
          </div>
        </div>

        {/* Add Course Form */}
        {showForm && activeTab === 'courses' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Course</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Student Form */}
        {showStudentForm && activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Student</h2>
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={studentFormData.name}
                    onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={studentFormData.email}
                    onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={studentFormData.password}
                  onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College/School
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={studentFormData.college}
                  onChange={(e) => setStudentFormData({ ...studentFormData, college: e.target.value })}
                  placeholder="Enter college/school name"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowStudentForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Student
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courses List */}
        {activeTab === 'courses' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-2">{course.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Instructor: {course.instructor} | Duration: {course.duration}h | Price: ${course.price}
                </p>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Students List */}
        {activeTab === 'students' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All Students</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {students.map((student) => (
                  <li key={student.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">
                            Enrolled in {student.enrollments.length} course(s)
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined: {new Date(student.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                {students.length === 0 && (
                  <li>
                    <div className="px-4 py-8 text-center text-gray-500">
                      No students found. Create your first student!
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Add Lesson Form */}
        {showLessonForm && activeTab === 'lessons' && selectedCourse && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Add New Lesson to "{selectedCourse.title}"
            </h2>
            <form onSubmit={handleLessonSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={lessonFormData.title}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={lessonFormData.duration}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  value={lessonFormData.description}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={8}
                  placeholder="Enter lesson content (text, HTML, or markdown)..."
                  value={lessonFormData.content}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, content: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL (optional)
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://youtube.com/watch?v=..."
                    value={lessonFormData.videoUrl}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, videoUrl: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={lessonFormData.order}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, order: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowLessonForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Lesson
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lessons Management */}
        {activeTab === 'lessons' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Lessons</h2>
            
            {/* Course Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course to Manage Lessons
              </label>
              <select
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedCourse?.id || ""}
                onChange={(e) => {
                  const course = courses.find(c => c.id === e.target.value)
                  setSelectedCourse(course || null)
                  if (course) {
                    fetchLessons(course.id)
                  }
                }}
              >
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Lessons List */}
            {selectedCourse && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lessons for "{selectedCourse.title}"
                </h3>
                {lessons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="bg-white rounded-lg shadow-md p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {lesson.title}
                        </h4>
                        {lesson.description && (
                          <p className="text-gray-600 text-sm mb-2">{lesson.description}</p>
                        )}
                        <div className="text-sm text-gray-500 mb-2">
                          Duration: {lesson.duration} minutes | Order: {lesson.order}
                        </div>
                        {lesson.videoUrl && (
                          <div className="text-sm text-blue-600 mb-2">
                            📹 Video Available
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            lesson.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {lesson.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this lesson?")) {
                                fetch(`/api/lessons/${lesson.id}`, { method: 'DELETE' })
                                  .then(() => fetchLessons(selectedCourse.id))
                                  .catch(err => console.error(err))
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No lessons found for this course. Create your first lesson!
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
