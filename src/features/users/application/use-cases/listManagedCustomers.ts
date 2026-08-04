import type { UserRepository } from '../ports/UserRepository'

export function listManagedCustomersUseCase(repo: UserRepository) {
  return (seoDevId: string) => repo.findManagedCustomers(seoDevId)
}

export function listBlogAssignedCustomersUseCase(repo: UserRepository) {
  return (blogWriterId: string) => repo.findBlogAssignedCustomers(blogWriterId)
}
