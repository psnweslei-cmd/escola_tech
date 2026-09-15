require('dotenv').config();

const crypto = require('crypto');
const cors = require('cors');
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'troque-esta-chave-no-ambiente-de-producao';
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 8;
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('REPLACE_WITH'))) {
  throw new Error('Defina um JWT_SECRET aleatório com pelo menos 32 caracteres em produção.');
}

// Conexão com o banco de dados no Docker (Porta 5433)
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'escolatech_db',
  password: process.env.DB_PASSWORD || 'senha123',
  port: Number(process.env.DB_PORT || 5433),
});

app.use(cors());
app.use(express.json({ limit: '8mb' }));

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return `scrypt$${salt}$${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}

function passwordMatches(password, storedPassword) {
  const match = /^scrypt\$([a-f0-9]{32})\$([a-f0-9]{128})$/.exec(storedPassword);
  if (!match) return false;
  const [, salt, savedHash] = match;
  const calculatedHash = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(savedHash, 'hex'), calculatedHash);
}

function requireProfessor(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Autenticação de professor necessária.' });
  const [header, body, signature] = token.split('.');
  let decodedHeader;
  try { decodedHeader = JSON.parse(Buffer.from(header || '', 'base64url').toString('utf8')); } catch { return res.status(401).json({ error: 'Token inválido.' }); }
  const expected = header && body && crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (decodedHeader.alg !== 'HS256' || decodedHeader.typ !== 'JWT') return res.status(401).json({ error: 'Token inválido.' });
  if (!expected || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
  try {
    const user = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (user.tipo !== 'professor' || user.exp <= Math.floor(Date.now() / 1000)) throw new Error('expired');
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

function validatePost(req, res, next) {
  const { titulo, conteudo, imagem_url, imagem_alt } = req.body || {};
  if (!titulo?.trim() || !conteudo?.trim()) return res.status(400).json({ error: 'Título e conteúdo são obrigatórios.' });
  if (imagem_url && (typeof imagem_url !== 'string' || !/^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(imagem_url))) return res.status(400).json({ error: 'A imagem deve ser um arquivo PNG, JPG, WEBP ou GIF válido.' });
  if (imagem_url && imagem_url.length > 8 * 1024 * 1024) return res.status(413).json({ error: 'A imagem deve ter no máximo 6 MB.' });
  if (imagem_alt && (typeof imagem_alt !== 'string' || imagem_alt.length > 250)) return res.status(400).json({ error: 'O texto alternativo deve ter no máximo 250 caracteres.' });
  return next();
}

// Rota inicial de teste
app.get('/', (req, res) => {
  res.send('O Servidor do EscolaTech está ON e conectado ao Postgres!');
});

// Login exclusivo para contas cadastradas como professor.
app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body || {};
  if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  try {
    const result = await pool.query('SELECT id, nome, email, senha, tipo FROM usuarios WHERE email = $1', [email.toLowerCase().trim()]);
    const professor = result.rows[0];
    if (!professor || professor.tipo !== 'professor' || !passwordMatches(senha, professor.senha)) return res.status(401).json({ error: 'E-mail, senha ou permissão inválidos.' });
    const exp = Math.floor(Date.now() / 1000) + JWT_EXPIRES_IN_SECONDS;
    const token = signToken({ sub: professor.id, nome: professor.nome, tipo: professor.tipo, exp });
    return res.json({ token, expiresAt: new Date(exp * 1000).toISOString(), usuario: { id: professor.id, nome: professor.nome, email: professor.email, tipo: professor.tipo } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível realizar o login.' });
  }
});

// =========================================================================
// ROTAS DE POSTS
// =========================================================================

// REQUISITO: GET /posts/search - Busca de Posts por palavra-chave
app.get('/posts/search', async (req, res) => {
  const { query } = req.query; // Captura a query string (ex: ?query=Node)
  try {
    if (!query) {
      return res.status(400).json({ error: 'É necessário fornecer um termo de busca.' });
    }

    const queryText = `
      SELECT p.id, p.titulo, p.conteudo, p.categoria, p.imagem_url, p.imagem_alt,
             p.imagem_credito, p.imagem_fonte_url, p.referencia_titulo, p.referencia_url,
             p.criado_em, u.nome as autor 
      FROM posts p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.titulo ILIKE $1 OR p.conteudo ILIKE $1 OR p.categoria ILIKE $1
      ORDER BY p.id DESC
    `;
    
    const resultado = await pool.query(queryText, [`%${query}%`]);
    return res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar posts.' });
  }
});

// REQUISITO: GET /posts - Lista de Posts / Listagem de Todas as Postagens
app.get('/posts', async (req, res) => {
  try {
    const queryText = `
      SELECT p.id, p.titulo, p.conteudo, p.categoria, p.imagem_url, p.imagem_alt,
             p.imagem_credito, p.imagem_fonte_url, p.referencia_titulo, p.referencia_url,
             p.criado_em, u.nome as autor 
      FROM posts p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.id DESC
    `;
    const resultado = await pool.query(queryText);
    return res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar listagem de posts.' });
  }
});

// REQUISITO: GET /posts/:id - Leitura de Posts detalhada
app.get('/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const postQuery = `
      SELECT p.id, p.titulo, p.conteudo, p.categoria, p.imagem_url, p.imagem_alt,
             p.imagem_credito, p.imagem_fonte_url, p.referencia_titulo, p.referencia_url,
             p.criado_em, u.nome as autor 
      FROM posts p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = $1
    `;
    const postResultado = await pool.query(postQuery, [id]);

    if (postResultado.rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado.' });
    }

    const post = postResultado.rows[0];

    // Traz também os comentários para enriquecer a leitura do post
    const comentariosQuery = `
      SELECT c.id, c.conteudo, c.criado_em, u.nome as autor_comentario
      FROM comentarios c
      INNER JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.id ASC
    `;
    const comentariosResultado = await pool.query(comentariosQuery, [id]);
    post.comentarios = comentariosResultado.rows;

    return res.json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao ler post específico.' });
  }
});

// REQUISITO: POST /posts - Criação de Postagens
app.post('/posts', requireProfessor, validatePost, async (req, res) => {
  const { titulo, conteudo, imagem_url, imagem_alt } = req.body;
  try {
    const queryText = 'INSERT INTO posts (titulo, conteudo, imagem_url, imagem_alt, usuario_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [titulo.trim(), conteudo.trim(), imagem_url || null, imagem_alt?.trim() || null, req.user.sub];
    const resultado = await pool.query(queryText, values);
    return res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar post.' });
  }
});

// REQUISITO: PUT /posts/:id - Edição de Postagens
app.put('/posts/:id', requireProfessor, validatePost, async (req, res) => {
  const { id } = req.params;
  const { titulo, conteudo, imagem_url, imagem_alt } = req.body;
  try {
    const queryText = 'UPDATE posts SET titulo = $1, conteudo = $2, imagem_url = $3, imagem_alt = $4 WHERE id = $5 RETURNING *';
    const resultado = await pool.query(queryText, [titulo.trim(), conteudo.trim(), imagem_url || null, imagem_alt?.trim() || null, id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado para edição.' });
    }

    return res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao editar post.' });
  }
});

// REQUISITO: DELETE /posts/:id - Exclusão de Postagens
app.delete('/posts/:id', requireProfessor, async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado para exclusão.' });
    }

    return res.json({ message: 'Post deletado com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao excluir post.' });
  }
});

// =========================================================================
// ROTAS DE AUXILIARES (USUÁRIOS E COMENTÁRIOS)
// =========================================================================

app.post('/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body || {};
  if (typeof nome !== 'string' || typeof email !== 'string' || typeof senha !== 'string' || !nome.trim() || !email.trim() || !senha) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }
  try {
    const queryText = 'INSERT INTO usuarios (nome, email, senha, tipo) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo, criado_em';
    // Cadastro público cria apenas alunos; perfis de professor são administrativos.
    const resultado = await pool.query(queryText, [nome.trim(), email.toLowerCase().trim(), hashPassword(senha), 'aluno']);
    return res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

app.post('/comentarios', async (req, res) => {
  const { conteudo, post_id, usuario_id } = req.body;
  try {
    const queryText = 'INSERT INTO comentarios (conteudo, post_id, usuario_id) VALUES ($1, $2, $3) RETURNING *';
    const resultado = await pool.query(queryText, [conteudo, post_id, usuario_id]);
    return res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar comentário.' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

module.exports = { app, hashPassword, signToken };
