import { NotFoundError } from '@/lib/errors'
import type { UserRepository } from '../ports/UserRepository'

export function restoreUserUseCase(repo: UserRepository) {
  return async (id: string) => {
    const existing = await repo.findIdAndDeletedAtIncludingDeleted(id)
    if (!existing || existing.deletedAt === null) {
      throw new NotFoundError('ไม่พบผู้ใช้ที่ถูกลบ')
    }
    return repo.restoreSoftDeleted(id)
  }
}
