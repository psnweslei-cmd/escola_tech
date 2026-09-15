import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const posts = [
  { id: 1, titulo: 'Aprendendo React', conteudo: 'Uma introdução prática aos componentes e hooks.', autor: 'Ana Souza', criado_em: '2026-09-01T12:00:00.000Z' },
  { id: 2, titulo: 'Ciência no cotidiano', conteudo: 'Observar o mundo também é fazer ciência.', autor: 'Carlos Lima', criado_em: '2026-09-02T12:00:00.000Z' },
];

function jsonResponse(payload: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => payload } as Response;
}

function renderAt(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
}

function saveTeacherSession(expiresInMs = 60_000) {
  localStorage.setItem('escolatech-session', JSON.stringify({
    token: 'token-de-teste',
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
    usuario: { id: 8, nome: 'Ana Souza', email: 'ana@escola.com', tipo: 'professor' },
  }));
}

describe('interface EscolaTech', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('exibe as publicações recebidas da API', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(posts));
    renderAt('/');

    expect(await screen.findByRole('heading', { name: 'Aprendendo React' })).toBeTruthy();
    expect(screen.getByText('Ana Souza')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Ciência no cotidiano' })).toBeTruthy();
    expect(document.querySelector('time')?.getAttribute('datetime')).toBe(posts[0].criado_em);
  });

  it('exibe imagem real e categoria da publicação recebida da API', async () => {
    const postWithImage = {
      ...posts[0],
      categoria: 'Matemática',
      imagem_url: 'https://upload.wikimedia.org/math.jpg',
      imagem_alt: 'Equações no quadro',
    };
    fetchMock.mockResolvedValueOnce(jsonResponse([postWithImage]));
    renderAt('/');

    expect((await screen.findByRole('img', { name: 'Equações no quadro' })).getAttribute('src')).toBe(postWithImage.imagem_url);
    expect(screen.getByText('Matemática')).toBeTruthy();
  });

  it('envia a busca à API e mostra os resultados', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(posts));
    fetchMock.mockResolvedValueOnce(jsonResponse([posts[0]]));
    const user = userEvent.setup();
    renderAt('/');
    await screen.findByRole('heading', { name: 'Aprendendo React' });

    await user.type(screen.getByRole('textbox', { name: 'O QUE VOCÊ QUER DESCOBRIR?' }), 'React');
    await user.click(screen.getByRole('button', { name: 'Buscar publicações' }));

    expect(await screen.findByText('RESULTADOS PARA “React”')).toBeTruthy();
    expect(fetchMock.mock.calls[1][0]).toBe('/posts/search?query=React');
    expect(screen.queryByRole('heading', { name: 'Ciência no cotidiano' })).toBeNull();
  });

  it('permite alcançar o campo e o botão de busca pelo teclado', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(posts));
    const user = userEvent.setup();
    renderAt('/');

    const searchInput = await screen.findByRole('textbox', { name: 'O QUE VOCÊ QUER DESCOBRIR?' });
    for (let index = 0; index < 10 && document.activeElement !== searchInput; index += 1) {
      await user.tab();
    }
    expect(document.activeElement).toBe(searchInput);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Buscar publicações' }));
  });

  it('repete a carga da lista sem trocar a busca após uma falha', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Falha de conexão'));
    fetchMock.mockResolvedValueOnce(jsonResponse(posts));
    const user = userEvent.setup();
    renderAt('/');

    expect(await screen.findByText('Falha de conexão')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('heading', { name: 'Aprendendo React' })).toBeTruthy();
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/posts', '/posts']);
  });

  it('mostra a leitura completa de uma publicação', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(posts[1]));
    renderAt('/posts/2');

    expect(await screen.findByRole('heading', { name: 'Ciência no cotidiano' })).toBeTruthy();
    expect(screen.getByText('Observar o mundo também é fazer ciência.')).toBeTruthy();
    expect(screen.getByText('Carlos Lima')).toBeTruthy();
    expect(document.querySelector('time')?.getAttribute('datetime')).toBe(posts[1].criado_em);
  });

  it('permite tentar novamente ao falhar a leitura de uma publicação', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Falha de conexão'));
    fetchMock.mockResolvedValueOnce(jsonResponse(posts[1]));
    const user = userEvent.setup();
    renderAt('/posts/2');

    expect(await screen.findByText('Falha de conexão')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'Ciência no cotidiano' })).toBeTruthy();
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/posts/2', '/posts/2']);
  });

  it('redireciona a área protegida para o login', async () => {
    renderAt('/admin');
    expect(await screen.findByRole('heading', { name: 'A sala é sua.' })).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('informa credenciais recusadas sem criar uma sessão', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'E-mail ou senha inválidos.' }, 401));
    const user = userEvent.setup();
    renderAt('/login');

    await user.type(screen.getByRole('textbox', { name: 'E-mail' }), 'ana@escola.com');
    await user.type(screen.getByLabelText('Senha'), 'senha-incorreta');
    await user.click(screen.getByRole('button', { name: 'Entrar na área docente' }));

    expect(await screen.findByText('E-mail ou senha inválidos.')).toBeTruthy();
    expect(localStorage.getItem('escolatech-session')).toBeNull();
    expect(screen.getByRole('heading', { name: 'A sala é sua.' })).toBeTruthy();
  });

  it('encerra a sessão e volta ao login ao sair do painel', async () => {
    saveTeacherSession();
    fetchMock.mockResolvedValueOnce(jsonResponse(posts));
    const user = userEvent.setup();
    renderAt('/admin');

    expect(await screen.findByRole('heading', { name: 'Bom dia, Ana.' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(await screen.findByRole('heading', { name: 'A sala é sua.' })).toBeTruthy();
    expect(localStorage.getItem('escolatech-session')).toBeNull();
  });

  it('encerra a sessão se a API recusar o token durante uma operação protegida', async () => {
    saveTeacherSession();
    fetchMock.mockResolvedValueOnce(jsonResponse(posts));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Token inválido.' }, 401));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    renderAt('/admin');

    await screen.findByRole('heading', { name: 'Suas publicações' });
    await user.click(screen.getByRole('button', { name: 'Excluir Aprendendo React' }));

    expect(await screen.findByRole('heading', { name: 'A sala é sua.' })).toBeTruthy();
    expect(localStorage.getItem('escolatech-session')).toBeNull();
    expect(fetchMock.mock.calls[1][1]?.headers.Authorization).toBe('Bearer token-de-teste');
  });

  it('remove uma sessão expirada e redireciona o painel aberto para o login', async () => {
    vi.useFakeTimers();
    try {
      saveTeacherSession(1_000);
      fetchMock.mockResolvedValueOnce(jsonResponse(posts));
      renderAt('/admin');

      expect(screen.getByRole('heading', { name: 'Bom dia, Ana.' })).toBeTruthy();
      await act(async () => { await vi.advanceTimersByTimeAsync(1_001); });

      expect(screen.getByRole('heading', { name: 'A sala é sua.' })).toBeTruthy();
      expect(localStorage.getItem('escolatech-session')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('limpa do armazenamento uma sessão que já expirou antes da abertura', async () => {
    saveTeacherSession(-1_000);
    renderAt('/admin');

    expect(await screen.findByRole('heading', { name: 'A sala é sua.' })).toBeTruthy();
    expect(localStorage.getItem('escolatech-session')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('permite recarregar a lista do painel depois de uma falha', async () => {
    saveTeacherSession();
    fetchMock.mockRejectedValueOnce(new Error('Falha de conexão'));
    fetchMock.mockResolvedValueOnce(jsonResponse(posts));
    const user = userEvent.setup();
    renderAt('/admin');

    expect(await screen.findByText('Falha de conexão')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Seu primeiro texto começa aqui' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Atualizar lista' }));

    expect(await screen.findByRole('link', { name: 'Aprendendo React' })).toBeTruthy();
  });

  it('permite que uma professora entre e veja o painel', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      token: 'token-de-teste',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      usuario: { id: 8, nome: 'Ana Souza', email: 'ana@escola.com', tipo: 'professor' },
    }));
    fetchMock.mockResolvedValueOnce(jsonResponse(posts));
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 3, titulo: 'Aula nova', conteudo: 'Texto novo' }, 201));
    fetchMock.mockResolvedValueOnce(jsonResponse([...posts, { id: 3, titulo: 'Aula nova', conteudo: 'Texto novo', autor: 'Ana Souza' }]));
    const user = userEvent.setup();
    renderAt('/login');

    await user.type(screen.getByRole('textbox', { name: 'E-mail' }), 'ana@escola.com');
    await user.type(screen.getByLabelText('Senha'), 'senha-forte');
    await user.click(screen.getByRole('button', { name: 'Entrar na área docente' }));

    expect(await screen.findByRole('heading', { name: 'Bom dia, Ana.' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Nova publicação/i })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('escolatech-session') || 'null').token).toBe('token-de-teste');

    await user.click(screen.getByRole('link', { name: /Nova publicação/i }));
    const authorInput = screen.getByRole('textbox', { name: 'Autor' }) as HTMLInputElement;
    expect(authorInput.value).toBe('Ana Souza');
    expect(authorInput.readOnly).toBe(true);
    await user.type(screen.getByRole('textbox', { name: 'Título da publicação' }), 'Aula nova');
    await user.type(screen.getByRole('textbox', { name: 'Conteúdo' }), 'Texto novo');
    await user.click(screen.getByRole('button', { name: 'Publicar agora' }));
    expect(await screen.findByRole('heading', { name: 'Bom dia, Ana.' })).toBeTruthy();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    const createRequest = fetchMock.mock.calls.find(([url, options]) => url === '/posts' && options?.method === 'POST');
    expect(createRequest?.[1]?.headers.Authorization).toBe('Bearer token-de-teste');
  });

  it('carrega dados existentes e salva a edição com autenticação', async () => {
    saveTeacherSession();
    fetchMock.mockResolvedValueOnce(jsonResponse(posts));
    fetchMock.mockResolvedValueOnce(jsonResponse(posts[0]));
    fetchMock.mockResolvedValueOnce(jsonResponse({ ...posts[0], titulo: 'React atualizado' }));
    fetchMock.mockResolvedValueOnce(jsonResponse([{ ...posts[0], titulo: 'React atualizado' }, posts[1]]));
    const user = userEvent.setup();
    renderAt('/admin');
    await screen.findByRole('heading', { name: 'Suas publicações' });
    await user.click(screen.getByRole('link', { name: 'Editar Aprendendo React' }));
    const titleInput = await screen.findByRole('textbox', { name: 'Título da publicação' });
    expect((titleInput as HTMLInputElement).value).toBe('Aprendendo React');
    await user.clear(titleInput);
    await user.type(titleInput, 'React atualizado');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByRole('link', { name: 'React atualizado' })).toBeTruthy();
    const updateRequest = fetchMock.mock.calls.find(([url, options]) => url === '/posts/1' && options?.method === 'PUT');
    expect(updateRequest?.[1]?.headers.Authorization).toBe('Bearer token-de-teste');
    expect(JSON.parse(updateRequest?.[1]?.body as string)).toMatchObject({ titulo: 'React atualizado' });
  });

  it('mostra erro claro quando a publicação de edição não existe', async () => {
    saveTeacherSession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Post não encontrado.' }, 404));
    renderAt('/admin/editar/999');

    expect(await screen.findByText('Post não encontrado.')).toBeTruthy();
    expect(screen.getByRole('link', { name: '← Voltar ao painel' })).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'Título da publicação' })).toBeNull();
  });

  it('permite tentar novamente ao falhar o carregamento da edição', async () => {
    saveTeacherSession();
    fetchMock.mockRejectedValueOnce(new Error('Falha de conexão'));
    fetchMock.mockResolvedValueOnce(jsonResponse(posts[0]));
    const user = userEvent.setup();
    renderAt('/admin/editar/1');

    expect(await screen.findByText('Falha de conexão')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    const titleInput = await screen.findByRole('textbox', { name: 'Título da publicação' });
    expect((titleInput as HTMLInputElement).value).toBe('Aprendendo React');
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/posts/1', '/posts/1']);
  });

  it('exclui uma publicação após confirmação', async () => {
    saveTeacherSession();
    fetchMock.mockResolvedValueOnce(jsonResponse(posts));
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204));
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    renderAt('/admin');
    await screen.findByRole('heading', { name: 'Suas publicações' });
    await user.click(screen.getByRole('button', { name: 'Excluir Aprendendo React' }));

    await waitFor(() => expect(screen.queryByRole('link', { name: 'Aprendendo React' })).toBeNull());
    expect(confirm).toHaveBeenCalledOnce();
    const deleteRequest = fetchMock.mock.calls.find(([url, options]) => url === '/posts/1' && options?.method === 'DELETE');
    expect(deleteRequest?.[1]?.headers.Authorization).toBe('Bearer token-de-teste');
  });

  it('bloqueia exclusões duplicadas enquanto a primeira está pendente', async () => {
    saveTeacherSession();
    fetchMock.mockResolvedValueOnce(jsonResponse(posts));
    let finishDelete!: (response: Response) => void;
    const pendingDelete = new Promise<Response>((resolve) => { finishDelete = resolve; });
    fetchMock.mockReturnValueOnce(pendingDelete);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    renderAt('/admin');

    await screen.findByRole('heading', { name: 'Suas publicações' });
    const deleteButton = screen.getByRole('button', { name: 'Excluir Aprendendo React' });
    await user.click(deleteButton);

    expect((deleteButton as HTMLButtonElement).disabled).toBe(true);
    expect(deleteButton.textContent).toContain('Excluindo');
    await user.click(deleteButton);
    expect(confirm).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => { finishDelete(jsonResponse(null, 204)); });
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Aprendendo React' })).toBeNull());
  });
});
