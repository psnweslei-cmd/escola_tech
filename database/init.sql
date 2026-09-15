CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'aluno' CHECK (tipo IN ('aluno', 'professor')),
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  conteudo TEXT NOT NULL,
  categoria VARCHAR(40),
  imagem_url TEXT,
  imagem_alt TEXT,
  imagem_credito TEXT,
  imagem_fonte_url TEXT,
  referencia_titulo TEXT,
  referencia_url TEXT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comentarios (
  id SERIAL PRIMARY KEY,
  conteudo TEXT NOT NULL,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS posts_usuario_id_idx ON posts(usuario_id);
CREATE INDEX IF NOT EXISTS posts_criado_em_idx ON posts(criado_em DESC);
CREATE INDEX IF NOT EXISTS comentarios_post_id_idx ON comentarios(post_id);
