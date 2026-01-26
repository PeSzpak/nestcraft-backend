# Explicação Completa da Codebase - NestCraft Backend

## Visão Geral do Projeto

O **NestCraft Backend** é uma API RESTful completa para gerenciamento de cursos online com sistema de tags. Ele foi construído seguindo as melhores práticas de arquitetura de software, utilizando conceitos de Clean Architecture, SOLID e Domain-Driven Design (DDD).

---

## Arquitetura e Padrões

### Arquitetura em Camadas

O projeto segue uma arquitetura em camadas bem definida:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│(Controllers - Recebem requisições HTTP e retornam respostas)│
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                        │
│     (Services - Contém a lógica de negócio da aplicação)    │
├─────────────────────────────────────────────────────────────┤
│                    DOMAIN LAYER                             │
│    (Entities - Representam os modelos de domínio)           │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                     │
│ (Database Module, TypeORM - Acesso a dados e infraestrutura)│
└─────────────────────────────────────────────────────────────┘
```

### Princípios SOLID Aplicados

1. **Single Responsibility**: Cada classe tem uma única responsabilidade
   - Controllers apenas lidam com HTTP
   - Services contêm apenas lógica de negócio
   - Repositories apenas acessam dados

2. **Open/Closed**: Código aberto para extensão, fechado para modificação
   - DTOs usam PartialType para estender funcionalidades
   - Módulos podem ser facilmente estendidos

3. **Liskov Substitution**: Interfaces e abstrações permitem substituição
   - TypeORM Repository pode ser mocado em testes

4. **Interface Segregation**: Interfaces específicas para cada necessidade
   - DTOs separados para Create e Update

5. **Dependency Inversion**: Dependências são injetadas
   - Uso extensivo de Dependency Injection do NestJS

---

## Estrutura Detalhada dos Arquivos

### Ponto de Entrada: `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Cria a aplicação NestJS a partir do módulo raiz
  const app = await NestFactory.create(AppModule);
  
  // Configura o pipe de validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Lança erro se propriedades extras forem enviadas
      transform: true,            // Transforma payloads em instâncias DTO automaticamente
    }),
  );
  
  // Inicia o servidor na porta 3000 (ou PORT do .env)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

**O que acontece aqui:**
1. A aplicação é inicializada usando o padrão Factory
2. O ValidationPipe é configurado globalmente para validar todos os DTOs automaticamente
3. O servidor HTTP é iniciado e fica aguardando requisições

---

### Módulo Raiz: `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './courses/courses.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Torna as configs disponíveis globalmente
    CoursesModule,                             // Importa o módulo de cursos
    DatabaseModule,                            // Importa o módulo de banco de dados
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**O que este módulo faz:**
- Orquestra todos os outros módulos da aplicação
- Configura o ConfigModule para ler variáveis de ambiente do `.env`
- Registra o controller e service raiz
- Importa os módulos funcionais (Courses, Database)

---

### Módulo de Banco de Dados: `src/database/database.module.ts`

```typescript
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: Number(configService.get('DB_PORT')),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASS'),
          database: configService.get('DB_NAME'),
          entities: [Course, Tag],
          synchronize: false, // NUNCA use true em produção!
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

**Por que usar `forRootAsync`?**
- Permite injeção de dependências (ConfigService)
- Carrega configurações de forma assíncrona
- Permite diferentes configs para dev/test/prod

**Por que `synchronize: false`?**
- `synchronize: true` altera o schema automaticamente (perigoso!)
- Em produção, sempre use migrations controladas
- Previne perda de dados acidental

---

## Módulo de Cursos (Core Business Logic)

### Estrutura do Módulo

```
courses/
├── courses.module.ts      # Definição do módulo
├── courses.controller.ts  # Endpoints REST
├── courses.service.ts     # Lógica de negócio
├── dto/
│   ├── create-course.dto.ts
│   └── update-course.dto.ts
└── entities/
    ├── courses.entity.ts
    └── tags.entity.ts
