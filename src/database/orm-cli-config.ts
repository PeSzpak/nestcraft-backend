import { DataSource } from "typeorm";
import { dataSourceOptions } from "./database.module";
import { CreateCourseTable1752676142776 } from "src/migrations/1752676142776-CreateCourseTable";
import { CreateTagTable1752684319861 } from "src/migrations/1752684319861-CreateTagTable";


export const dataSource = new DataSource({
    ...dataSourceOptions,
    synchronize: false,
    migrations: [CreateCourseTable1752676142776, CreateTagTable1752684319861]
})