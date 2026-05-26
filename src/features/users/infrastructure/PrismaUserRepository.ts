// User feature ใช้ทั้ง extended `prisma` (default — กรอง deletedAt อัตโนมัติ + soft-delete)
// และ `prismaBase` เฉพาะ flow restore / list-deleted ที่ต้อง bypass filter
import { prisma, prismaBase } from "@/infrastructure/prisma/client";
import { Role } from "@/types/auth";
import type { User } from "../domain/User";
import type { UserRepository } from "../application/ports/UserRepository";
import type {
  UserCreateInput,
  UserUpdateInput,
} from "../schemas";

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
      address: true,
      taxId: true,
      contactName: true,
    },
  },
} as const;

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  deletedAt: true,
  customerProfile: {
    select: { name: true, domain: true },
  },
} as const;

export class PrismaUserRepository implements UserRepository {
  async findAll(options: {
    includeDeleted: boolean;
    includeAdminFields: boolean;
  }): Promise<User[]> {
    const client = options.includeDeleted ? prismaBase : prisma;
    return client.user.findMany({
      orderBy: { createdAt: "desc" },
      select: options.includeAdminFields ? adminUserSelect : publicUserSelect,
    }) as Promise<User[]>;
  }

  async findById(
    id: string,
    options: { includeAdminFields: boolean },
  ): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      select: options.includeAdminFields ? adminUserSelect : publicUserSelect,
    }) as Promise<User | null>;
  }

  async findUserIdsByRole(role: string): Promise<string[]> {
    const users = await prisma.user.findMany({
      where: { role: role as Role },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }

  async findSeoDevs(): Promise<User[]> {
    return prisma.user.findMany({
      where: { role: Role.SEO_DEV },
      select: adminUserSelect,
      orderBy: { name: "asc" },
    }) as Promise<User[]>;
  }

  async findManagedCustomers(seoDevId: string): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
        customerProfile: { is: { seoDevId } },
      },
      select: adminUserSelect,
      orderBy: { createdAt: "desc" },
    }) as Promise<User[]>;
  }

  async findCustomerByDomain(
    domain: string,
    excludeUserId?: string,
  ): Promise<{ id: string; userId: string } | null> {
    if (excludeUserId) {
      return prisma.customer.findFirst({
        where: { domain, userId: { not: excludeUserId } },
        select: { id: true, userId: true },
      });
    }
    return prisma.customer.findUnique({
      where: { domain },
      select: { id: true, userId: true },
    });
  }

  async createWithCustomerProfile(
    data: UserCreateInput & { hashedPassword: string },
  ): Promise<User | null> {
    return prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.hashedPassword,
          role: data.role,
        },
      });

      await tx.customer.create({
        data: {
          name: data.companyName!,
          domain: data.domain!,
          userId: newUser.id,
          seoDevId: data.seoDevId || null,
          address: data.address || null,
          taxId: data.taxId || null,
          contactName: data.contactName || null,
        },
      });

      return tx.user.findUnique({
        where: { id: newUser.id },
        select: adminUserSelect,
      }) as Promise<User | null>;
    });
  }

  async createPlain(
    data: UserCreateInput & { hashedPassword: string },
  ): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.hashedPassword,
        role: data.role,
      },
      select: adminUserSelect,
    }) as Promise<User>;
  }

  async applyUpdate(
    id: string,
    data: UserUpdateInput,
    options: { existingCustomerProfile: boolean },
  ): Promise<User> {
    const { name, email, role, companyName, domain, seoDevId, address, taxId, contactName } = data;
    const isCustomerWithProfile =
      role === Role.CUSTOMER && (companyName || domain || address !== undefined || taxId !== undefined || contactName !== undefined);

    if (!isCustomerWithProfile) {
      return prisma.user.update({
        where: { id },
        data: { name, email, role },
        select: adminUserSelect,
      }) as Promise<User>;
    }

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { name, email, role },
        select: adminUserSelect,
      });

      const customerData: {
        name?: string;
        domain?: string;
        seoDevId?: string | null;
        address?: string | null;
        taxId?: string | null;
        contactName?: string | null;
      } = {};
      if (companyName) customerData.name = companyName;
      if (domain) customerData.domain = domain;
      if (seoDevId !== undefined) {
        customerData.seoDevId = seoDevId === "" ? null : seoDevId;
      }
      if (address !== undefined) customerData.address = address || null;
      if (taxId !== undefined) customerData.taxId = taxId || null;
      if (contactName !== undefined) customerData.contactName = contactName || null;

      if (options.existingCustomerProfile) {
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
            address: address || null,
            taxId: taxId || null,
            contactName: contactName || null,
          },
        });
      }

      return user as User;
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  async restoreSoftDeleted(id: string): Promise<{ deletedAt: Date | null }> {
    const updated = await prismaBase.user.update({
      where: { id },
      data: { deletedAt: null },
      select: { deletedAt: true },
    });
    return updated;
  }

  async findIdAndDeletedAtIncludingDeleted(
    id: string,
  ): Promise<{ id: string; deletedAt: Date | null } | null> {
    return prismaBase.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });
  }

  async findPasswordById(
    id: string,
  ): Promise<{ password: string | null } | null> {
    return prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}