```

---

### Entidade Course: `entities/courses.entity.ts`

```typescript
@Entity('courses')  // Mapeia para tabela 'courses'
export class Course {
  @PrimaryGeneratedColumn('uuid')  // UUID como chave primária
  id: string;

  @Column()  // Coluna varchar simples
  name: string;

  @Column()
  description: string;

  @JoinTable()  // Cria tabela pivot para many-to-many
  @ManyToMany(() => Tag, (tag) => tag.courses, {
    cascade: true,  // Salva tags automaticamente quando salvar curso
  })
  tags: Tag[];

  @CreateDateColumn()  // Timestamp automático na criação
  created_at: Date;

  @BeforeInsert()  // Hook executado antes de inserir no banco
  generatedId() {
    if (this.id) return;  // Se já tem ID, não sobrescreve
    this.id = randomUUID();  // Gera UUID v4
  }
}
```

**Conceitos importantes:**

1. **@Entity**: Decorador que marca a classe como uma entidade do TypeORM
2. **UUID vs Auto-increment**: UUID é melhor para sistemas distribuídos
3. **@JoinTable**: Necessário em ONE lado do many-to-many para criar tabela pivot
4. **cascade: true**: Propaga operações save/remove para entidades relacionadas
5. **@BeforeInsert**: Hook do ciclo de vida da entidade

---

### Entidade Tag: `entities/tags.entity.ts`

```typescript
@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Course, (course) => course.tags)
  // Note: não tem @JoinTable aqui, apenas no lado "dono" da relação
  courses: Course[];

  @CreateDateColumn()
  created_at: Date;

  @BeforeInsert()
  generatedId() {
    if (this.id) return;
    this.id = randomUUID();
  }
}
```

**Relação Many-to-Many:**
- Course é o "dono" da relação (tem @JoinTable)
- Tag é o lado "inverso" (não tem @JoinTable)
- TypeORM cria automaticamente a tabela `courses_tags_tags`

---

### DTOs (Data Transfer Objects)

#### Create DTO: `dto/create-course.dto.ts`

```typescript
export class CreateCourseDTO {
  @IsString()  // Valida que é string
  readonly name: string;

  @IsString()
  @MaxLength(300)  // Máximo 300 caracteres
  readonly description: string;

  @IsString({ each: true })  // Valida cada elemento do array
  readonly tags: string[];
}
```

**Por que usar DTOs?**
1. **Validação**: class-validator valida automaticamente
2. **Documentação**: Tipo explícito do que é esperado
3. **Segurança**: Previne mass assignment vulnerabilities
4. **Imutabilidade**: `readonly` garante que não será modificado

#### Update DTO: `dto/update-course.dto.ts`

```typescript
export class UpdateCourseDTO extends PartialType(CreateCourseDTO) {}
```

**PartialType:**
- Cria uma nova classe com todos os campos opcionais
- Herda todas as validações do CreateCourseDTO
- Evita duplicação de código

---

### Controller: `courses.controller.ts`

```typescript
@Controller('courses')  // Define a rota base /courses
export class CoursesController {
  constructor(private readonly courseService: CoursesService) {}
  // Dependency Injection: NestJS injeta automaticamente o service

  @Get()  // GET /courses
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')  // GET /courses/:id
  findOne(@Param('id') id: string) {
    // @Param extrai o parâmetro da URL
    return this.courseService.findOne(id);
  }

  @Post()  // POST /courses
  create(@Body() createCourseDTO: CreateCourseDTO) {
    // @Body extrai o corpo da requisição e valida com o DTO
    return this.courseService.create(createCourseDTO);
  }

  @Put(':id')  // PUT /courses/:id
  update(@Param('id') id: string, @Body() updateCourseDTO: UpdateCourseDTO) {
    return this.courseService.update(id, updateCourseDTO);
  }

