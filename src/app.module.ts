import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsController } from './jobs/jobs.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AppController, JobsController],
  providers: [AppService],
})
export class AppModule {}
