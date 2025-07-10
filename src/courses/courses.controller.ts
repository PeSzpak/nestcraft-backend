import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Res } from '@nestjs/common';

import { response } from 'express';
import { CoursesService } from './courses.service';



@Controller('courses')

export class CoursesController {
    constructor(private readonly courseService: CoursesService) {}

    @Get()
    findAll(@Res() response) {
        return response.status(200).json({ message: 'Courses list' })
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return `Course with id: ${id}`
    }

    @Post()
    create(@Body() body) {
        return body
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body) {
        console.log(body)
        return `Update Course With id: ${id}`
    }

    @HttpCode(204)
    @Delete(':id')
    delete(@Param('id') id: string) {
        return `Delete Course With id: ${id}`
    }

}