  @Delete(':id')  // DELETE /courses/:id
  @HttpCode(204)  // Retorna 204 No Content em caso de sucesso
  remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }
}
```

**Decorators HTTP:**
- `@Get()`, `@Post()`, `@Put()`, `@Delete()`: Define o método HTTP
- `@Param()`: Extrai parâmetros da URL
- `@Body()`: Extrai e valida o corpo da requisição
- `@HttpCode()`: Define o status code de resposta

---

### Service: `courses.service.ts`

Vamos analisar cada método em detalhes:

#### 1. Find All - Listar todos os cursos

```typescript
async findAll() {
  return this.courseRepository.find({
    relations: ['tags'],  // Faz JOIN com tabela de tags
  });
}
```

**SQL equivalente:**
```sql
SELECT c.*, t.* 
FROM courses c 
LEFT JOIN courses_tags_tags ct ON c.id = ct.coursesId
LEFT JOIN tags t ON ct.tagsId = t.id
```

---

#### 2. Find One - Buscar curso por ID

```typescript
async findOne(id: string) {
  const course = await this.courseRepository.findOne({
    where: { id },
    relations: ['tags'],
  });
  
  if (!course) {
    // Lança exceção que resulta em HTTP 404
    throw new NotFoundException(`Course ID ${id} not found`);
  }
  
  return course;
}
```

**Por que usar NotFoundException?**
- NestJS converte automaticamente em resposta HTTP 404
- Mensagem de erro consistente
- Middleware de exception handling lida com isso

---

#### 3. Create - Criar novo curso

```typescript
async create(createCourseDTO: CreateCourseDTO) {
  // Para cada nome de tag, busca ou cria a tag
  const tags = await Promise.all(
    createCourseDTO.tags.map((name) => this.preloadTagByName(name))
  );
  
  // Cria instância do curso (ainda não salvou no banco)
  const course = this.courseRepository.create({
    ...createCourseDTO,
    tags,
  });
  
  // Salva no banco (INSERT)
  return this.courseRepository.save(course);
}
```

**Por que Promise.all?**
- Executa todas as buscas de tags em paralelo
- Mais eficiente que executar uma por uma
- Reduz o tempo de resposta da API

**Fluxo de criação:**
1. Recebe array de nomes de tags: `["backend", "typescript"]`
2. Para cada nome, chama `preloadTagByName`
3. `preloadTagByName` busca a tag no banco ou cria uma nova
4. Cria o curso com as tags associadas
5. Salva tudo no banco (cascade salva as tags também)

---

#### 4. PreloadTagByName - Buscar ou criar tag

```typescript
private async preloadTagByName(name: string): Promise<Tag> {
  // Busca tag existente pelo nome
  const tag = await this.tagRepository.findOne({ where: { name } });
  
  if (tag) {
    return tag;  // Tag já existe, retorna ela
  }
  
  // Tag não existe, cria uma nova (mas não salva ainda)
  return this.tagRepository.create({ name });
}
```

**Por que não usar save aqui?**
- `create` apenas cria a instância, não salva no banco
- A tag será salva automaticamente devido ao `cascade: true` no Course
- Evita operações desnecessárias no banco

---

#### 5. Update - Atualizar curso

```typescript
async update(id: string, updateCourseDTO: UpdateCourseDTO) {
  // Se tags foram enviadas, processa elas
  const tags =
    updateCourseDTO.tags &&
    (await Promise.all(
      updateCourseDTO.tags.map((name) => this.preloadTagByName(name))
    ));
  
  // preload: busca a entidade existente e atualiza com novos valores
  const course = await this.courseRepository.preload({
    ...updateCourseDTO,
    id,
    tags,
  });
  
  if (!course) {
    throw new NotFoundException(`Course ID ${id} not found`);
  }
  
  // Salva as alterações
  return this.courseRepository.save(course);
}
```

**O que é preload?**
- Busca a entidade existente pelo ID
- Atualiza apenas os campos enviados (partial update)
- Mantém os campos não enviados intactos
- Retorna `undefined` se não encontrar

---

#### 6. Remove - Deletar curso

```typescript
async remove(id: string) {
  const course = await this.courseRepository.findOne({
    where: { id },
  });

  if (!course) {
    throw new NotFoundException(`Course ID ${id} not found`);
  }
  
  // Remove do banco (DELETE)
  return this.courseRepository.remove(course);
}
```

**Por que buscar antes de deletar?**
- `remove()` precisa de uma instância da entidade
- Permite lançar erro 404 se não existir
- Triggers dos hooks @BeforeRemove, @AfterRemove

---

## Migrations - Versionamento do Schema

As migrations são como um "Git para o banco de dados". Cada migration tem:
- Método `up()`: aplica a mudança
- Método `down()`: reverte a mudança

### Migration 1: CreateCourseTable

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // Habilita extensão UUID do PostgreSQL
  await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  
  // Cria tabela courses
  await queryRunner.createTable(
    new Table({
      name: 'courses',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
        },
        {
          name: 'name',
          type: 'varchar',
        },
        {
          name: 'description',
          type: 'varchar',
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
      ],
    }),
  );
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.dropTable('courses');
}
```

