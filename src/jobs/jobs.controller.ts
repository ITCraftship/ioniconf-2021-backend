import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

import { ParseOptionalIntPipe } from '../parse-optional-int.pipe';

@Controller('jobs')
export class JobsController {
  @Get()
  async all(@Query('page', new ParseOptionalIntPipe(1)) page: number) {
    const filePath = path.join(
      __dirname,
      `../../assets/data/jobs-page-${page}.json`,
    );

    return await this.getFileContents(filePath);
  }

  @Get(':jobId/details')
  async findOne(@Param('jobId') jobId: string): Promise<any> {
    const filePath = path.join(
      __dirname,
      `../../assets/data/jobs/job-${jobId}.json`,
    );

    return await this.getFileContents(filePath);
  }

  private async getFileContents(filePath: string) {
    try {
      await fs.access(filePath);
      return JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch {
      // we can fall back to handle errors with 404 for simplicity's sake
      // it will cover file that doesn't exist as well as malformed JSON, etc.
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }
}
