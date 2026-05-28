import { BadRequestError, NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import type { UserRepository } from '../ports/UserRepository'
import type { PasswordHasher } from '../ports/PasswordHasher'

export function changePasswordUseCase(repo: UserRepository, hasher: PasswordHasher) {
  return async (
    id: string,
    currentPassword: string | undefined,
    newPassword: string,
    isAdmin: boolean,
    actorId?: string,
  ) => {
    const target = await repo.findPasswordById(id)
    if (!target) {
      throw new NotFoundError('User not found')
    }

    const isSelfChange = actorId !== undefined && actorId === id
    // admin reset user อื่น = trusted ops, ไม่ต้อง currentPassword
    // self-change (รวม admin) = ต้อง verify currentPassword เสมอ
    // เพื่อปิด session-takeover ที่ใช้สิทธิ์ admin rotate password ยึดบัญชี
    const requireCurrentPassword = !isAdmin || isSelfChange

    if (requireCurrentPassword) {
      if (!currentPassword || !target.password) {
        throw new BadRequestError('Current password is required')
      }
      const valid = await hasher.verify(currentPassword, target.password)
      if (!valid) {
        throw new BadRequestError('Invalid current password')
      }
    }

    if (isAdmin && actorId) {
      // log audit trail ทุกครั้งที่เปลี่ยน password ผ่านสิทธิ์ admin
      // - reset user อื่น: ตามรอย compromised admin
      // - self-change: ตามรอย session takeover ที่ rotate password ของตัวเอง
      logger.warn(
        {
          targetUserId: id,
          actorId,
          isSelfChange,
          event: 'admin_password_change',
        },
        'admin changed user password',
      )
    }

    const hashedNewPassword = await hasher.hash(newPassword)
    await repo.updatePassword(id, hashedNewPassword)
  }
}
