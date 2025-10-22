// src/services/UserService.ts
import { prisma } from "@/lib/prisma";
import { Role } from "@/types/auth";
import { UserFormState } from "@/types/user";
import bcrypt from "bcrypt";

class UserService {
  /**
   * ดึงผู้ใช้ทั้งหมด
   */
  public async getUsers(includeDeleted: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).user.findMany({
      includeDeleted: includeDeleted,
      orderBy: { createdAt: "desc" },
      include: { customerProfile: { select: { seoDevId: true } } },
    });
  }

  /**
   * ดึงผู้ใช้รายบุคคล
   */
  public async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        customerProfile: {
          select: {
            name: true,
            domain: true,
            seoDevId: true,
          },
        },
      },
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
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * สร้างผู้ใช้ใหม่
   */
  public async createUser(data: UserFormState) {
    const { name, email, password, role, companyName, domain, seoDevId } = data;

    if (!name || !email || !password || !role) {
      throw new Error("Missing required user fields");
    }

    if (role === Role.CUSTOMER && (!companyName || !domain)) {
      throw new Error("Company Name and Domain are required for CUSTOMER role");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === Role.CUSTOMER) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { domain: domain },
      });

      if (existingCustomer) {
        throw new Error(
          `Domain "${domain}" is already registered to another customer.`
        );
      }

      return prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: { name, email, password: hashedPassword, role: role as Role },
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
          include: { customerProfile: { select: { seoDevId: true } } },
        });
        return userWithProfile;
      });
    }

    return prisma.user.create({
      data: { name, email, password: hashedPassword, role: role as Role },
    });
  }

  /**
   * อัปเดตผู้ใช้
   */
  public async updateUser(id: string, data: UserFormState) {
    const { name, email, role, companyName, domain, seoDevId } = data;

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { customerProfile: true },
    });

    if (!existingUser) {
      throw new Error("User not found");
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
          throw new Error(
            `Domain "${domain}" is already registered to another customer.`
          );
        }
      }

      const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id },
          data: { name, email, role },
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
   */
  public async restoreUser(id: string) {
    return prisma.user.updateMany({
      where: {
        id: id,
        deletedAt: {
          not: null,
        },
      },
      data: {
        deletedAt: null,
      },
    });
  }

  /**
   * อัปเดตรหัสผ่าน
   */
  public async updatePassword(
    id: string,
    currentPassword: string | undefined,
    newPassword: string,
    isAdmin: boolean
  ) {
    const userToUpdate = await prisma.user.findUnique({ where: { id } });

    if (!userToUpdate) {
      throw new Error("User not found");
    }

    if (!isAdmin) {
      if (!currentPassword || !userToUpdate.password) {
        throw new Error("Current password is required");
      }
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        userToUpdate.password
      );
      if (!isPasswordValid) {
        throw new Error("Invalid current password");
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
