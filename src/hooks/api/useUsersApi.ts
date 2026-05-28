// Shim — re-export from features/users/presentation/hooks
// Phase 6 จะอัปเดต component ให้ import จาก @/features/users/presentation/hooks ตรง แล้วลบไฟล์นี้
export {
  useGetUsers,
  useGetSeoDevs,
  useGetManagedCustomers,
  useAddUser,
  useUpdateUser,
  useDeleteUser,
  useRestoreUser,
  useUpdatePassword,
} from '@/features/users/presentation/hooks/useUsers'
