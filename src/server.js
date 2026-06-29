const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Conexão com o banco de dados no Docker (Porta 5433)
const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'escolatech_db',
  password: 'senha123',
  port: 5433,
});

app.use(express.json());

// Rota inicial de teste
app.get('/', (req, res) => {
  res.send('O Servidor do EscolaTech está ON e conectado ao Postgres!');
});

// =========================================================================
// ROTAS DE POSTS (Alinhadas estritamente com o PDF do Tech Challenge)
// =========================================================================

// REQUISITO: GET /posts/search - Busca de Posts por palavra-chave
app.get('/posts/search', async (req, res) => {
  const { query } = req.query; // Captura a query string (ex: ?query=Node)
  try {
    if (!query) {
      return res.status(400).json({ error: 'É necessário fornecer um termo de busca.' });
    }

    const queryText = `
      SELECT p.id, p.titulo, p.conteudo, p.criado_em, u.nome as autor 
      FROM posts p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.titulo ILIKE $1 OR p.conteudo ILIKE $1
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
      SELECT p.id, p.titulo, p.conteudo, p.criado_em, u.nome as autor 
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
      SELECT p.id, p.titulo, p.conteudo, p.criado_em, u.nome as autor 
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
app.post('/posts', async (req, res) => {
  const { titulo, conteudo, usuario_id } = req.body; // usuario_id representa o autor
  try {
    const queryText = 'INSERT INTO posts (titulo, conteudo, usuario_id) VALUES ($1, $2, $3) RETURNING *';
    const values = [titulo, conteudo, usuario_id];
    const resultado = await pool.query(queryText, values);
    return res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar post.' });
  }
});

// REQUISITO: PUT /posts/:id - Edição de Postagens
app.put('/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, conteudo } = req.body;
  try {
    const queryText = 'UPDATE posts SET titulo = $1, conteudo = $2 WHERE id = $3 RETURNING *';
    const resultado = await pool.query(queryText, [titulo, conteudo, id]);

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
app.delete('/posts/:id', async (req, res) => {
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
  const { nome, email, senha, tipo } = req.body;
  try {
    const queryText = 'INSERT INTO usuarios (nome, email, senha, tipo) VALUES ($1, $2, $3, $4) RETURNING *';
    const resultado = await pool.query(queryText, [nome, email, senha, tipo || 'aluno']);
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

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});