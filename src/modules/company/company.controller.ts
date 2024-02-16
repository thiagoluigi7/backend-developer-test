import type { Prisma, PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';
import type { Router } from 'express';
import express from 'express';

import { CompanyService } from './company.service';

export class CompanyController {
  service: CompanyService;

  router: Router;

  constructor(
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {
    this.service = new CompanyService(prisma);
    this.router = express.Router();
  }

  prepareRoutes() {
    // GET routes

    this.router.get('/', async (_, res) => {
      const companies = await this.service.findAll();

      res.json({
        companies,
      });
    });

    this.router.get('/:id', async (req, res) => {
      try {
        const company = await this.service.findById(req.params.id);

        res.json({ company });
      } catch (error) {
        console.error(error);

        res.statusCode = 400;
        res.json({ message: error });
      }
    });

    return this.router;
  }
}
