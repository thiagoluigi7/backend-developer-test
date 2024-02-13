import 'dotenv/config';

import { JobStatus, type Prisma, type PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';
import AWS from 'aws-sdk';

export class JobService {
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
    return this.databaseConnection.job.findMany();
  }

  findById(id: string) {
    return this.databaseConnection.job.findFirst({
      where: {
        id,
      },
    });
  }

  findAllPublishedWithCompany() {
    return this.databaseConnection.job.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        company: {
          select: {
            name: true,
          },
        },
      },
      where: {
        status: JobStatus.published,
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

  static async getFeed(): Promise<
    {
      id: string;
      createdAt: Date;
      title: string;
      description: string;
      company: {
        name: string;
      };
    }[]
  > {
    const s3 = new AWS.S3();

    const bucket = process.env.BUCKET_NAME!;
    const key = 'feed.json';

    const params: AWS.S3.GetObjectRequest = {
      Bucket: bucket,
      Key: key,
    };

    const feed = JSON.parse(
      ((await s3.getObject(params).promise()).Body as string) ?? ''
    );

    return feed;
  }
}
