"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: number
  price: number
}

interface Enrollment {
  id: string
  course: Course
  enrollmentDate: string
  status: string
  progress: {
    completionPercentage: number
    completedLessons: number
    totalLessons: number
  }[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if ((session.user as any)?.role === "ADMIN") {
      router.push("/admin")
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [enrollmentsRes, coursesRes] = await Promise.all([
        fetch("/api/enrollments"),
        fetch("/api/courses")
      ])

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json()
        setEnrollments(enrollmentsData)
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      })

      if (response.ok) {
        fetchData() // Refresh data
      } else {
        const error = await response.json()
        alert(error.error || "Failed to enroll")
      }
    } catch (error) {
      console.error("Error enrolling:", error)
      alert("Failed to enroll in course")
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
              Welcome, {session?.user?.name}
            </h1>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Courses</h2>
          {enrollments.length === 0 ? (
            <p className="text-gray-600">You haven't enrolled in any courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{enrollment.course.description}</p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{enrollment.progress[0]?.completionPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${enrollment.progress[0]?.completionPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link
                    href={`/course/${enrollment.course.id}`}
                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Continue Learning →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Courses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isEnrolled = enrollments.some(e => e.course.id === course.id)
              return (
                <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{course.description}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Instructor: {course.instructor} | Duration: {course.duration}h
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-indigo-600">
                      ${course.price}
                    </span>
                    {isEnrolled ? (
                      <span className="text-green-600 font-medium">Enrolled</span>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
