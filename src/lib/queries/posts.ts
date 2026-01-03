import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export interface BlogPostWithRelations {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featuredImage: string | null
  status: string
  authorId: string
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  categories: {
    category: {
      id: string
      name: string
      slug: string
    }
  }[]
  tags: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
  _count: {
    comments: number
  }
}

export async function getPublishedPosts(
  page: number = 1,
  limit: number = 10,
  categorySlug?: string,
  tagSlug?: string
) {
  const skip = (page - 1) * limit

  const where: Prisma.BlogPostWhereInput = {
    status: 'published',
    publishedAt: {
      lte: new Date(),
    },
    ...(categorySlug && {
      categories: {
        some: {
          category: {
            slug: categorySlug,
          },
        },
      },
    }),
    ...(tagSlug && {
      tags: {
        some: {
          tag: {
            slug: tagSlug,
          },
        },
      },
    }),
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),
    prisma.blogPost.count({ where }),
  ])

  return {
    posts: posts as BlogPostWithRelations[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      comments: {
        where: {
          status: 'approved',
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
}

export async function searchPosts(query: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit

  const where: Prisma.BlogPostWhereInput = {
    status: 'published',
    publishedAt: {
      lte: new Date(),
    },
    OR: [
      {
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        excerpt: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ],
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),
    prisma.blogPost.count({ where }),
  ])

  return {
    posts: posts as BlogPostWithRelations[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getAllPostsForAdmin() {
  return prisma.blogPost.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  })
}

export async function getPostById(id: string) {
  return prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })
}

export async function createPost(data: {
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  status: string
  authorId: string
  categoryIds?: string[]
  tagIds?: string[]
  publishedAt?: Date
}) {
  const { categoryIds, tagIds, ...postData } = data

  return prisma.blogPost.create({
    data: {
      ...postData,
      categories: categoryIds
        ? {
            create: categoryIds.map((catId) => ({
              categoryId: catId,
            })),
          }
        : undefined,
      tags: tagIds
        ? {
            create: tagIds.map((tagId) => ({
              tagId: tagId,
            })),
          }
        : undefined,
    },
    include: {
      author: true,
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })
}

export async function updatePost(
  id: string,
  data: {
    title?: string
    slug?: string
    content?: string
    excerpt?: string
    featuredImage?: string
    status?: string
    categoryIds?: string[]
    tagIds?: string[]
    publishedAt?: Date | null
  }
) {
  const { categoryIds, tagIds, ...postData } = data

  // First, update the post
  const post = await prisma.blogPost.update({
    where: { id },
    data: postData,
  })

  // Update categories if provided
  if (categoryIds !== undefined) {
    await prisma.postCategory.deleteMany({
      where: { postId: id },
    })
    if (categoryIds.length > 0) {
      await prisma.postCategory.createMany({
        data: categoryIds.map((catId) => ({
          postId: id,
          categoryId: catId,
        })),
      })
    }
  }

  // Update tags if provided
  if (tagIds !== undefined) {
    await prisma.postTag.deleteMany({
      where: { postId: id },
    })
    if (tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: tagIds.map((tagId) => ({
          postId: id,
          tagId: tagId,
        })),
      })
    }
  }

  return prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: true,
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })
}

export async function deletePost(id: string) {
  return prisma.blogPost.delete({
    where: { id },
  })
}

