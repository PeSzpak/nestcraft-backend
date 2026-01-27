# NestCraft Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

Uma API RESTful robusta para gerenciamento de cursos e tags, construída com NestJS, TypeORM e PostgreSQL. Este projeto demonstra as melhores práticas de desenvolvimento backend incluindo arquitetura modular, validação de dados, migrações de banco de dados e testes end-to-end.

## Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Banco de Dados](#-banco-de-dados)
- [Configuração](#-configuração)
- [Instalação e Execução](#-instalação-e-execução)
- [API Endpoints](#-api-endpoints)
- [Testes](#-testes)
- [Migrations](#-migrations)
- [Docker](#-docker)

## Visão Geral

O **NestCraft Backend** é uma aplicação backend completa que implementa um sistema de gerenciamento de cursos com tags. O projeto utiliza TypeScript e segue os princípios SOLID e clean architecture através do framework NestJS.

### Funcionalidades Principais

- ✅ CRUD completo de cursos
- ✅ Sistema de tags com relacionamento many-to-many
- ✅ Validação de dados com class-validator
- ✅ Transformação automática de DTOs
- ✅ Migrações de banco de dados versionadas
- ✅ Testes E2E automatizados
- ✅ Containerização com Docker
- ✅ Configuração por variáveis de ambiente

## Arquitetura

O projeto segue a arquitetura modular do NestJS, organizada em camadas:

```
┌─────────────────────────────────────────┐
│          Controllers Layer              │  ← HTTP/REST Endpoints
├─────────────────────────────────────────┤
│          Services Layer                 │  ← Business Logic
├─────────────────────────────────────────┤
│          Repositories Layer             │  ← Data Access (TypeORM)
├─────────────────────────────────────────┤
│          Database Layer                 │  ← PostgreSQL
└─────────────────────────────────────────┘
```

### Módulos

- **AppModule**: Módulo raiz que orquestra toda a aplicação
- **CoursesModule**: Gerenciamento de cursos e tags
- **DatabaseModule**: Configuração do TypeORM e conexão com PostgreSQL

## Tecnologias

### Core
- **[NestJS](https://nestjs.com/)** v11.0.1 - Framework backend progressivo
- **[TypeScript](https://www.typescriptlang.org/)** v5.7.3 - Superset tipado de JavaScript
- **[Node.js](https://nodejs.org/)** - Runtime JavaScript

### Banco de Dados
- **[TypeORM](https://typeorm.io/)** v0.3.25 - ORM para TypeScript e JavaScript
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[pg](https://node-postgres.com/)** v8.16.3 - Driver PostgreSQL para Node.js

### Validação e Transformação
- **[class-validator](https://github.com/typestack/class-validator)** v0.14.2 - Validação baseada em decorators
- **[class-transformer](https://github.com/typestack/class-transformer)** v0.5.1 - Transformação de objetos

### Configuração
- **[@nestjs/config](https://docs.nestjs.com/techniques/configuration)** v4.0.2 - Gerenciamento de configurações
- **[dotenv](https://github.com/motdotla/dotenv)** v17.2.0 - Carregamento de variáveis de ambiente

### Testes
- **[Jest](https://jestjs.io/)** v29.7.0 - Framework de testes
- **[Supertest](https://github.com/visionmedia/supertest)** v7.0.0 - Testes HTTP
- **[@nestjs/testing](https://docs.nestjs.com/fundamentals/testing)** v11.0.1 - Utilitários de teste do NestJS

### DevOps
- **[Docker](https://www.docker.com/)** - Containerização
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestração de containers

### Code Quality
- **[ESLint](https://eslint.org/)** v9.18.0 - Linter
- **[Prettier](https://prettier.io/)** v3.4.2 - Formatador de código

## Estrutura do Projeto

```
nestcraft-backend/
├── src/
│   ├── main.ts                      # Ponto de entrada da aplicação
│   ├── app.module.ts                # Módulo raiz
│   ├── app.controller.ts            # Controller principal
│   ├── app.service.ts               # Service principal
│   │
│   ├── courses/                     # Módulo de Cursos
│   │   ├── courses.module.ts        # Definição do módulo
│   │   ├── courses.controller.ts    # Endpoints REST
│   │   ├── courses.service.ts       # Lógica de negócio
│   │   ├── dto/                     # Data Transfer Objects
│   │   │   ├── create-course.dto.ts # DTO de criação
│   │   │   └── update-course.dto.ts # DTO de atualização
│   │   └── entities/                # Entidades do TypeORM
│   │       ├── courses.entity.ts    # Entidade Course
│   │       └── tags.entity.ts       # Entidade Tag
│   │
│   ├── database/                    # Módulo de Banco de Dados
│   │   ├── database.module.ts       # Configuração TypeORM
│   │   └── orm-cli-config.ts        # Configuração CLI TypeORM
│   │
│   └── migrations/                  # Migrações do banco
│       ├── 1752676142776-CreateCourseTable.ts
│       ├── 1752684319861-CreateTagTable.ts
│       ├── 1752686922179-CreateCoursesTagsTable.ts
│       ├── 1752688220082-AddCourseIdToCoursesTagsTable.ts
│       └── 1752689396934-AddTagsIdToCoursesTagsTable.ts
│
├── test/                            # Testes E2E
│   ├── courses.e2e-spec.ts          # Testes de integração
│   └── jest-e2e.json                # Configuração Jest E2E
│
├── docker-compose.yml               # Configuração Docker Compose
├── Dockerfile                       # Imagem Docker do PostgreSQL
├── package.json                     # Dependências e scripts
├── tsconfig.json                    # Configuração TypeScript
├── nest-cli.json                    # Configuração NestJS CLI
├── eslint.config.mjs                # Configuração ESLint
└── .env.example                     # Exemplo de variáveis de ambiente
```

## Banco de Dados

### Modelo de Dados

O banco de dados utiliza um relacionamento **many-to-many** entre Courses e Tags:

```
┌─────────────────────┐         ┌──────────────────────────┐         ┌─────────────────────┐
│      COURSES        │         │   COURSES_TAGS_TAGS      │         │        TAGS         │
├─────────────────────┤         ├──────────────────────────┤         ├─────────────────────┤
│id (UUID) PK         │◄─────── ┤ coursesId (UUID) FK      │         │id (UUID) PK         │
│name (VARCHAR)       │         │ tagsId (UUID) FK         ├────────►│name (VARCHAR)       │
│description(VARCHAR) │         │ id (UUID) PK             │         │created_at(TIMESTAMP)│
│created_at(TIMESTAMP)│         │ created_at (TIMESTAMP)   │         └─────────────────────┘
└─────────────────────┘         └──────────────────────────┘
```

### Entidades

#### Course Entity
```typescript
- id: UUID (gerado automaticamente)
- name: string
- description: string
- tags: Tag[] (relação many-to-many)
- created_at: timestamp
```

#### Tag Entity
```typescript
- id: UUID (gerado automaticamente)
- name: string
- courses: Course[] (relação many-to-many)
- created_at: timestamp
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=docker
DB_NAME=nestcraft
```

### Configurações Importantes

- **Port**: A aplicação roda por padrão na porta 3000
- **Validation Pipe**: Configurado globalmente com:
  - `whitelist: true` - Remove propriedades não definidas nos DTOs
  - `forbidNonWhitelisted: true` - Retorna erro se propriedades extras forem enviadas
  - `transform: true` - Transforma automaticamente os payloads para instâncias DTO

## Instalação e Execução

### Pré-requisitos

- Node.js 18+ 
- pnpm (ou npm/yarn)
- Docker e Docker Compose (opcional)
- PostgreSQL 12+ (se não usar Docker)

### 1. Clone o repositório

```bash
git clone https://github.com/PeSzpak/nestcraft-backend.git
cd nestcraft-backend
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

### 4. Inicie o banco de dados com Docker

```bash
docker-compose up -d
```

Isso irá iniciar dois containers PostgreSQL:
- **nestcraft-db**: Banco de dados de desenvolvimento (porta 5432)
- **teste-db**: Banco de dados de testes (porta 5433)

### 5. Execute as migrations

```bash
pnpm run typeorm migration:run -- -d src/database/orm-cli-config.ts
```

### 6. Inicie a aplicação

```bash
# Modo desenvolvimento com hot-reload
pnpm run start:dev

# Modo produção
pnpm run build
pnpm run start:prod
```

A API estará disponível em `http://localhost:3000`

## API Endpoints

### Courses

#### Listar todos os cursos
```http
GET /courses
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "NestJS Fundamentals",
    "description": "Learn the basics of NestJS",
    "created_at": "2024-01-26T10:00:00.000Z",
    "tags": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "backend",
        "created_at": "2024-01-26T10:00:00.000Z"
      }
    ]
  }
]
```

#### Buscar curso por ID
```http
GET /courses/:id
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "NestJS Fundamentals",
  "description": "Learn the basics of NestJS",
  "created_at": "2024-01-26T10:00:00.000Z",
  "tags": [...]
}
```

#### Criar novo curso
```http
POST /courses
Content-Type: application/json

{
  "name": "NestJS Fundamentals",
  "description": "Learn the basics of NestJS",
  "tags": ["backend", "typescript", "nodejs"]
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "NestJS Fundamentals",
  "description": "Learn the basics of NestJS",
  "created_at": "2024-01-26T10:00:00.000Z",
  "tags": [...]
}
```

#### Atualizar curso
```http
PUT /courses/:id
Content-Type: application/json

{
  "name": "NestJS Advanced",
  "description": "Advanced NestJS concepts",
  "tags": ["backend", "advanced"]
}
```

**Response:** `200 OK`

#### Deletar curso
```http
DELETE /courses/:id
```

**Response:** `204 No Content`

### Validações

Os DTOs implementam as seguintes validações:

- **name**: Obrigatório, deve ser string
- **description**: Obrigatório, deve ser string, máximo 300 caracteres
- **tags**: Obrigatório, deve ser array de strings

## Testes

O projeto conta com testes unitários e end-to-end (E2E).

### Executar testes unitários

```bash
# Todos os testes unitários
pnpm run test

# Testes em modo watch
pnpm run test:watch

# Cobertura de testes
pnpm run test:cov
```

### Executar testes E2E

```bash
# Certifique-se de que o banco de testes está rodando
docker-compose up dbtest -d

# Execute os testes E2E
pnpm run test:e2e
```

### Testes E2E Implementados

Os testes E2E cobrem todos os endpoints:

1. ✅ POST /courses - Criação de curso
2. ✅ GET /courses - Listagem de cursos
3. ✅ GET /courses/:id - Busca de curso por ID
4. ✅ PUT /courses/:id - Atualização de curso
5. ✅ DELETE /courses/:id - Remoção de curso

## Migrations

As migrations são versionadas e aplicadas sequencialmente:

### Migrations Existentes

1. **CreateCourseTable** - Cria tabela de cursos com UUID
2. **CreateTagTable** - Cria tabela de tags
3. **CreateCoursesTagsTable** - Cria tabela pivot para relação many-to-many
4. **AddCourseIdToCoursesTagsTable** - Adiciona FK de courses
5. **AddTagsIdToCoursesTagsTable** - Adiciona FK de tags

### Comandos de Migration

```bash
# Executar migrations pendentes
pnpm run typeorm migration:run -- -d src/database/orm-cli-config.ts

# Reverter última migration
pnpm run typeorm migration:revert -- -d src/database/orm-cli-config.ts

# Criar nova migration
pnpm run typeorm migration:create src/migrations/NomeDaMigration

# Gerar migration a partir das mudanças nas entidades
pnpm run typeorm migration:generate src/migrations/NomeDaMigration -- -d src/database/orm-cli-config.ts
```

## Docker

O projeto utiliza Docker Compose para facilitar o setup do ambiente.

### Estrutura Docker

- **Dockerfile**: Customiza a imagem PostgreSQL (ajusta UID do usuário postgres)
- **docker-compose.yml**: Define dois serviços PostgreSQL
  - `db`: Banco de desenvolvimento (porta 5432)
  - `dbtest`: Banco de testes (porta 5433)

### Comandos Docker

```bash
# Iniciar todos os containers
docker-compose up -d

# Iniciar apenas o banco de desenvolvimento
docker-compose up db -d

# Iniciar apenas o banco de testes
docker-compose up dbtest -d

# Ver logs dos containers
docker-compose logs -f

# Parar containers
docker-compose down

# Parar e remover volumes (CUIDADO: apaga os dados!)
docker-compose down -v
```

### Volumes

Os dados do banco de desenvolvimento são persistidos em `.docker/dbdata/`. Adicione esta pasta ao `.gitignore`.

## Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run start          # Inicia em modo normal
pnpm run start:dev      # Inicia com hot-reload
pnpm run start:debug    # Inicia em modo debug

# Build
pnpm run build          # Compila o projeto

# Testes
pnpm run test           # Testes unitários
pnpm run test:watch     # Testes em modo watch
pnpm run test:cov       # Cobertura de testes
pnpm run test:e2e       # Testes E2E

# Code Quality
pnpm run lint           # Executa ESLint
pnpm run format         # Formata código com Prettier
```

## Como Funciona

### Fluxo de Requisição

1. **Cliente** faz requisição HTTP para um endpoint
2. **Controller** recebe e valida a requisição através dos DTOs
3. **ValidationPipe** valida automaticamente os dados baseado nos decorators
4. **Service** processa a lógica de negócio
5. **Repository (TypeORM)** acessa o banco de dados
6. **Response** é retornada ao cliente

### Exemplo: Criando um Curso

```typescript
// 1. Cliente envia POST /courses
{
  "name": "NestJS",
  "description": "Framework backend",
  "tags": ["backend", "typescript"]
}

// 2. Controller recebe e valida
@Post()
create(@Body() createCourseDTO: CreateCourseDTO) {
  return this.courseService.create(createCourseDTO);
}

// 3. Service processa
async create(createCourseDTO: CreateCourseDTO) {
  // Busca ou cria tags
  const tags = await Promise.all(
    createCourseDTO.tags.map(name => this.preloadTagByName(name))
  );
  
  // Cria curso com tags
  const course = this.courseRepository.create({
    ...createCourseDTO,
    tags,
  });
  
  // Salva no banco
  return this.courseRepository.save(course);
}

// 4. Retorna curso criado com ID e timestamps
```

## ontribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença

Este projeto está sob a licença UNLICENSED.

---

Desenvolvido com ❤️ usando [NestJS](https://nestjs.com/)
