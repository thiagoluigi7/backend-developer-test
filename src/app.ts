import 'express-async-errors';

import { PrismaClient } from '@prisma/client';
import express, { json } from 'express';
import helmet from 'helmet';

import { CompanyService } from './modules/company/company.service';
import { JobService } from './modules/job/job.service';

const app = express();
app.use(json());
app.use(helmet());

const prisma = new PrismaClient();

const companyService = new CompanyService(prisma);
const jobService = new JobService(prisma);

app.get('/', (_, res) => {
  res.json({
    msg: 'Hello World',
  });
});

app.get('/companies', async (_, res) => {
  const companies = await companyService.findAll();

  res.json({
    companies,
  });
});

app.get('/companies/:id', async (req, res) => {
  const company = await companyService.findById(req.params.id);

  res.json({ company });
});

app.get('/job', async (_req, res) => {
  const jobs = await jobService.findAll();

  res.json({ jobs });
});

app.post('/job', async (req, res) => {
  const job = await jobService.createJobDraft(req.body);

  res.json({ job });
});

app.put('/job/:id/publish', async (req, res) => {
  await jobService.publishJobDraft(req.params.id);

  res.json({ status: 'success' });
});

app.put('/job/:id', async (req, res) => {
  const job = await jobService.editJobDraft(req.params.id, req.body);

  res.json({ job });
});

app.delete('/job/:id', async (req, res) => {
  await jobService.deleteJobDraft(req.params.id);

  res.json('Draft has been deleted successfully.');
});

app.put('/job/:id/archive', async (req, res) => {
  const job = await jobService.archiveJob(req.params.id);

  res.json({ job });
});

app.get('/feed', async (_, res) => {
  const feed = await JobService.getFeed();

  res.json({ feed });
});

app.use((_, res, _2) => {
  res.status(404).json({ error: 'NOT FOUND' });
});

export { app };
