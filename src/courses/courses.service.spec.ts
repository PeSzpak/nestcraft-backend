import { randomUUID } from 'node:crypto';
import { CoursesService } from './courses.service';
import { CreateCourseDTO } from './dto/create-course.dto';
import { UpdateCourseDTO } from './dto/update-course.dto';
import { Course } from './entities/courses.entity';
import { Tag } from './entities/tags.entity';

interface MockRepository {
  create: jest.Mock;
  save: jest.Mock;
  update: jest.Mock;
  preload: jest.Mock;
  findAll: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  remove: jest.Mock;
}

describe('CoursesService', () => {
  let service: CoursesService;
  let id: string;
  let created_at: Date;
  let expectOutputTags: Tag[];
  let expectOutputCourses: Course;
  let mockCourseRepository: MockRepository;
  let mockTagRepository: Pick<MockRepository, 'create' | 'findOne'>;

  beforeEach(() => {
    service = new CoursesService();
    id = randomUUID();
    created_at = new Date();
    expectOutputTags = [
      {
        id,
        name: 'nestJs',
        created_at,
      } as Tag,
    ];
    expectOutputCourses = {
      id,
      name: 'test',
      description: 'test description',
      created_at,
      tags: expectOutputTags,
    } as Course;

    mockCourseRepository = {
      create: jest.fn().mockReturnValue(Promise.resolve(expectOutputCourses)),
      save: jest.fn().mockReturnValue(Promise.resolve(expectOutputCourses)),
      update: jest.fn().mockReturnValue(Promise.resolve(expectOutputCourses)),
      preload: jest.fn().mockReturnValue(Promise.resolve(expectOutputCourses)),
      findAll: jest.fn().mockReturnValue(Promise.resolve(expectOutputCourses)),
      find: jest.fn().mockReturnValue(Promise.resolve(expectOutputCourses)),
      findOne: jest.fn().mockReturnValue(Promise.resolve(expectOutputCourses)),
      remove: jest.fn().mockReturnValue(Promise.resolve(expectOutputCourses)),
    };
    mockTagRepository = {
      create: jest.fn().mockReturnValue(Promise.resolve(expectOutputTags)),
      findOne: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should create a course', async () => {
    // @ts-expect-error - Mocking private readonly property for testing
    service['courseRepository'] = mockCourseRepository;
    // @ts-expect-error - Mocking private readonly property for testing
    service['tagRepository'] = mockTagRepository;

    const createCourseDTO: CreateCourseDTO = {
      name: 'test',
      description: 'test description',
      tags: ['nestjs'],
    };

    const newCourse = await service.create(createCourseDTO);

    expect(mockCourseRepository.save).toHaveBeenCalled();
    expect(expectOutputCourses).toStrictEqual(newCourse);
  });

  it('should list all courses', async () => {
    // @ts-expect-error - Mocking private readonly property for testing
    service['courseRepository'] = mockCourseRepository;
    // @ts-expect-error - Mocking private readonly property for testing
    service['tagRepository'] = mockTagRepository;

    const courses = await service.findAll();

    expect(mockCourseRepository.find).toHaveBeenCalled();
    expect(expectOutputCourses).toStrictEqual(courses);
  });

  it('should gets a course by id', async () => {
    // @ts-expect-error - Mocking private readonly property for testing
    service['courseRepository'] = mockCourseRepository;
    // @ts-expect-error - Mocking private readonly property for testing
    service['tagRepository'] = mockTagRepository;

    const course = await service.findOne(id);

    expect(mockCourseRepository.findOne).toHaveBeenCalled();
    expect(expectOutputCourses).toStrictEqual(course);
  });

  it('should update a course', async () => {
    // @ts-expect-error - Mocking private readonly property for testing
    service['courseRepository'] = mockCourseRepository;
    // @ts-expect-error - Mocking private readonly property for testing
    service['tagRepository'] = mockTagRepository;

    const updateCourseDTO: UpdateCourseDTO = {
      name: 'test',
      description: 'test description',
      tags: ['nestjs'],
    };

    const course = await service.update(id, updateCourseDTO);

    expect(mockCourseRepository.save).toHaveBeenCalled();
    expect(mockCourseRepository.preload).toHaveBeenCalled();
    expect(expectOutputCourses).toStrictEqual(course);
  });

  it('should delete a course', async () => {
    // @ts-expect-error - Mocking private readonly property for testing
    service['courseRepository'] = mockCourseRepository;
    // @ts-expect-error - Mocking private readonly property for testing
    service['tagRepository'] = mockTagRepository;

    const course = await service.remove(id);

    expect(mockCourseRepository.findOne).toHaveBeenCalledWith({
      where: { id },
    });
    expect(mockCourseRepository.remove).toHaveBeenCalledWith(expectOutputCourses);
    expect(expectOutputCourses).toStrictEqual(course);
  });
});