---

### Migration 2: CreateTagTable

Cria a tabela de tags com estrutura similar à de courses.

---

### Migration 3: CreateCoursesTagsTable

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.createTable(
    new Table({
      name: 'courses_tags_tags',  // Nome gerado pelo TypeORM
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
      ],
    }),
  );
}
```

**Tabela Pivot:**
- Necessária para relacionamento many-to-many
- Armazena pares (courseId, tagId)
- Permite que um curso tenha várias tags e vice-versa

---

### Migration 4: AddCourseIdToCoursesTagsTable

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // Adiciona coluna coursesId
  await queryRunner.addColumn(
    'courses_tags_tags',
    new TableColumn({
      name: 'coursesId',
      type: 'uuid',
      isNullable: true,
    }),
  );
  
  // Cria foreign key
  await queryRunner.createForeignKey(
    'courses_tags_tags',
    new TableForeignKey({
      name: 'courses_tags_courses',
      columnNames: ['coursesId'],
      referencedTableName: 'courses',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',  // Se course for deletado, seta NULL
    }),
  );
}
```

**Foreign Key:**
- Garante integridade referencial
- `onDelete: SET NULL`: quando curso é deletado, coluna fica NULL
- Alternativas: `CASCADE`, `RESTRICT`, `NO ACTION`

---

### Migration 5: AddTagsIdToCoursesTagsTable

Similar à anterior, mas adiciona a foreign key para tags.

---

## Testes E2E

### Estrutura do Teste: `test/courses.e2e-spec.ts`

```typescript
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let module: TestingModule;
  let courses: Course[];

  // Configuração do banco de dados de teste
  const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: 5433,  // Porta diferente do banco de dev
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [Course, Tag],
    synchronize: true,  // OK em testes, recria o schema a cada execução
  };
```

**Por que banco separado para testes?**
- Não interfere no banco de desenvolvimento
- Pode dropar e recriar sem medo
- `synchronize: true` está OK aqui

---

### Setup dos Testes

```typescript
beforeAll(async () => {
  // Cria módulo de teste
  const module = await Test.createTestingModule({
    imports: [
      CoursesModule,
      TypeOrmModule.forRootAsync({
        useFactory: async () => {
          return dataSourceOptions;
        },
      }),
    ],
  }).compile();

  // Cria app e inicializa
  app = module.createNestApplication();
  await app.init();

  // Dados de teste
  data = {
    name: 'NodeJs',
    description: 'Node.Js',
    tags: ['NoseJs', 'NestJs'],
  };
});
```

---

### Teste de Criação

```typescript
describe('POST /courses', () => {
  it('should create a course', async () => {
    const res = await request(app.getHttpServer())
      .post('/courses')
      .send(data)
      .expect(201);  // Espera status 201 Created
    
    // Valida resposta
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toEqual(data.name);
    expect(res.body.description).toEqual(data.description);
    expect(res.body.created_at).toBeDefined();
    expect(res.body.tags[0].name).toEqual(data.tags[0]);
    expect(res.body.tags[1].name).toEqual(data.tags[1]);
  });
});
```

**Supertest:**
- Simula requisições HTTP
- `expect(201)`: valida status code
- `res.body`: acessa resposta JSON

---

## Fluxo Completo de uma Requisição

Vamos seguir uma requisição POST para criar um curso:

### 1. Cliente faz requisição

