import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/client-feedback/export - Export feedback as CSV (admin only)
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

    const { searchParams } = new URL(request.url);
    const projectSlug = searchParams.get('projectSlug');

    if (!projectSlug) {
      return NextResponse.json(
        { error: 'projectSlug is required' },
        { status: 400 }
      );
    }

    // Get project
    const project = await prisma.clientProject.findUnique({
      where: { slug: projectSlug }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch all feedback for project
    const feedback = await prisma.clientFeedback.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV
    const csvHeaders = [
      'ID',
      'Date',
      'Status',
      'Priority',
      'Category',
      'Client Name',
      'Client Email',
      'Page Path',
      'Page URL',
      'Element Selector',
      'Element Text',
      'Content',
      'Position X',
      'Position Y',
      'Viewport Width',
      'Viewport Height',
      'IP Address',
      'Admin Notes',
      'Resolved At',
      'Resolved By'
    ].join(',');

    const csvRows = feedback.map(f => {
      const escapeCsv = (str: string | null) => {
        if (!str) return '';
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        f.id,
        f.createdAt.toISOString(),
        f.status,
        f.priority || '',
        f.category || '',
        escapeCsv(f.clientName),
        escapeCsv(f.clientEmail),
        escapeCsv(f.pagePath),
        escapeCsv(f.pageUrl),
        escapeCsv(f.elementSelector),
        escapeCsv(f.elementText),
        escapeCsv(f.content),
        f.positionX || '',
        f.positionY || '',
        f.viewportWidth || '',
        f.viewportHeight || '',
        escapeCsv(f.ipAddress),
        escapeCsv(f.adminNotes),
        f.resolvedAt ? f.resolvedAt.toISOString() : '',
        escapeCsv(f.resolvedBy)
      ].join(',');
    });

    const csv = [csvHeaders, ...csvRows].join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="feedback-${projectSlug}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to export feedback' },
      { status: 500 }
    );
  }
}
