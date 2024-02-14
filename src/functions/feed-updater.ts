import 'dotenv/config';

import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { S3 } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
  Handler,
} from 'aws-lambda';

import { JobService } from '@/modules/job/job.service';

export const handler: Handler = async (
  _event: APIGatewayProxyEventV2,
  _context: Context
): Promise<APIGatewayProxyStructuredResultV2> => {
  const s3 = new S3();
  const prisma = new PrismaClient();
  const jobService = new JobService(prisma);

  const bucket = process.env.BUCKET_NAME!;
  const key = process.env.FILE_KEY!;

  const jobs = await jobService.findAllPublishedWithCompany();

  const body = JSON.stringify(jobs);

  const object: PutObjectCommandInput = {
    Bucket: bucket,
    Key: key,
    Body: body,
  };

  await s3.putObject(object);

  return {
    statusCode: 200,
  };
};
