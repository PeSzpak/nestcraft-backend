import { Injectable } from '@nestjs/common';
import { Course } from './courses.entity';

@Injectable()
export class CoursesService {
    private courses: Course[] = [
        {
            id: 1,
            name: 'Typescript do zero ao deploy',
            description: 'Usando os mais famosos frameworks do mercado para te ajudar a se destacar como profissional',
            tags: ['TypeScript', 'nodeJs', 'JavaScript', 'Nest.js']
        }
    ]
}

