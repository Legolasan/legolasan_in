import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimiters, getClientIP } from '@/lib/rateLimit';

// GET /api/client-feedback - List feedback (admin or valid token)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectSlug = searchParams.get('projectSlug');
    const pagePath = searchParams.get('pagePath');
    const status = searchParams.get('status');
    const token = searchParams.get('token');

    // Check authentication (admin session OR valid token)
    const session = await getServerSession(authOptions);
    const isAdmin = session && session.user.role === 'admin';

    if (!isAdmin && !token) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin session or access token required.' },
        { status: 401 }
      );
    }

    // Validate token if provided (non-admin)
    let project = null;
    if (!isAdmin && token) {
      if (!projectSlug) {
        return NextResponse.json(
          { error: 'projectSlug is required when using token authentication' },
          { status: 400 }
        );
      }

      // Verify token matches project
      project = await prisma.clientProject.findFirst({
        where: {
          slug: projectSlug,
          accessToken: token,
          accessEnabled: true
        }
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Invalid access token or project not found' },
          { status: 401 }
        );
      }
    }

    // Build query
    const where: any = {};

    if (projectSlug) {
      if (!project && !isAdmin) {
        // If not admin and no valid project found
        return NextResponse.json(
          { error: 'Invalid access token' },
          { status: 401 }
        );
      }

      if (project) {
        where.projectId = project.id;
      } else {
        // Admin can query by slug
        const adminProject = await prisma.clientProject.findUnique({
          where: { slug: projectSlug }
        });

        if (!adminProject) {
          return NextResponse.json(
            { error: 'Project not found' },
            { status: 404 }
          );
        }

        where.projectId = adminProject.id;
      }
    }

    if (pagePath) {
      where.pagePath = pagePath;
    }

    if (status && isAdmin) {
      where.status = status;
    }

    // Fetch feedback
    const feedback = await prisma.clientFeedback.findMany({
      where,
      include: {
        project: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Remove sensitive data for non-admin
    if (!isAdmin) {
      const sanitized = feedback.map(f => ({
        id: f.id,
        content: f.content,
        pageUrl: f.pageUrl,
        pagePath: f.pagePath,
        positionX: f.positionX,
        positionY: f.positionY,
        clientName: f.clientName,
        status: f.status,
        createdAt: f.createdAt
      }));

      return NextResponse.json({ feedback: sanitized });
    }

    return NextResponse.json({ feedback });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// POST /api/client-feedback - Submit feedback (with valid token)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimiters.standard.check(clientIP);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      projectSlug,
      accessToken,
      content,
      pageUrl,
      pagePath,
      elementSelector,
      elementText,
      elementHtml,
      screenshotData,
      positionX,
      positionY,
      viewportWidth,
      viewportHeight,
      clientName,
      clientEmail
    } = body;

    // Validate required fields
    if (!projectSlug || !accessToken || !content || !pageUrl || !pagePath) {
      return NextResponse.json(
        { error: 'Missing required fields: projectSlug, accessToken, content, pageUrl, pagePath' },
        { status: 400 }
      );
    }

    // Verify project and token
    const project = await prisma.clientProject.findFirst({
      where: {
        slug: projectSlug,
        accessToken: accessToken,
        accessEnabled: true
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Invalid access token or project not found' },
        { status: 401 }
      );
    }

    // Validate content length
    if (typeof content !== 'string' || content.length > 10000) {
      return NextResponse.json(
        { error: 'Content must be a string under 10000 characters' },
        { status: 400 }
      );
    }

    // Validate URLs
    if (typeof pageUrl !== 'string' || pageUrl.length > 1000) {
      return NextResponse.json(
        { error: 'Invalid pageUrl' },
        { status: 400 }
      );
    }

    if (typeof pagePath !== 'string' || pagePath.length > 500) {
      return NextResponse.json(
        { error: 'Invalid pagePath' },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (elementSelector && elementSelector.length > 500) {
      return NextResponse.json(
        { error: 'Element selector is too long' },
        { status: 400 }
      );
    }

    if (elementText && elementText.length > 10000) {
      return NextResponse.json(
        { error: 'Element text is too long' },
        { status: 400 }
      );
    }

    if (elementHtml && elementHtml.length > 10000) {
      return NextResponse.json(
        { error: 'Element HTML is too long' },
        { status: 400 }
      );
    }

    if (clientName && clientName.length > 100) {
      return NextResponse.json(
        { error: 'Client name is too long (max 100 characters)' },
        { status: 400 }
      );
    }

    if (clientEmail && clientEmail.length > 200) {
      return NextResponse.json(
        { error: 'Client email is too long (max 200 characters)' },
        { status: 400 }
      );
    }

    // Get user agent
    const userAgent = request.headers.get('user-agent') || null;

    // Create feedback
    const feedback = await prisma.clientFeedback.create({
      data: {
        projectId: project.id,
        content: content.trim(),
        pageUrl: pageUrl.trim(),
        pagePath: pagePath.trim(),
        elementSelector: elementSelector?.trim() || null,
        elementText: elementText?.trim() || null,
        elementHtml: elementHtml?.trim() || null,
        screenshotData: screenshotData || null,
        positionX: positionX || null,
        positionY: positionY || null,
        viewportWidth: viewportWidth || null,
        viewportHeight: viewportHeight || null,
        clientName: clientName?.trim() || null,
        clientEmail: clientEmail?.trim() || null,
        ipAddress: clientIP !== 'unknown' ? clientIP : null,
        userAgent: userAgent
      }
    });

    return NextResponse.json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback.id,
        createdAt: feedback.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// PUT /api/client-feedback - Update feedback status (admin only)
export async function PUT(request: NextRequest) {
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
    const { id, status, priority, category, adminNotes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    // Check if feedback exists
    const existingFeedback = await prisma.clientFeedback.findUnique({
      where: { id }
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (status !== undefined) {
      if (!['open', 'in_progress', 'resolved', 'archived'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: open, in_progress, resolved, archived' },
          { status: 400 }
        );
      }
      updateData.status = status;

      // Set resolvedAt and resolvedBy if marking as resolved
      if (status === 'resolved' && existingFeedback.status !== 'resolved') {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = session.user.email || session.user.name || 'admin';
      }
    }

    if (priority !== undefined) {
      if (!['low', 'normal', 'high', 'urgent'].includes(priority)) {
        return NextResponse.json(
          { error: 'Invalid priority. Must be one of: low, normal, high, urgent' },
          { status: 400 }
        );
      }
      updateData.priority = priority;
    }

    if (category !== undefined) {
      if (category && category.length > 100) {
        return NextResponse.json(
          { error: 'Category is too long (max 100 characters)' },
          { status: 400 }
        );
      }
      updateData.category = category?.trim() || null;
    }

    if (adminNotes !== undefined) {
      if (adminNotes && adminNotes.length > 10000) {
        return NextResponse.json(
          { error: 'Admin notes are too long (max 10000 characters)' },
          { status: 400 }
        );
      }
      updateData.adminNotes = adminNotes?.trim() || null;
    }

    // Update feedback
    const feedback = await prisma.clientFeedback.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      message: 'Feedback updated successfully',
      feedback
    });

  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
