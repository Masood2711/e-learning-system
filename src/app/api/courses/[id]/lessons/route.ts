import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/courses/[id]/lessons - Get all lessons for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const lessons = await prisma.lesson.findMany({
      where: { 
        courseId: id,
        isActive: true 
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        order: true,
        createdAt: true
      }
    })

    return NextResponse.json(lessons)
  } catch (error) {
    console.error("Error fetching lessons:", error)
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    )
  }
}

// POST /api/courses/[id]/lessons - Create a new lesson (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      )
    }

    const { id } = await params
    const { title, description, content, videoUrl, duration, order } = await request.json()

    // Validate input
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        courseId: id,
        title,
        description: description || null,
        content,
        videoUrl: videoUrl || null,
        duration: parseInt(duration) || 30,
        order: parseInt(order) || 0,
        isActive: true
      }
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    console.error("Error creating lesson:", error)
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    )
  }
}
