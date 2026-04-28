// src/services/UserService.ts
import { prisma, prismaBase } from "@/lib/prisma";
import { Role } from "@/types/auth";
import {
  UserCreateInput,
  UserUpdateInput,
  UserSelfUpdateInput,
} from "@/schemas/user";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/lib/errors";
import bcrypt from "bcrypt";

// select สำหรับ admin/staff — เห็น seoDevId ของลูกค้า
const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  deletedAt: true,
  customerProfile: {
    select: {
      name: true,
      domain: true,
      seoDevId: true,
    },
  },
} as const;

// select สำหรับ caller ที่ไม่ใช่ admin — ไม่เปิดเผย seoDevId
const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  deletedAt: true,
  customerProfile: {
    select: {
      name: true,
      domain: true,
    },
  },
} as const;

class UserService {
  /**
   * ดึงผู้ใช้ทั้งหมด (admin only — เห็น seoDevId)
   * ถ้า includeDeleted=true ใช้ prismaBase เพื่อ bypass extension ที่กรอง deletedAt: null
   */
  public async getUsers(includeDeleted: boolean) {
    const client = includeDeleted ? prismaBase : prisma;
    return client.user.findMany({
      orderBy: { createdAt: "desc" },
      select: adminUserSelect,
    });
  }

  /**
   * ดึงผู้ใช้รายบุคคล
   * - includeAdminFields=true → เห็น seoDevId (สำหรับ admin)
   * - false → ปกติ (สำหรับ user เอง / caller ไม่มีสิทธิ์เห็นการ assign)
   */
  public async getUserById(
    id: string,
    options: { includeAdminFields: boolean } = { includeAdminFields: false },
  ) {
    return prisma.user.findUnique({
      where: { id },
      select: options.includeAdminFields ? adminUserSelect : publicUserSelect,
    });
  }

  /**
   * ดึง SEO Devs ทั้งหมด
   */
  public async getSeoDevs() {
    return prisma.user.findMany({
      where: {
        role: Role.SEO_DEV,
      },
      select: adminUserSelect,
      orderBy: {
        name: "asc",
      },
    });
  }

  public async getManagedCustomers(seoDevId: string) {
    return prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
        customerProfile: {
          is: {
            seoDevId,
          },
        },
      },
      select: adminUserSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * สร้างผู้ใช้ใหม่ — payload ผ่าน Zod แล้ว (UserCreateInput)
   */
  public async createUser(data: UserCreateInput) {
    const { name, email, password, role, companyName, domain, seoDevId } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === Role.CUSTOMER) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { domain: domain },
      });

      if (existingCustomer) {
        throw new ConflictError(
          `Domain "${domain}" is already registered to another customer.`,
        );
      }

      return prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: { name, email, password: hashedPassword, role },
        });

        await tx.customer.create({
          data: {
            name: companyName!,
            domain: domain!,
            userId: newUser.id,
            seoDevId: seoDevId || null,
          },
        });

        const userWithProfile = await tx.user.findUnique({
          where: { id: newUser.id },
          select: adminUserSelect,
        });
        return userWithProfile;
      });
    }

    return prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: adminUserSelect,
    });
  }

  /**
   * อัปเดตผู้ใช้ — payload ผ่าน Zod (.strict()) แล้ว
   * รับได้ทั้ง full update (admin) หรือ partial self-update
   */
  public async updateUser(
    id: string,
    data: UserUpdateInput | UserSelfUpdateInput,
  ) {
    const fullData = data as UserUpdateInput;
    const { name, email, role, companyName, domain, seoDevId } = fullData;

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { customerProfile: true },
    });

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if (role === Role.CUSTOMER && (companyName || domain)) {
      if (domain) {
        const existingCustomerWithDomain = await prisma.customer.findFirst({
          where: {
            domain: domain,
            userId: { not: id },
          },
        });

        if (existingCustomerWithDomain) {
          throw new ConflictError(
            `Domain "${domain}" is already registered to another customer.`,
          );
        }
      }

      const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id },
          data: { name, email, role },
          select: adminUserSelect,
        });

        const customerData: {
          name?: string;
          domain?: string;
          seoDevId?: string | null;
        } = {};
        if (companyName) customerData.name = companyName;
        if (domain) customerData.domain = domain;
        if (seoDevId !== undefined) {
          customerData.seoDevId = seoDevId === "" ? null : seoDevId;
        }

        if (existingUser.customerProfile) {
          await tx.customer.update({
            where: { userId: id },
            data: customerData,
          });
        } else {
          await tx.customer.create({
            data: {
              name: companyName!,
              domain: domain!,
              userId: id,
              seoDevId: seoDevId || null,
            },
          });
        }

        return user;
      });

      return updatedUser;
    } else {
      return prisma.user.update({
        where: { id },
        data: { name, email, role },
        select: adminUserSelect,
      });
    }
  }

  /**
   * ลบผู้ใช้ (Soft Delete ด้วย Middleware)
   */
  public async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Restore ผู้ใช้ที่ถูก Soft Delete
   * ต้อง throw 404 ถ้าไม่พบ user หรือ user ไม่ได้ถูก soft-delete
   * ใช้ prismaBase เพื่อ bypass extension ที่กรอง deletedAt: null
   */
  public async restoreUser(id: string) {
    const user = await prismaBase.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!user || user.deletedAt === null) {
      throw new NotFoundError("ไม่พบผู้ใช้ที่ถูกลบ");
    }

    return prismaBase.user.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * อัปเดตรหัสผ่าน
   */
  public async updatePassword(
    id: string,
    currentPassword: string | undefined,
    newPassword: string,
    isAdmin: boolean,
  ) {
    const userToUpdate = await prisma.user.findUnique({ where: { id } });

    if (!userToUpdate) {
      throw new NotFoundError("User not found");
    }

    if (!isAdmin) {
      if (!currentPassword || !userToUpdate.password) {
        throw new BadRequestError("Current password is required");
      }
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        userToUpdate.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestError("Invalid current password");
      }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    return prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword,
      },
    });
  }
}

export const userService = new UserService();
