import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { CreateCourseTable1752676142776 } from 'src/migrations/1752676142776-CreateCourseTable';
import { CreateTagTable1752684319861 } from 'src/migrations/1752684319861-CreateTagTable';
import { CreateCoursesTagsTable1752686922179 } from 'src/migrations/1752686922179-CreateCoursesTagsTable';
import { AddCourseIdToCoursesTagsTable1752688220082 } from 'src/migrations/1752688220082-AddCourseIdToCoursesTagsTable';
import { AddTagsIdToCoursesTagsTable1752689396934 } from 'src/migrations/1752689396934-AddTagsIdToCoursesTagsTable';
import { Course } from 'src/courses/entities/courses.entity';
import { Tag } from 'src/courses/entities/tags.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Course, Tag],
  synchronize: false,
};

export const dataSource = new DataSource({
  ...dataSourceOptions,
  synchronize: false,
  migrations: [
    CreateCourseTable1752676142776,
    CreateTagTable1752684319861,
    CreateCoursesTagsTable1752686922179,
    AddCourseIdToCoursesTagsTable1752688220082,
    AddTagsIdToCoursesTagsTable1752689396934,
  ],
});
