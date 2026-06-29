# Escola Tech - Back-end de Blogging Dinâmico

[cite_start]Este projeto consiste no desenvolvimento do Back-end reformulado da plataforma **Escola Tech**, focado em prover um espaço centralizado, prático e tecnológico para que professores publiquem suas aulas e alunos consumam conteúdos educativos[cite: 31, 32]. [cite_start]A solução foi migrada para uma arquitetura escalável utilizando Node.js com Express e persistência de dados em banco relacional PostgreSQL[cite: 34, 61, 64].

## 🛠️ Tecnologias Utilizadas

* [cite_start]**Runtime:** Node.js (v18+) 
* [cite_start]**Framework Web:** Express [cite: 61]
* [cite_start]**Banco de Dados:** PostgreSQL (via contêiner Docker na porta `5433`) [cite: 64, 68]
* **Driver do Banco:** `pg` (Pool de conexões nativo)
* [cite_start]**Suite de Testes:** Jest e Supertest [cite: 81]
* [cite_start]**Automação CI/CD:** GitHub Actions [cite: 75]

---

## 🏗️ Arquitetura do Sistema

[cite_start]A aplicação segue o padrão arquitetural de microsserviços containerizados para ambiente de desenvolvimento, estruturada de forma modular:
* [cite_start]`src/server.js`: Ponto de entrada do servidor Express contendo a configuração das rotas REST e conexões SQL puro[cite: 36, 61].
* [cite_start]`tests/`: Pasta dedicada aos cenários de testes automatizados de integração das rotas críticas.
* [cite_start]`.github/workflows/`: Configurações de automação que validam a integridade do código e do banco de dados a cada commit[cite: 75].

---

## 🚀 Como Executar o Projeto Localmente

### 1. Clonar o Repositório
```bash
git clone [https://github.com/seu-usuario/escola_tech.git](https://github.com/seu-usuario/escola_tech.git)
cd escola_tech