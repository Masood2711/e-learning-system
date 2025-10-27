"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: number
  price: number
  enrollments: Array<{
    user: {
      id: string
      name: string
      email: string
    }
  }>
}

interface Progress {
  id: string
  completionPercentage: number
  completedLessons: number
  totalLessons: number
  lastAccessedDate: string
}

export default function CourseDetail() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchCourseData()
  }, [session, router, params.id])

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`)
      if (response.ok) {
        const courseData = await response.json()
        setCourse(courseData)
        
        // Check if user is enrolled
        const enrollment = courseData.enrollments.find(
          (e: any) => e.user.id === session?.user?.id
        )
        setIsEnrolled(!!enrollment)

        if (enrollment) {
          // Fetch progress data
          const progressResponse = await fetch(`/api/progress/${enrollment.id}`)
          if (progressResponse.ok) {
            const progressData = await progressResponse.json()
            setProgress(progressData)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching course data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: params.id }),
      })

      if (response.ok) {
        setIsEnrolled(true)
        fetchCourseData()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to enroll")
      }
    } catch (error) {
      console.error("Error enrolling:", error)
      alert("Failed to enroll in course")
    }
  }

  const updateProgress = async (newProgress: number) => {
    if (!progress) return

    try {
      const response = await fetch(`/api/progress/${progress.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completionPercentage: newProgress,
          completedLessons: Math.floor((newProgress / 100) * progress.totalLessons),
        }),
      })

      if (response.ok) {
        const updatedProgress = await response.json()
        setProgress(updatedProgress)
      }
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Course not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <button
              onClick={() => router.back()}
              className="text-indigo-600 hover:text-indigo-500"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Description</h2>
              <p className="text-gray-600 mb-6">{course.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">Instructor</span>
                  <p className="text-lg text-gray-900">{course.instructor}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Duration</span>
                  <p className="text-lg text-gray-900">{course.duration} hours</p>
                </div>
              </div>

              {isEnrolled && progress && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Progress</h3>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {progress.completedLessons} of {progress.totalLessons} lessons completed
                  </p>
                  
                  {/* Progress Controls */}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => updateProgress(Math.max(0, progress.completionPercentage - 10))}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => updateProgress(Math.min(100, progress.completionPercentage + 10))}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      +10%
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Course Lessons (Mock Content) */}
            {isEnrolled && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Lessons</h3>
                <div className="space-y-3">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Lesson {i + 1}</h4>
                        <p className="text-sm text-gray-600">Introduction to topic {i + 1}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">30 min</span>
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Info</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">Price</span>
                  <p className="text-2xl font-bold text-indigo-600">${course.price}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Students Enrolled</span>
                  <p className="text-lg text-gray-900">{course.enrollments.length}</p>
                </div>
              </div>

              {!isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium"
                >
                  Enroll Now
                </button>
              ) : (
                <div className="text-center">
                  <div className="text-green-600 font-medium mb-2">✓ Enrolled</div>
                  <p className="text-sm text-gray-600">You have access to all course content</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
