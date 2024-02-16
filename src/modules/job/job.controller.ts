import type { Prisma, PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';
import type { Router } from 'express';
import express from 'express';

import { JobService } from './job.service';

export class JobController {
  service: JobService;

  router: Router;

  constructor(
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {
    this.service = new JobService(prisma);
    this.router = express.Router();
  }

  prepareRoutes() {
    this.router.get('/', async (_req, res) => {
      const jobs = await this.service.findAll();

      res.json({ jobs });
    });

    this.router.post('/', async (req, res) => {
      const job = await this.service.createJobDraft(req.body);

      res.json({ job });
    });

    this.router.put('/:id/publish', async (req, res) => {
      const { id } = req.params;

      if (!id) {
        res.statusCode = 400;
        res.json({ status: 'Error. Missing Id.' });
      }

      await this.service.publishJobDraft(req.params.id);

      return res.json({ status: 'success' });
    });

    this.router.put('/:id', async (req, res) => {
      const job = await this.service.editJobDraft(req.params.id, req.body);

      res.json({ job });
    });

    this.router.delete('/:id', async (req, res) => {
      await this.service.deleteJobDraft(req.params.id);

      res.json('Draft has been deleted successfully.');
    });

    this.router.put('/:id/archive', async (req, res) => {
      const job = await this.service.archiveJob(req.params.id);

      res.json({ job });
    });

    return this.router;
  }
}
