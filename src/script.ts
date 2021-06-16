import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpService } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

const apiBaseUrl = process.env.IONICONF_API_BASE_URL;
console.log(apiBaseUrl);

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const httpService = app.get(HttpService);

  await Promise.all([1, 2, 3].map((p) => saveJobsPage(p)));
  await app.close();

  async function saveJobsPage(page: number) {
    const response = await httpService
      .get(`${apiBaseUrl}?page=${page}`)
      .toPromise();
    const jobs = response.data.map((j) => sanitizeJob(j));
    await fs.writeFile(
      path.join(__dirname, `../assets/data/jobs-page-${page}.json`),
      JSON.stringify(jobs),
      'utf8',
    );
    await Promise.all(jobs.map((j) => saveJobDetails(j.job_id)));
  }

  async function saveJobDetails(jobId: string) {
    const response = await httpService
      .get(`${apiBaseUrl}/${jobId}/detail`)
      .toPromise();

    await fs.writeFile(
      path.join(__dirname, `../assets/data/jobs/job-${jobId}.json`),
      JSON.stringify(sanitizeJob(response.data)),
      'utf8',
    );
  }
}

function sanitizeJob(job: any) {
  const { job_id } = job;
  return {
    job_id,
  };
}

bootstrap().then((_) => console.log('Finished script'));