```bash
POST http://localhost:3000/courses
Content-Type: application/json

{
  "name": "NestJS Fundamentals",
  "description": "Learn NestJS from scratch",
  "tags": ["backend", "typescript", "nestjs"]
}
```

---

### 2. Main.ts recebe a requisição

O servidor Express (dentro do NestJS) recebe a requisição HTTP.

---

### 3. ValidationPipe valida o DTO

```typescript
// O ValidationPipe (configurado em main.ts) executa:
1. Transforma JSON em CreateCourseDTO
2. Valida com class-validator:
   - name é string? ✅
   - description é string e tem máximo 300 chars? ✅
   - tags é array de strings? ✅
3. Se inválido, lança BadRequestException (400)
4. Se válido, passa para o controller
```

---

### 4. Controller recebe e delega

```typescript
@Post()
create(@Body() createCourseDTO: CreateCourseDTO) {
  return this.courseService.create(createCourseDTO);
}
```

---

### 5. Service processa a lógica

```typescript
async create(createCourseDTO: CreateCourseDTO) {
  // 5.1: Para cada tag, busca ou cria
  const tags = await Promise.all(
    ['backend', 'typescript', 'nestjs'].map(name => this.preloadTagByName(name))
  );
  // Resultado: [Tag{name:'backend'}, Tag{name:'typescript'}, Tag{name:'nestjs'}]
  
  // 5.2: Cria instância do curso
  const course = this.courseRepository.create({
    name: 'NestJS Fundamentals',
    description: 'Learn NestJS from scratch',
    tags: [Tag{...}, Tag{...}, Tag{...}]
  });
  
  // 5.3: Salva no banco
  return this.courseRepository.save(course);
}
```

---

### 6. TypeORM executa queries SQL

```sql
-- 6.1: Busca ou insere tags
SELECT * FROM tags WHERE name = 'backend';
INSERT INTO tags (id, name, created_at) VALUES (uuid_generate_v4(), 'typescript', NOW());
-- ... outras tags

-- 6.2: Insere curso
INSERT INTO courses (id, name, description, created_at) 
VALUES (uuid_generate_v4(), 'NestJS Fundamentals', 'Learn NestJS from scratch', NOW());

-- 6.3: Cria relacionamentos na tabela pivot
INSERT INTO courses_tags_tags (id, coursesId, tagsId, created_at)
VALUES 
  (uuid_generate_v4(), '<course_id>', '<backend_tag_id>', NOW()),
  (uuid_generate_v4(), '<course_id>', '<typescript_tag_id>', NOW()),
  (uuid_generate_v4(), '<course_id>', '<nestjs_tag_id>', NOW());
```

---

### 7. Resposta é enviada ao cliente

```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "NestJS Fundamentals",
  "description": "Learn NestJS from scratch",
  "created_at": "2024-01-26T10:00:00.000Z",
  "tags": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "backend",
      "created_at": "2024-01-26T10:00:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "name": "typescript",
      "created_at": "2024-01-26T10:00:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440003",
      "name": "nestjs",
      "created_at": "2024-01-26T10:00:00.000Z"
    }
  ]
}
```

---

## Conceitos Avançados Aplicados

### 1. Dependency Injection (DI)

```typescript
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}
}
```

**Benefícios:**
- Desacoplamento: Service não precisa saber como criar o Repository
- Testabilidade: Fácil mockar dependências nos testes
- Single Responsibility: Cada classe foca em sua responsabilidade

---

### 2. Repository Pattern

O TypeORM implementa o Repository Pattern:

```typescript
// Ao invés de SQL direto:
const result = await database.query('SELECT * FROM courses WHERE id = $1', [id]);

// Usamos abstração:
const course = await this.courseRepository.findOne({ where: { id } });
```

**Vantagens:**
- Abstrai detalhes de SQL
- Facilita mudança de banco de dados
- Métodos reutilizáveis (find, save, remove, etc)

---

### 3. DTO Pattern

