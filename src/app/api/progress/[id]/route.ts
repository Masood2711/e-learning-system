import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/progress - Get user's progress
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const progress = await prisma.progress.findMany({
      where: {
        enrollment: {
          userId: session.user.id
        }
      },
      include: {
        enrollment: {
          include: {
            course: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    )
  }
}

// PUT /api/progress/[id] - Update progress
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { completionPercentage, completedLessons, totalLessons } = await request.json()

    // Verify the progress belongs to the user
    const existingProgress = await prisma.progress.findFirst({
      where: {
        id,
        enrollment: {
          userId: session.user.id
        }
      }
    })

    if (!existingProgress) {
      return NextResponse.json(
        { error: "Progress not found or unauthorized" },
        { status: 404 }
      )
    }

    const progress = await prisma.progress.update({
      where: { id },
      data: {
        ...(completionPercentage !== undefined && { completionPercentage }),
        ...(completedLessons !== undefined && { completedLessons }),
        ...(totalLessons !== undefined && { totalLessons }),
        lastAccessedDate: new Date(),
      },
      include: {
        enrollment: {
          include: {
            course: true
          }
        }
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
}
