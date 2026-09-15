const mockQuery = jest.fn();
const request = require('supertest');

jest.mock('pg', () => ({ Pool: jest.fn(() => ({ query: mockQuery, end: jest.fn() })) }));

const { app, signToken } = require('../src/server');

describe('API de postagens', () => {
  beforeEach(() => mockQuery.mockReset());

  it('lista posts recentes', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, titulo: 'Introdução ao React', autor: 'Professora Ana' }] });
    const response = await request(app).get('/posts');
    expect(response.statusCode).toBe(200);
    expect(response.body[0]).toMatchObject({ id: 1, titulo: 'Introdução ao React' });
  });

  it('busca posts por palavra-chave', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 2, titulo: 'Aprendendo Docker' }] });
    const response = await request(app).get('/posts/search?query=Docker');
    expect(response.statusCode).toBe(200);
    expect(response.body[0].titulo).toContain('Docker');
    expect(mockQuery.mock.calls[0][1]).toEqual(['%Docker%']);
  });

  it('retorna erro 400 para uma busca vazia', async () => {
    const response = await request(app).get('/posts/search');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('cria um post usando a identidade do professor autenticado', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 3, titulo: 'Primeira aula', usuario_id: 12 }] });
    const token = signToken({ sub: 12, tipo: 'professor', exp: Math.floor(Date.now() / 1000) + 60 });
    const response = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Primeira aula', conteudo: 'Conteúdo', usuario_id: 999 });
    expect(response.statusCode).toBe(201);
    expect(mockQuery.mock.calls[0][1]).toEqual(['Primeira aula', 'Conteúdo', null, null, 12]);
  });

  it('cria um post com imagem enviada pelo editor', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 4, titulo: 'Aula ilustrada', imagem_url: 'data:image/png;base64,abc' }] });
    const token = signToken({ sub: 12, tipo: 'professor', exp: Math.floor(Date.now() / 1000) + 60 });
    const response = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Aula ilustrada', conteudo: 'Conteúdo', imagem_url: 'data:image/png;base64,abc', imagem_alt: 'Ilustração da aula' });
    expect(response.statusCode).toBe(201);
    expect(mockQuery.mock.calls[0][1]).toEqual(['Aula ilustrada', 'Conteúdo', 'data:image/png;base64,abc', 'Ilustração da aula', 12]);
  });
});