```typescript
// Sem DTO:
create(name: string, description: string, tags: string[]) {
  // Não valida dados
  // Não documenta o que é esperado
  // Vulnerável a mass assignment
}

// Com DTO:
create(@Body() createCourseDTO: CreateCourseDTO) {
  // Valida automaticamente
  // Documenta através da classe
  // Protege contra propriedades extras
}
```

---

### 4. Decorators

Decorators são metadados que modificam o comportamento de classes, métodos e propriedades:

```typescript
@Entity()        // TypeORM: marca como entidade
@Controller()    // NestJS: marca como controller
@Injectable()    // NestJS: permite injeção de dependências
@Get()          // NestJS: define rota GET
@Column()       // TypeORM: mapeia para coluna do banco
@IsString()     // class-validator: valida tipo
```

---

### 5. Async/Await e Promises

Todo acesso ao banco é assíncrono:

```typescript
// ERRADO - não aguarda
const course = this.courseRepository.findOne({ where: { id } });
console.log(course); // Promise { <pending> }

// CORRETO - aguarda resolução
const course = await this.courseRepository.findOne({ where: { id } });
console.log(course); // { id: '...', name: '...', ... }
```

---

## Segurança e Boas Práticas

### 1. Validação de Entrada

```typescript
// ValidationPipe configurado em main.ts previne:
- SQL Injection: dados validados antes de usar no banco
- XSS: strings escapadas automaticamente pelo TypeORM
- Mass Assignment: whitelist impede propriedades extras
```

---

### 2. Error Handling

```typescript
if (!course) {
  throw new NotFoundException(`Course ID ${id} not found`);
}
```

**NestJS Exception Filters:**
- Converte exceções em respostas HTTP apropriadas
- NotFoundException → 404
- BadRequestException → 400
- UnauthorizedException → 401

---

### 3. Migrations ao invés de Synchronize

```typescript
synchronize: false  // Produção
synchronize: true   // NUNCA em produção!
```

**Por quê?**
- `synchronize: true` altera schema automaticamente
- Pode dropar colunas/tabelas por engano
- Sem histórico de mudanças
- Migrations dão controle total

---

### 4. Environment Variables

```typescript
// Nunca hardcode credenciais!
password: 'minha_senha_123' 

// Use variáveis de ambiente
password: process.env.DB_PASS  

---

## Comandos Úteis

```bash
# Desenvolvimento
pnpm run start:dev          # Inicia com hot-reload

# Database
docker-compose up -d        # Inicia PostgreSQL
pnpm run typeorm migration:run  # Aplica migrations
pnpm run typeorm migration:revert  # Reverte última migration

# Testes
pnpm run test              # Testes unitários
pnpm run test:e2e          # Testes end-to-end
pnpm run test:cov          # Cobertura de testes

# Code Quality
pnpm run lint              # ESLint
pnpm run format            # Prettier
```

---

## Recursos para Aprender Mais

### NestJS
- [Documentação Oficial](https://docs.nestjs.com/)
- [NestJS Courses](https://courses.nestjs.com/)

### TypeORM
- [Documentação](https://typeorm.io/)
- [Migrations Guide](https://typeorm.io/migrations)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Padrões de Design
- Clean Architecture - Robert C. Martin
- Domain-Driven Design - Eric Evans
- Enterprise Integration Patterns

---

## Próximos Passos Sugeridos

1. **Adicionar Autenticação**
   - Implementar JWT
   - Guards para proteger rotas

2. **Adicionar Paginação**
   - Limitar resultados
   - Melhorar performance

3. **Adicionar Cache**
   - Redis para cache
   - Reduzir carga no banco

4. **Documentação da API**
   - Swagger/OpenAPI
   - Auto-documentação

5. **Logging e Monitoring**
   - Winston para logs
   - Sentry para errors

6. **CI/CD**
   - GitHub Actions
   - Deploy automatizado

---

## Conclusão

Este projeto demonstra uma aplicação NestJS completa e profissional, seguindo as melhores práticas da indústria. Ele serve como excelente base para:

- Aprender arquitetura backend moderna
- Entender TypeScript avançado
- Praticar testes automatizados
- Estudar padrões de design
- Preparar-se para projetos enterprise

O código é limpo, testável, escalável e fácil de manter! 
