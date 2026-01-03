import { prisma } from '@/lib/db'

export async function getCommentsByPostId(postId: string) {
  return prisma.comment.findMany({
    where: {
      postId,
      status: 'approved',
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getAllComments(status?: string) {
  const where = status ? { status } : {}
  return prisma.comment.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  })
}

export async function createComment(data: {
  postId: string
  authorName: string
  authorEmail: string
  content: string
}) {
  return prisma.comment.create({
    data,
  })
}

export async function updateCommentStatus(id: string, status: string) {
  return prisma.comment.update({
    where: { id },
    data: { status },
  })
}

export async function deleteComment(id: string) {
  return prisma.comment.delete({
    where: { id },
  })
}

export async function getCommentCountByPostId(postId: string) {
  return prisma.comment.count({
    where: {
      postId,
      status: 'approved',
    },
  })
}

