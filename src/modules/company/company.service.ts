import type { Prisma, PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';

export class CompanyService {
  databaseConnection: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    DefaultArgs
  >;

  constructor(
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {
    this.databaseConnection = prisma;
  }

  findAll() {
    return this.databaseConnection.company.findMany();
  }

  findById(id: string) {
    if (!id) throw new Error('No id informed.');

    return this.databaseConnection.company.findFirst({
      where: {
        id,
      },
    });
  }
}
