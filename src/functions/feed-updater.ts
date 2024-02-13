import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import type { Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
import type { PutObjectRequest } from 'aws-sdk/clients/s3';

import { JobService } from '@/modules/job/job.service';

export const handler: Handler = async (_, _2) => {
  const s3 = new AWS.S3();
  const prisma = new PrismaClient();
  const jobService = new JobService(prisma);

  const bucket = process.env.BUCKET_NAME!;

  const jobs = await jobService.findAllPublishedWithCompany();

  const body = JSON.stringify(jobs);

  const object: PutObjectRequest = {
    Bucket: bucket,
    Key: 'feed.json',
    Body: body,
  };

  await s3.putObject(object).promise();

  return {
    statusCode: 200,
  };
};
