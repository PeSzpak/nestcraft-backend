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

    findAll() {
        return this.courses 
    }

    findOne(id: number) {
        return this.courses.find(course => course.id === id)
    }

    create(createCourseDTO: any) {
        this.courses.push(createCourseDTO)
    }

    update(id: number, updateCourseDTO: any) {
        const existingCourse = this.findOne(id)
        if(existingCourse) {
            const index = this.courses.findIndex( course => course.id === id)
            this.courses[index] = {
                id,
                ...updateCourseDTO
            }
        }
    }

    remove(id: number) {
        const index = this.courses.findIndex( course => course.id === id)
        if (index >= 0) {
            this.courses.splice(index, 1)
        }
    }
}

