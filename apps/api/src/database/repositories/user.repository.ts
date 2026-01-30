import { Injectable } from '@nestjs/common';
import { prisma } from '@streambox/database';
import type { User, Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

  async findByIdWithSelect<T extends Prisma.UserSelect>(
    id: string,
    select: T
  ): Promise<Prisma.UserGetPayload<{ select: T }> | null> {
    return prisma.user.findUnique({
      where: { id },
      select,
    }) as Promise<Prisma.UserGetPayload<{ select: T }> | null>;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async createWithSelect<T extends Prisma.UserSelect>(
    data: Prisma.UserCreateInput,
    select: T
  ): Promise<Prisma.UserGetPayload<{ select: T }>> {
    return prisma.user.create({
      data,
      select,
    }) as Promise<Prisma.UserGetPayload<{ select: T }>>;
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where });
  }
}
