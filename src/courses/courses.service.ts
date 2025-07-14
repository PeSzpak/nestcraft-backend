import { Injectable, NotFoundException } from '@nestjs/common';
import { Course } from './courses.entity';

@Injectable()
export class CoursesService {
    private courses: Course[] = [
        {
            id: 2,
            name: 'Typescript do zero ao deploy',
            description: 'Usando os mais famosos frameworks do mercado para te ajudar a se destacar como profissional',
            tags: ['TypeScript', 'nodeJs', 'JavaScript', 'Nest.js']
        }
    ];

    findAll() {
        return this.courses;
    }

    findOne(id: number) {
        const course = this.courses.find(course => course.id === id);
        if (!course) {
            throw new NotFoundException(`Course ID ${id} not found`)
        }
        return course
    }

    create(createCourseDTO: any) {
        const newCourse = {
            id: Date.now(),
            ...createCourseDTO,
        };
        this.courses.push(newCourse);
        return newCourse;
    }

    update(id: number, updateCourseDTO: any) {
        const index = this.courses.findIndex(course => course.id === id);
        if (index >= 0) {
            this.courses[index] = {
                ...this.courses[index],
                ...updateCourseDTO,
            };
            return this.courses[index];
        }
    }

    remove(id: number) {
        const index = this.courses.findIndex(course => course.id === id);
        if (index >= 0) {
            const deleted = this.courses.splice(index, 1);
            return deleted[0];
        }
    }
}
