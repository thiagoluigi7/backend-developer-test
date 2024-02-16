import { JobStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

import { prismaMock } from '@/jest-singleton';
import prisma from '@/prisma-client';

import { JobService } from './job.service';

test('should create a new job', async () => {
  const id = randomUUID();
  const createdAt = new Date();
  const updatedAt = new Date();
  const companyId = randomUUID();

  const service = new JobService(prisma);

  const job = {
    id,
    createdAt,
    updatedAt,
    title: 'Test',
    description: 'This is a job creation test',
    location: 'Remote',
    status: JobStatus.draft,
    notes: null,
    companyId,
  };

  prismaMock.job.create.mockResolvedValue(job);

  await expect(service.createJobDraft(job)).resolves.toEqual({
    id,
    createdAt,
    updatedAt,
    title: 'Test',
    description: 'This is a job creation test',
    location: 'Remote',
    status: JobStatus.draft,
    notes: null,
    companyId,
  });
});

test('should update a job description', async () => {
  const id = randomUUID();
  const createdAt = new Date();
  const updatedAt = new Date();
  const companyId = randomUUID();

  const service = new JobService(prisma);

  const job = {
    id,
    createdAt,
    updatedAt,
    title: 'Test',
    description: 'This is a job update test',
    location: 'Remote',
    status: JobStatus.draft,
    notes: null,
    companyId,
  };

  prismaMock.job.update.mockResolvedValue(job);

  await expect(service.editJobDraft(id, job)).resolves.toEqual({
    id,
    createdAt,
    updatedAt,
    title: 'Test',
    description: 'This is a job update test',
    location: 'Remote',
    status: JobStatus.draft,
    notes: null,
    companyId,
  });
});

test('should archive a job', async () => {
  const id = randomUUID();
  const createdAt = new Date();
  const updatedAt = new Date();
  const companyId = randomUUID();

  const service = new JobService(prisma);

  const job = {
    id,
    createdAt,
    updatedAt,
    title: 'Test',
    description: 'This is a job update test',
    location: 'Remote',
    status: JobStatus.archived,
    notes: null,
    companyId,
  };

  prismaMock.job.update.mockResolvedValue(job);

  await expect(service.archiveJob(id)).resolves.toEqual({
    id,
    createdAt,
    updatedAt,
    title: 'Test',
    description: 'This is a job update test',
    location: 'Remote',
    status: JobStatus.archived,
    notes: null,
    companyId,
  });
});
