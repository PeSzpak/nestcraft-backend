import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Res } from '@nestjs/common';
import { CoursesService } from './courses.service';



@Controller('courses')

export class CoursesController {
    constructor(private readonly courseService: CoursesService) { }

    @Get()
findAll() {
    return this.courseService.findAll();
}
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.courseService.findOne(id);
    }

    @Post()
create(@Body() body) {
    return this.courseService.create(body);
}

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body) {
        return this.courseService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.courseService.remove(id);
    }

}