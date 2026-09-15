const mockQuery = jest.fn();
const request = require('supertest');

jest.mock('pg', () => ({ Pool: jest.fn(() => ({ query: mockQuery, end: jest.fn() })) }));

const { app, hashPassword, signToken } = require('../src/server');

describe('autenticação de professores', () => {
  beforeEach(() => mockQuery.mockReset());

  it('recusa operações de escrita sem token válido', async () => {
    const response = await request(app).post('/posts').send({ titulo: 'Aula', conteudo: 'Texto' });
    expect(response.statusCode).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('cria post atribuindo autoria ao professor do token', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 22, titulo: 'Aula', conteudo: 'Texto', usuario_id: 7 }] });
    const token = signToken({ sub: 7, tipo: 'professor', exp: Math.floor(Date.now() / 1000) + 60 });
    const response = await request(app).post('/posts').set('Authorization', `Bearer ${token}`).send({ titulo: 'Aula', conteudo: 'Texto', usuario_id: 99 });
    expect(response.statusCode).toBe(201);
    expect(mockQuery.mock.calls[0][1]).toEqual(['Aula', 'Texto', null, null, 7]);
  });

  it('rejeita contas de aluno no login docente', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 4, nome: 'Aluno', email: 'aluno@escola.com', senha: hashPassword('segredo'), tipo: 'aluno' }] });
    const response = await request(app).post('/auth/login').send({ email: 'aluno@escola.com', senha: 'segredo' });
    expect(response.statusCode).toBe(401);
    expect(response.body).not.toHaveProperty('token');
  });

  it('autentica professor com senha armazenada por hash', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 8, nome: 'Professora Ana', email: 'ana@escola.com', senha: hashPassword('segredo'), tipo: 'professor' }] });
    const response = await request(app).post('/auth/login').send({ email: 'ANA@ESCOLA.COM', senha: 'segredo' });
    expect(response.statusCode).toBe(200);
    expect(response.body.usuario).toMatchObject({ id: 8, tipo: 'professor' });
    expect(response.body.token).toEqual(expect.any(String));
  });
});
