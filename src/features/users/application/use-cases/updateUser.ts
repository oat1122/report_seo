import { Role } from '@/types/auth'
import { ConflictError, NotFoundError } from '@/lib/errors'
import type { UserRepository } from '../ports/UserRepository'
import type { UserUpdateInput, UserSelfUpdateInput } from '../../schemas'

export function updateUserUseCase(repo: UserRepository) {
  return async (id: string, data: UserUpdateInput | UserSelfUpdateInput) => {
    const fullData = data as UserUpdateInput
    const existing = await repo.findById(id, { includeAdminFields: true })

    if (!existing) {
      throw new NotFoundError('User not found')
    }

    if (fullData.role === Role.CUSTOMER && fullData.domain && fullData.domain.length > 0) {
      const conflict = await repo.findCustomerByDomain(fullData.domain, id)
      if (conflict) {
        throw new ConflictError(
          `Domain "${fullData.domain}" is already registered to another customer.`,
        )
      }
    }

    return repo.applyUpdate(id, fullData, {
      existingCustomerProfile: Boolean(existing.customerProfile),
    })
  }
}
