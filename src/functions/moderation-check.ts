import 'dotenv/config';

import type { Prisma } from '@prisma/client';
import { JobStatus, PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';
import type { Context, SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import OpenAI from 'openai';

async function processMessage(
  message: SQSRecord,
  openai: OpenAI,
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
) {
  const job = JSON.parse(message.body);

  const titleModerationResult = await openai.moderations.create({
    input: job.title,
  });

  const descriptionModerationResult = await openai.moderations.create({
    input: job.description,
  });

  const isTitleFlagged = titleModerationResult.results.some(
    (result) => result.flagged
  );

  const isDescriptionFlagged = descriptionModerationResult.results.some(
    (result) => result.flagged
  );

  const titleOpenAiResponse = JSON.stringify(titleModerationResult.results);

  const descriptionOpenAiResponse = JSON.stringify(
    descriptionModerationResult.results
  );

  if (!isTitleFlagged && !isDescriptionFlagged) {
    await prisma.job.update({
      where: {
        id: job.id,
      },
      data: {
        status: JobStatus.published,
      },
    });
  } else {
    await prisma.job.update({
      where: {
        id: job.id,
      },
      data: {
        status: JobStatus.rejected,
        notes: titleOpenAiResponse + descriptionOpenAiResponse,
      },
    });
  }
}

export const handler: SQSHandler = async (
  event: SQSEvent,
  _context: Context
): Promise<void> => {
  const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });
  const prisma = new PrismaClient();

  await Promise.all(
    event.Records.map((message) => processMessage(message, openai, prisma))
  );
};
