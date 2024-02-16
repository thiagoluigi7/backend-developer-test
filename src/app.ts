import 'express-async-errors';

import { PrismaClient } from '@prisma/client';
import express, { json } from 'express';
import helmet from 'helmet';

import { CompanyController } from './modules/company/company.controller';
import { JobController } from './modules/job/job.controller';
import { JobService } from './modules/job/job.service';

const app = express();
app.use(json());
app.use(helmet());

const prisma = new PrismaClient();

const companyController = new CompanyController(prisma);
const jobController = new JobController(prisma);

app.get('/', (_, res) => {
  res.json({
    msg: 'Hello World',
  });
});

app.use('/companies', companyController.prepareRoutes());
app.use('/job', jobController.prepareRoutes());

app.get('/feed', async (_, res) => {
  const feed = await JobService.getFeed();

  res.json({ feed });
});

app.use((_, res, _2) => {
  res.status(404).json({ error: 'NOT FOUND' });
});

export { app };
