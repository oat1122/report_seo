import { Role } from '@/types/auth'
import type { UserRepository } from '../ports/UserRepository'

export function listSeoDevsUseCase(repo: UserRepository) {
  return () => repo.findStaffByRole(Role.SEO_DEV)
}

export function listBlogWritersUseCase(repo: UserRepository) {
  return () => repo.findStaffByRole(Role.BLOG_WRITER)
}
