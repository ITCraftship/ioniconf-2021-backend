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
    jobs.forEach((j) => saveJobDetailsCached(j));
    // await Promise.all(jobs.map((j) => saveJobDetails(j.job_id)));
  }

  async function saveJobDetailsCached(job: any) {
    await fs.writeFile(
      path.join(__dirname, `../assets/data/jobs/job-${job.job_id}.json`),
      JSON.stringify(sanitizeJob(job)),
      'utf8',
    );
  }

  // async function saveJobDetails(jobId: string) {
  //   const response = await httpService
  //     .get(`${apiBaseUrl}/${jobId}/detail`)
  //     .toPromise();
  //
  //   await fs.writeFile(
  //     path.join(__dirname, `../assets/data/jobs/job-${jobId}.json`),
  //     JSON.stringify(sanitizeJob(response.data)),
  //     'utf8',
  //   );
  // }
}

function sanitizeJob(job: any) {
  const billRate = randomBillRate();
  const jobPrice = calculatePrice(billRate);
  return {
    job_id: job.job_id,
    job_price: jobPrice,
    job_status: job.job_status,
    facility: {
      ...job.facility,
      fac_name: `${job.facility.fac_city} ${randomFacilitySuffix()}`,
      fac_street_address: `Something Str ${randomStreetNo()}`,
      facilities_description: undefined,
      fac_number_of_beds: randomNumberOfBeds(),
    },
    billRate: billRate,
    jobSpecialties: job.jobSpecialties.map((s) => ({
      specialty: {
        specialty_color: s.specialty.specialty_color,
        specialty_title: s.specialty.specialty_title,
        specialty_acronym: s.specialty.specialty_acronym,
      },
    })),
    job_shift: job.job_shift,
    job_start_date: job.job_start_date,
    licenseType: job.licenseType,
    job_type: job.job_type,
    job_description: job.job_description,
  };
}

function randomNumberOfBeds() {
  const max = 200;
  const min = 50;
  const beds = Math.random() * (max - min) + min;
  return Math.round(beds);
}

function randomFacilitySuffix() {
  return ['Care', 'Healthcare', 'Care Center', 'Nursing Home', 'Hospital'][
    Math.floor(Math.random() * 5)
  ];
}

function randomBillRate() {
  const max = 45;
  const min = 25;
  const rate = Math.random() * (max - min) + min;
  return Math.round(rate * 10) / 10;
}

function calculatePrice(billRate: number) {
  return Math.round(billRate * 0.85 * 10) / 10;
}

function randomStreetNo() {
  return Math.round(Math.random() * 40);
}

bootstrap().then((_) => console.log('Finished script'));
