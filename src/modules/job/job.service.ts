import { JobStatus, type Prisma, type PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';

export class JobService {
  databaseConnection: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    DefaultArgs
  >;

  constructor(
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  ) {
    this.databaseConnection = prisma;
  }

  findAll() {
    return this.databaseConnection.job.findMany();
  }

  findById(id: string) {
    return this.databaseConnection.job.findFirst({
      where: {
        id,
      },
    });
  }

  createJobDraft(createJob: Prisma.JobCreateInput) {
    return this.databaseConnection.job.create({ data: createJob });
  }

  publishJobDraft(id: string) {
    return this.databaseConnection.job.update({
      where: {
        id,
      },
      data: {
        status: JobStatus.published,
      },
    });
  }

  editJobDraft(id: string, editJob: Prisma.JobUpdateInput) {
    return this.databaseConnection.job.update({
      where: { id },
      data: editJob,
    });
  }

  deleteJobDraft(id: string) {
    return this.databaseConnection.job.delete({ where: { id } });
  }

  archiveJob(id: string) {
    return this.databaseConnection.job.update({
      where: { id },
      data: {
        status: JobStatus.archived,
      },
    });
  }
}
