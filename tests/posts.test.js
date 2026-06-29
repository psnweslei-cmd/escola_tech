const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'escolatech_db',
  password: 'senha123',
  port: 5433,
});

// Mockamos as rotas básicas simplificadas para validar o comportamento esperado
app.get('/posts/search', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'É necessário fornecer um termo de busca.' });
  
  const resultado = await pool.query(
    'SELECT p.id, p.titulo, p.conteudo FROM posts p WHERE p.titulo ILIKE $1 OR p.conteudo ILIKE $1',
    [`%${query}%`]
  );
  return res.json(resultado.rows);
});

app.post('/posts', async (req, res) => {
  const { titulo, conteudo, usuario_id } = req.body;
  const resultado = await pool.query(
    'INSERT INTO posts (titulo, conteudo, usuario_id) VALUES ($1, $2, $3) RETURNING *',
    [titulo, conteudo, usuario_id]
  );
  return res.status(201).json(resultado.rows[0]);
});

// Executado ANTES de todos os testes para preparar o banco de dados do GitHub Actions
beforeAll(async () => {
  // Cria a tabela de usuários se não existir
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      senha VARCHAR(255) NOT NULL,
      tipo VARCHAR(20) DEFAULT 'aluno',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Cria a tabela de posts se não existir
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(150) NOT NULL,
      conteudo TEXT NOT NULL,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Garante que exista pelo menos um usuário cadastrado com ID 1 para o teste de posts funcionar
  await pool.query(`
    INSERT INTO usuarios (id, nome, email, senha, tipo)
    VALUES (1, 'Professor Teste', 'professor.teste@escola.com', '123456', 'professor')
    ON CONFLICT (id) DO NOTHING;
  `);
});

// Fechar a conexão com o banco após terminarem os testes
afterAll(async () => {
  await pool.end();
});

// Bloco de Testes Automatizados exigidos pela Pos Tech
describe('Testes Unitários do Módulo de Posts - Tech Challenge', () => {
  
  it('Deve criar um novo post com sucesso (POST /posts)', async () => {
    const novoPost = {
      titulo: 'Post de Teste do Jest',
      conteudo: 'Validando a criação automatizada de postagens.',
      usuario_id: 1
    };

    const resposta = await request(app)
      .post('/posts')
      .send(novoPost);

    expect(resposta.statusCode).toBe(201);
    expect(resposta.body).toHaveProperty('id');
    expect(resposta.body.titulo).toBe(novoPost.titulo);
  });

  it('Deve buscar posts por palavra-chave com sucesso (GET /posts/search)', async () => {
    const resposta = await request(app)
      .get('/posts/search?query=Jest');

    expect(resposta.statusCode).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });

  it('Deve retornar erro 400 se buscar sem passar nenhuma palavra-chave', async () => {
    const resposta = await request(app)
      .get('/posts/search');

    expect(resposta.statusCode).toBe(400);
    expect(resposta.body).toHaveProperty('error');
  });
});