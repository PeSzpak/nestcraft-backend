import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { CoursesService } from './courses.service';

@Module({
    controllers: [AppController, CoursesController],
    providers: [CoursesService],
})
export class CoursesModule {}
