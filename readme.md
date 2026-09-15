# EscolaTech

Plataforma de blog educacional com API em Node.js/Express, PostgreSQL e interface responsiva em React. Estudantes podem explorar, buscar e ler publicações; professores autenticados podem administrar o conteúdo.

## Tecnologias

- React com TypeScript (`.tsx`), React Router e Vite
- Node.js, Express e PostgreSQL
- Token JWT assinado com HS256 e senha protegida com `scrypt`
- Jest e Supertest
- Docker Compose e GitHub Actions

## Executar localmente

Use Node.js 20 ou superior e tenha PostgreSQL disponível. Na raiz do repositório:

```bash
npm install
docker compose up -d db
```

O Compose cria as tabelas automaticamente em um banco novo a partir de `database/init.sql`.

Copie `.env.example` para `.env` e escolha uma chave longa para `JWT_SECRET`. No PowerShell, por exemplo:

```powershell
Copy-Item .env.example .env
```

Em dois terminais, inicie a API e a interface:

```bash
npm run dev
npm run dev:web
```

A API fica em `http://localhost:3000`; o front-end fica em `http://localhost:5173` e encaminha chamadas à API automaticamente.

## Primeiro acesso de professor

Crie uma conta docente usando variáveis de ambiente. Não informe a senha como argumento de linha de comando:

```powershell
$env:TEACHER_NAME = 'Professora Ana'
$env:TEACHER_EMAIL = 'ana@escola.com'
$env:TEACHER_PASSWORD = 'escolha-uma-senha-forte'
npm run create:professor
```

O comando cria a conta ou atualiza a senha da conta com esse e-mail. O endpoint público `POST /usuarios` cria apenas alunos.

## Executar tudo com Docker

Configure `.env` com `JWT_SECRET` e execute:

```bash
docker compose up --build
```

Abra `http://localhost:8080`. O front-end é servido pelo Nginx, que encaminha as rotas da API ao Express. Para cadastrar o professor no banco do Compose:

```powershell
$env:TEACHER_NAME = 'Professora Ana'
$env:TEACHER_EMAIL = 'ana@escola.com'
$env:TEACHER_PASSWORD = 'escolha-uma-senha-forte'
docker compose run --rm -e TEACHER_NAME -e TEACHER_EMAIL -e TEACHER_PASSWORD api npm run create:professor
```

As credenciais padrão do banco no Compose são apenas para desenvolvimento. Troque-as antes de qualquer publicação externa.

## Funcionalidades

- Lista de publicações com busca por palavra-chave.
- Leitura completa de cada publicação.
- Login docente e rotas de administração protegidas.
- Painel para criar, editar e excluir publicações.
- Layout responsivo para celulares e desktops.

## API principal

| Método | Rota | Acesso |
| --- | --- | --- |
| `GET` | `/posts` | Público |
| `GET` | `/posts/search?query=termo` | Público |
| `GET` | `/posts/:id` | Público |
| `POST` | `/auth/login` | Público, apenas professor |
| `POST` | `/posts` | Professor autenticado |
| `PUT` | `/posts/:id` | Professor autenticado |
| `DELETE` | `/posts/:id` | Professor autenticado |
| `POST` | `/usuarios` | Público, cria aluno |

As rotas protegidas recebem `Authorization: Bearer <token>`. O servidor define a autoria do novo post a partir do token.

## Testes, tipos e build

```bash
npm test
npm run test:web
npm run typecheck:web
npm run build:web
```

Os testes da API simulam o PostgreSQL, e os testes do front-end simulam as respostas HTTP; nenhuma suíte exige um banco ativo. O workflow do GitHub Actions executa ambas e valida o build.

Veja a [documentação do front-end](docs/front-end.md) e o [roteiro para a apresentação em vídeo](docs/roteiro-demo.md).

## Estrutura

```text
src/server.js            API Express e conexão PostgreSQL
web/                     aplicação React
tests/                   testes da API
scripts/                 utilitários administrativos
Dockerfile.api           imagem do back-end
Dockerfile.web           build e imagem Nginx do front-end
docker-compose.yml       banco, API e interface
```
