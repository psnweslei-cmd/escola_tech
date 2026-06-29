# Escola Tech - Back-end de Blogging Dinâmico

Este projeto consiste no desenvolvimento do Back-end reformulado da plataforma **Escola Tech**, focado em prover um espaço centralizado, prático e tecnológico para que professores publiquem suas aulas e alunos consumam conteúdos educativos. A solução foi migrada para uma arquitetura escalável utilizando Node.js com Express e persistência de dados em banco relacional PostgreSQL.

## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js (v18+)
* **Framework Web:** Express
* **Banco de Dados:** PostgreSQL (via contêiner Docker na porta `5433`)
* **Driver do Banco:** `pg` (Pool de conexões nativo)
* **Suite de Testes:** Jest e Supertest
* **Automação CI/CD:** GitHub Actions

---

## 🏗️ Arquitetura do Sistema

A aplicação segue o padrão arquitetural de microsserviços containerizados para ambiente de desenvolvimento, estruturada de forma modular:
* `src/server.js`: Ponto de entrada do servidor Express contendo a configuração das rotas REST e conexões SQL puro.
* `tests/`: Pasta dedicada aos cenários de testes automatizados de integração das rotas críticas.
* `.github/workflows/`: Configurações de automação que validam a integridade do código e do banco de dados a cada commit.

---



## 🚀 Como Executar o Projeto Localmente

### 1. Clonar o Repositório
```bash
git clone [https://github.com/psnweslei-cmd/escola_tech.git](https://github.com/psnweslei-cmd/escola_tech.git)
cd escola_tech

## 📖 Guia de Uso da API (Endpoints REST)

Abaixo estão listadas as rotas implementadas para validação no Thunder Client ou Postman:

### 📄 Módulo de Postagens

* **Criar uma Postagem**
  * **Rota:** `POST /posts`
  * **Corpo da Requisição (JSON):**
    ```json
    {
      "titulo": "Introdução ao Docker",
      "conteudo": "Aprenda a containerizar suas aplicações de forma prática.",
      "usuario_id": 1
    }
    ```
  * **Resposta Esperada:** Status `201 Created`

* **Listar Todas as Postagens (Com Join de Usuários)**
  * **Rota:** `GET /posts`
  * **Resposta Esperada:** Status `200 OK` (Retorna array de posts contendo o nome do professor/autor).

* **Ler uma Postagem Específica**
  * **Rota:** `GET /posts/:id` (Substituir pelo ID do post)
  * **Resposta Esperada:** Status `200 OK`

* **Editar uma Postagem**
  * **Rota:** `PUT /posts/:id`
  * **Corpo da Requisição (JSON):**
    ```json
    {
      "titulo": "Introdução ao Docker - Atualizado",
      "conteudo": "Conteúdo revisado sobre contêineres."
    }
    ```
  * **Resposta Esperada:** Status `200 OK`

* **Excluir uma Postagem**
  * **Rota:** `DELETE /posts/:id`
  * **Resposta Esperada:** Status `200 OK`

* **Busca Avançada por Palavra-Chave (Requisito Obrigatório)**
  * **Rota:** `GET /posts/search?query=Docker`
  * **Funcionamento:** Realiza uma busca parcial e insensível a maiúsculas/minúsculas (`ILIKE`) tanto no título quanto no conteúdo.
  * **Resposta Esperada:** Status `200 OK`