import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: {
    slug: string;
  };
}

// GET /api/client-projects/[slug] - Get single project (admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { slug } = params;

    // Fetch project
    const project = await prisma.clientProject.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { feedback: true }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });

  } catch (error) {
    console.error('Error fetching client project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/client-projects/[slug] - Update project (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { slug } = params;

    // Check if project exists
    const existingProject = await prisma.clientProject.findUnique({
      where: { slug }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      description,
      githubRepo,
      vercelUrl,
      customDomain,
      status,
      accessEnabled
    } = body;

    // Build update data
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.length > 200) {
        return NextResponse.json(
          { error: 'Invalid name. Must be a string under 200 characters.' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      if (description && description.length > 10000) {
        return NextResponse.json(
          { error: 'Description is too long (max 10000 characters).' },
          { status: 400 }
        );
      }
      updateData.description = description?.trim() || null;
    }

    if (githubRepo !== undefined) {
      if (githubRepo && githubRepo.length > 500) {
        return NextResponse.json(
          { error: 'GitHub repo URL is too long (max 500 characters).' },
          { status: 400 }
        );
      }
      updateData.githubRepo = githubRepo?.trim() || null;
    }

    if (vercelUrl !== undefined) {
      if (vercelUrl && vercelUrl.length > 500) {
        return NextResponse.json(
          { error: 'Vercel URL is too long (max 500 characters).' },
          { status: 400 }
        );
      }
      updateData.vercelUrl = vercelUrl?.trim() || null;
    }

    if (customDomain !== undefined) {
      if (customDomain && customDomain.length > 200) {
        return NextResponse.json(
          { error: 'Custom domain is too long (max 200 characters).' },
          { status: 400 }
        );
      }
      updateData.customDomain = customDomain?.trim() || null;
    }

    if (status !== undefined) {
      if (!['active', 'completed', 'archived'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: active, completed, archived.' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (accessEnabled !== undefined) {
      if (typeof accessEnabled !== 'boolean') {
        return NextResponse.json(
          { error: 'Invalid accessEnabled. Must be a boolean.' },
          { status: 400 }
        );
      }
      updateData.accessEnabled = accessEnabled;
    }

    // Update project
    const project = await prisma.clientProject.update({
      where: { slug },
      data: updateData,
      include: {
        _count: {
          select: { feedback: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Project updated successfully',
      project
    });

  } catch (error) {
    console.error('Error updating client project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/client-projects/[slug] - Delete project (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { slug } = params;

    // Check if project exists
    const existingProject = await prisma.clientProject.findUnique({
      where: { slug }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete project (cascade will delete feedback)
    await prisma.clientProject.delete({
      where: { slug }
    });

    return NextResponse.json({
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting client project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
