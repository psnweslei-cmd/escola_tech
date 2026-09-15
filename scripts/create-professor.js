require('dotenv').config();

const { Pool } = require('pg');
const { hashPassword } = require('../src/server');

async function main() {
  const { TEACHER_NAME: nome, TEACHER_EMAIL: email, TEACHER_PASSWORD: senha } = process.env;
  if (!nome || !email || !senha) {
    throw new Error('Defina TEACHER_NAME, TEACHER_EMAIL e TEACHER_PASSWORD no ambiente antes de executar.');
  }

  const pool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'escolatech_db',
    password: process.env.DB_PASSWORD || 'senha123',
    port: Number(process.env.DB_PORT || 5433),
  });

  try {
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, tipo)
       VALUES ($1, $2, $3, 'professor')
       ON CONFLICT (email) DO UPDATE
       SET nome = EXCLUDED.nome, senha = EXCLUDED.senha, tipo = 'professor'
       RETURNING id, nome, email, tipo`,
      [nome.trim(), email.toLowerCase().trim(), hashPassword(senha)],
    );
    console.log(`Professor pronto: ${result.rows[0].nome} (${result.rows[0].email}).`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
