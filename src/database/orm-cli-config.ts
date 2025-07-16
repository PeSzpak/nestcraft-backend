import { DataSource } from 'typeorm';
import { dataSourceOptions } from './database.module';
import { CreateCourseTable1752676142776 } from 'src/migrations/1752676142776-CreateCourseTable';
import { CreateTagTable1752684319861 } from 'src/migrations/1752684319861-CreateTagTable';
import { CreateCoursesTagsTable1752686922179 } from 'src/migrations/1752686922179-CreateCoursesTagsTable';
import { AddCourseIdToCoursesTagsTable1752688220082 } from 'src/migrations/1752688220082-AddCourseIdToCoursesTagsTable';

export const dataSource = new DataSource({
  ...dataSourceOptions,
  synchronize: false,
  migrations: [
    CreateCourseTable1752676142776,
    CreateTagTable1752684319861,
    CreateCoursesTagsTable1752686922179,
    AddCourseIdToCoursesTagsTable1752688220082,
  ],
});
