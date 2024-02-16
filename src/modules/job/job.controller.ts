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
    // GET routes

    this.router.get('/', async (_req, res) => {
      const jobs = await this.service.findAll();

      res.json({ jobs });
    });

    // POST routes

    this.router.post('/', async (req, res) => {
      try {
        const job = await this.service.createJobDraft(req.body);

        res.json({ job });
      } catch (error) {
        console.error(error);

        res.statusCode = 400;
        res.json({ message: error });
      }
    });

    // PUT routes

    this.router.put('/:id/publish', async (req, res) => {
      try {
        await this.service.publishJobDraft(req.params.id);

        res.json({ status: 'success' });
      } catch (error) {
        console.error(error);

        res.statusCode = 400;
        res.json({ message: error });
      }
    });

    this.router.put('/:id', async (req, res) => {
      try {
        const job = await this.service.editJobDraft(req.params.id, req.body);

        res.json({ job });
      } catch (error) {
        console.error(error);

        res.statusCode = 400;
        res.json({ message: error });
      }
    });

    this.router.put('/:id/archive', async (req, res) => {
      try {
        const job = await this.service.archiveJob(req.params.id);

        res.json({ job });
      } catch (error) {
        console.error(error);

        res.statusCode = 400;
        res.json({ message: error });
      }
    });

    // DELETE routes

    this.router.delete('/:id', async (req, res) => {
      try {
        await this.service.deleteJobDraft(req.params.id);

        res.json('Draft has been deleted successfully.');
      } catch (error) {
        console.error(error);

        res.statusCode = 400;
        res.json({ message: error });
      }
    });

    return this.router;
  }
}
