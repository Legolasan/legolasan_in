import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/client-projects - List all client projects (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build query
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Fetch projects with feedback count
    const projects = await prisma.clientProject.findMany({
      where,
      include: {
        _count: {
          select: { feedback: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ projects });

  } catch (error) {
    console.error('Error fetching client projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/client-projects - Create new client project (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, slug, description, githubRepo, vercelUrl, customDomain, status } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.length > 200) {
      return NextResponse.json(
        { error: 'Invalid name. Must be a string under 200 characters.' },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== 'string' || slug.length > 100) {
      return NextResponse.json(
        { error: 'Invalid slug. Must be a string under 100 characters.' },
        { status: 400 }
      );
    }

    // Validate slug format (URL-friendly)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProject = await prisma.clientProject.findUnique({
      where: { slug }
    });

    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this slug already exists.' },
        { status: 409 }
      );
    }

    // Validate optional fields
    if (description && description.length > 10000) {
      return NextResponse.json(
        { error: 'Description is too long (max 10000 characters).' },
        { status: 400 }
      );
    }

    if (githubRepo && githubRepo.length > 500) {
      return NextResponse.json(
        { error: 'GitHub repo URL is too long (max 500 characters).' },
        { status: 400 }
      );
    }

    if (vercelUrl && vercelUrl.length > 500) {
      return NextResponse.json(
        { error: 'Vercel URL is too long (max 500 characters).' },
        { status: 400 }
      );
    }

    if (customDomain && customDomain.length > 200) {
      return NextResponse.json(
        { error: 'Custom domain is too long (max 200 characters).' },
        { status: 400 }
      );
    }

    // Create project
    const project = await prisma.clientProject.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description?.trim() || null,
        githubRepo: githubRepo?.trim() || null,
        vercelUrl: vercelUrl?.trim() || null,
        customDomain: customDomain?.trim() || null,
        status: status || 'active'
      },
      include: {
        _count: {
          select: { feedback: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Project created successfully',
      project
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating client project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
