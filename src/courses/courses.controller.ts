import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { get } from 'http';

@Controller('courses')
export class CoursesController {
    @Get()
    findAll() {
        return 'listagem de cursos'
    }

    @Get(':id')
    findOne(@Param('id') id: string ) {
        return `Curso com id: ${id}`
    }

    @Post()
    create(@Body() body) {
        return body
    }
}