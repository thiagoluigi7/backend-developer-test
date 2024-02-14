import 'dotenv/config';

import type { GetObjectCommandInput } from '@aws-sdk/client-s3';
import { S3 } from '@aws-sdk/client-s3';
import { SQS } from '@aws-sdk/client-sqs';
import { JobStatus, type Prisma, type PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';

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

  async publishJobDraft(id: string) {
    const sqs = new SQS();

    const job = await this.databaseConnection.job.findFirst({ where: { id } });

    await sqs.sendMessage({
      QueueUrl: process.env.QUEUE_URL,
      MessageBody: JSON.stringify(job),
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
    const s3 = new S3();

    const bucket = process.env.BUCKET_NAME!;
    const key = process.env.FILE_KEY!;

    const params: GetObjectCommandInput = {
      Bucket: bucket,
      Key: key,
    };

    const s3Body = (await s3.getObject(params)).Body;
    const s3BodyString = await s3Body?.transformToString();
    const feed = JSON.parse(s3BodyString ?? '');

    return feed;
  }
}
