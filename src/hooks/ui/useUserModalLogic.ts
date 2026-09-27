// src/components/shared/users/hooks/useUserModalLogic.ts
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { openUserModal, closeUserModal, setCurrentUser } from '@/store/features/users/usersSlice'
import { useAddUser, useUpdateUser, useUpdatePassword } from '@/hooks/api/useUsersApi'
import { User } from '@/types/user'
import { showPromiseToast } from '@/components/shared/toast/lib/toastify'
import axios from '@/lib/axios'
import { toast } from 'react-toastify'
import { Role } from '@/types/auth'
import { userSelfUpdateSchema, userUpdateSchema } from '@/schemas/user'

// ส่งเฉพาะ field ที่ schema ฝั่ง server รับ — schema เป็น strict (field เกิน = 400)
const pickKeys = (src: object, keys: string[]) =>
  Object.fromEntries(
    Object.entries(src).filter(([key, value]) => keys.includes(key) && value !== undefined),
  )

export const useUserModalLogic = () => {
  const dispatch = useAppDispatch()
  const { isModalOpen, isEditing, currentUser } = useAppSelector((state) => state.users)

  //  React Query Mutations
  const addUserMutation = useAddUser()
  const updateUserMutation = useUpdateUser()
  const updatePasswordMutation = useUpdatePassword()

  const handleOpenUserModal = async (user?: User) => {
    if (user && user.role === Role.CUSTOMER) {
      try {
        const response = await axios.get<{ data: User }>(`/users/${user.id}`)
        const apiUserData = response.data.data
        const flattenedData = {
          ...apiUserData,
          companyName: apiUserData.customerProfile?.name || '',
          domain: apiUserData.customerProfile?.domain || '',
          seoDevId: apiUserData.customerProfile?.seoDevId || null,
          address: apiUserData.customerProfile?.address || '',
          taxId: apiUserData.customerProfile?.taxId || '',
          contactName: apiUserData.customerProfile?.contactName || '',
          phone: apiUserData.customerProfile?.phone || '',
        }
        dispatch(openUserModal(flattenedData))
      } catch (err) {
        console.error('Failed to fetch customer data:', err)
        dispatch(openUserModal(user))
      }
    } else {
      dispatch(openUserModal(user))
    }
  }

  const handleCloseUserModal = () => dispatch(closeUserModal())

  const handleSaveUser = async (sessionUser: { id: string; role: Role }) => {
    if (!currentUser) return
    const infoToUpdate = { ...currentUser }
    delete infoToUpdate.newPassword
    delete infoToUpdate.confirmPassword
    delete infoToUpdate.currentPassword

    if (sessionUser?.role === Role.SEO_DEV && !isEditing && infoToUpdate.role === Role.CUSTOMER) {
      infoToUpdate.seoDevId = sessionUser.id
    }

    // server เลือก schema ตาม role เดียวกันนี้ (ADMIN = update เต็ม, คนอื่น = แก้ตัวเองได้แค่ name/email)
    const updateSchema = sessionUser?.role === Role.ADMIN ? userUpdateSchema : userSelfUpdateSchema
    const promise = isEditing
      ? updateUserMutation.mutateAsync({
          id: infoToUpdate.id!,
          user: pickKeys(infoToUpdate, Object.keys(updateSchema.shape)) as typeof infoToUpdate,
        })
      : addUserMutation.mutateAsync(infoToUpdate)

    showPromiseToast(promise, {
      pending: 'กำลังบันทึกข้อมูล...',
      success: isEditing ? 'อัปเดตผู้ใช้สำเร็จ!' : 'เพิ่มผู้ใช้สำเร็จ!',
      error: 'เกิดข้อผิดพลาดในการบันทึก',
    })

    try {
      await promise
      dispatch(closeUserModal())
    } catch {
      // Error is already handled by the mutation
    }
  }

  const handlePasswordUpdate = () => {
    if (!currentUser || !currentUser.id || !currentUser.newPassword) return

    if (currentUser.newPassword !== currentUser.confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน')
      return
    }

    //  Use React Query mutation
    const promise = updatePasswordMutation.mutateAsync({
      id: currentUser.id,
      currentPassword: currentUser.currentPassword,
      newPassword: currentUser.newPassword,
      confirmPassword: currentUser.confirmPassword || '',
    })

    showPromiseToast(promise, {
      pending: 'กำลังอัปเดตรหัสผ่าน...',
      success: 'อัปเดตรหัสผ่านสำเร็จ!',
      error: 'ไม่สามารถอัปเดตรหัสผ่านได้',
    })

    promise.then(() => dispatch(closeUserModal())).catch(() => {})
  }

  const handleFormChange = (name: string, value: unknown) => {
    dispatch(setCurrentUser({ [name]: value }))
  }

  return {
    isModalOpen,
    isEditing,
    currentUser,
    handleOpenUserModal,
    handleCloseUserModal,
    handleSaveUser,
    handlePasswordUpdate,
    handleFormChange,
  }
}
