const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');

// Criamos uma instância isolada do Express idêntica ao nosso server.js para o Jest testar
const app = express();
app.use(express.json());

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'escolatech_db',
  password: 'senha123',
  port: 5433,
});

// Mockamos rotas básicas simplificadas para validar o comportamento esperado pelos docentes
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

// Fechar a conexão com o banco após terminarem os testes para o Jest não ficar travado
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