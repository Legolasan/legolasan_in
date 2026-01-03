import { prisma } from '@/lib/db'

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  })
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  })
}

export async function createCategory(data: { name: string; slug: string; description?: string }) {
  return prisma.category.create({
    data,
  })
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; description?: string }) {
  return prisma.category.update({
    where: { id },
    data,
  })
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({
    where: { id },
  })
}

export async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  })
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  })
}

export async function createTag(data: { name: string; slug: string }) {
  return prisma.tag.create({
    data,
  })
}

export async function updateTag(id: string, data: { name?: string; slug?: string }) {
  return prisma.tag.update({
    where: { id },
    data,
  })
}

export async function deleteTag(id: string) {
  return prisma.tag.delete({
    where: { id },
  })
}

