import { createContext, useContext, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';

interface Professor {
  id: number;
  nome: string;
  email: string;
  tipo: 'professor';
}

interface Session {
  token: string;
  expiresAt: string;
  usuario: Professor;
}

interface AuthContextValue {
  user: Professor | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

interface Post {
  id: number;
  titulo: string;
  conteudo: string;
  criado_em?: string;
  autor?: string;
  categoria?: string | null;
  imagem_url?: string | null;
  imagem_alt?: string | null;
  imagem_credito?: string | null;
  imagem_fonte_url?: string | null;
  referencia_titulo?: string | null;
  referencia_url?: string | null;
}

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  token?: string | null;
  onUnauthorized?: () => void;
  headers?: Record<string, string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AuthProvider = AuthContext.Provider;
const API = import.meta.env.VITE_API_URL || '';
const SESSION_KEY = 'escolatech-session';

function readSavedSession(): Session | null {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as Session | null;
    const expiresAt = saved?.expiresAt ? Date.parse(saved.expiresAt) : Number.NaN;
    if (saved?.token && saved.usuario && Number.isFinite(expiresAt) && expiresAt > Date.now()) return saved;
  } catch {
    // Uma sessão inválida deve ser descartada abaixo.
  }
  localStorage.removeItem(SESSION_KEY);
  return null;
}

function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa ser usado dentro do provedor de autenticação.');
  return context;
}

async function request<T = unknown>(path: string, { token, onUnauthorized, ...options }: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null as T;
  if (response.status === 401 && token) onUnauthorized?.();
  const data = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || 'Não foi possível completar a solicitação.');
  return data;
}

function excerpt(text = '', limit = 160): string {
  const plain = text.replace(/\s+/g, ' ').trim();
  return plain.length > limit ? `${plain.slice(0, limit).trimEnd()}…` : plain;
}

function dateLabel(value?: string | null): string {
  if (!value) return 'Publicação recente';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Publicação recente' : new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="EscolaTech, página inicial">
          <span className="brand-mark" aria-hidden="true">e<span>.</span></span>
          <span>escola<span className="brand-light">tech</span></span>
        </Link>
        <nav className="main-nav" aria-label="Navegação principal">
          <Link to="/">Explorar</Link>
          {user ? <Link to="/admin">Painel docente</Link> : <Link className="nav-login" to="/login">Área do professor <span aria-hidden="true">↗</span></Link>}
          {user && <button className="logout-button" onClick={logout}>Sair</button>}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return <footer className="site-footer"><Link className="footer-brand" to="/">escola<span>tech</span></Link><span>Aprender é uma jornada compartilhada.</span><span>© {new Date().getFullYear()} EscolaTech</span></footer>;
}

function Layout({ children }: { children: ReactNode }) { return <><Header /><main>{children}</main><Footer /></>; }

function Loading({ label = 'Carregando conteúdos…' }) { return <div className="status-block" role="status"><span className="spinner" />{label}</div>; }

function ErrorMessage({ children }: { children: ReactNode }) { return <p className="form-error" role="alert">{children}</p>; }

function EmptyState({ search }: { search: boolean }) {
  return <div className="empty-state"><span className="empty-icon">⌕</span><h3>{search ? 'Nenhum resultado por aqui' : 'A conversa começa com você'}</h3><p>{search ? 'Tente outra palavra ou expressão.' : 'Ainda não há publicações. Volte em breve para descobrir novas ideias.'}</p></div>;
}

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo de imagem.'));
    reader.readAsDataURL(file);
  });
}

function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const palettes = ['tile-lilac', 'tile-peach', 'tile-mint', 'tile-yellow'];
  return (
    <article className="post-card">
      <Link className={`post-art ${palettes[index % palettes.length]}`} to={`/posts/${post.id}`} aria-label={`Ler ${post.titulo}`}>
        {post.imagem_url && <img className="post-photo" src={post.imagem_url} alt={post.imagem_alt || post.titulo} loading="lazy" />}
        <span className="art-eyebrow">{post.categoria || `CADERNO ${String(index + 1).padStart(2, '0')}`}</span>
        {!post.imagem_url && <span className="art-glyph" aria-hidden="true">{['✳', '◒', '⌘', '✦'][index % 4]}</span>}
        <span className="art-arrow" aria-hidden="true">↗</span>
      </Link>
      <div className="post-meta"><span>{post.autor || 'Equipe EscolaTech'}</span><span aria-hidden="true">·</span><time dateTime={post.criado_em || undefined}>{dateLabel(post.criado_em)}</time></div>
      <h3 className="post-title"><Link to={`/posts/${post.id}`}>{post.titulo}</Link></h3>
      <p className="post-excerpt">{excerpt(post.conteudo, 145)}</p>
      <Link className="read-link" to={`/posts/${post.id}`}>Continuar lendo <span aria-hidden="true">↗</span></Link>
    </article>
  );
}

function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const path = submittedQuery ? `/posts/search?query=${encodeURIComponent(submittedQuery)}` : '/posts';
    request<Post[]>(path).then((data) => { if (active) setPosts(data); }).catch((err: Error) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [submittedQuery, refreshKey]);

  function submitSearch(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmittedQuery(query.trim()); }

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> UM ESPAÇO DE IDEIAS</span>
            <h1>Conhecimento<br />bom é <em>conhecimento</em><br />compartilhado.</h1>
            <p>Histórias, aulas e descobertas de quem acredita que aprender transforma tudo.</p>
            <a className="hero-link" href="#publicacoes">Explore as publicações <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-illustration" aria-hidden="true">
            <div className="sun-shape" />
            <div className="book book-back"><span>ideias</span></div>
            <div className="book book-front"><span>aprender<br />é crescer</span><i>✳</i></div>
            <span className="orbit orbit-one">✳</span><span className="orbit orbit-two">✦</span>
            <span className="hero-note">uma página<br />de cada vez</span>
          </div>
          <div className="hero-index"><span>01</span><span className="index-line" /><span>APRENDER<br />JUNTOS</span></div>
        </div>
        <div className="hero-bottom"><span>IDEIAS QUE ENSINAM</span><span className="hero-bottom-line" /><span>FEITO PARA APRENDER EM COMUNIDADE</span></div>
      </section>

      <section className="posts-section" id="publicacoes">
        <div className="section-heading">
          <div><span className="eyebrow section-eyebrow">O BLOG DA ESCOLA</span><h2>Ideias em movimento<span>.</span></h2></div>
          <p>Conteúdo feito por quem ensina,<br className="desktop-break" /> para quem quer ir mais longe.</p>
        </div>
        <form className="search-form" onSubmit={submitSearch} role="search">
          <label className="search-label" htmlFor="post-search">O QUE VOCÊ QUER DESCOBRIR?</label>
          <div className="search-control"><span className="search-icon" aria-hidden="true">⌕</span><input id="post-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por assunto, aula ou palavra-chave" /><button type="submit" aria-label="Buscar publicações">Buscar <span aria-hidden="true">↗</span></button></div>
        </form>
        <div className="results-line"><span>{submittedQuery ? `RESULTADOS PARA “${submittedQuery}”` : 'PUBLICAÇÕES RECENTES'}</span><span>{posts.length} {posts.length === 1 ? 'ARTIGO' : 'ARTIGOS'}</span></div>
        {loading ? <Loading /> : error ? <div className="inline-error" role="alert">{error}<button onClick={() => setRefreshKey((value) => value + 1)}>Tentar novamente</button></div> : posts.length === 0 ? <EmptyState search={Boolean(submittedQuery)} /> : <div className="posts-grid">{posts.map((post, index) => <PostCard key={post.id} post={post} index={index} />)}</div>}
      </section>
      <section className="closing-banner"><div className="closing-star">✳</div><div><span className="eyebrow">CONHECIMENTO CRESCE QUANDO CIRCULA</span><h2>Uma boa ideia<br />sempre encontra<br /><em>uma próxima página.</em></h2></div><Link to="/login" className="closing-link">Você ensina? Publique aqui <span aria-hidden="true">↗</span></Link></section>
    </>
  );
}

function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setPost(null);
    request<Post>(`/posts/${id}`).then((data) => { if (active) setPost(data); }).catch((err: Error) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, retryKey]);
  if (loading) return <Loading label="Abrindo publicação…" />;
  if (error) return <section className="article-wrap"><div className="inline-error" role="alert"><span>{error}</span><button type="button" onClick={() => setRetryKey((value) => value + 1)}>Tentar novamente</button></div><Link className="back-link" to="/">← Voltar às publicações</Link></section>;
  if (!post) return <NotFound />;
  return <article className="article-wrap"><Link className="back-link" to="/">← Todas as publicações</Link><div className="article-kicker"><span>{post.categoria || 'ESCOLATECH · BLOG'}</span><time dateTime={post.criado_em || undefined}>{dateLabel(post.criado_em)}</time></div><h1>{post.titulo}</h1><p className="article-author">Por <strong>{post.autor || 'Equipe EscolaTech'}</strong></p><figure className="article-figure"><div className={`article-cover${post.imagem_url ? ' article-cover-photo' : ''}`}>{post.imagem_url ? <img src={post.imagem_url} alt={post.imagem_alt || post.titulo} /> : <><span className="article-cover-star">✳</span><span>IDEIAS<br />EM MOVIMENTO</span><span className="article-cover-index">ET · {String(post.id).padStart(2, '0')}</span></>}</div>{post.imagem_credito && <figcaption>Imagem: {post.imagem_fonte_url ? <a href={post.imagem_fonte_url} target="_blank" rel="noreferrer">{post.imagem_credito}</a> : post.imagem_credito}</figcaption>}</figure><div className="article-body">{post.conteudo.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>{post.referencia_url && <aside className="article-reference"><span>PARA APROFUNDAR</span><a href={post.referencia_url} target="_blank" rel="noreferrer">{post.referencia_titulo || 'Material de referência'} ↗</a></aside>}<div className="article-end"><span>FIM DA PUBLICAÇÃO</span><Link to="/">Continue explorando ↗</Link></div></article>;
}

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/admin" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true);
    try { await login(email, senha); navigate('/admin'); } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  }
  return <section className="login-page"><div className="login-aside"><span className="eyebrow">ESPAÇO DE QUEM ENSINA</span><div className="login-aside-art"><span>✳</span><span>ideias<br />que ficam</span><i>ET.</i></div><p>Seu conhecimento merece<br />um lugar para crescer.</p></div><div className="login-panel"><Link className="back-link" to="/">← Voltar ao blog</Link><span className="eyebrow section-eyebrow">BEM-VINDO DE VOLTA</span><h1>A sala é sua<span>.</span></h1><p className="login-intro">Entre com sua conta docente para compartilhar novas ideias.</p><form className="editor-form login-form" onSubmit={submit}><label>E-mail<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@escola.com" /></label><label>Senha<input type="password" autoComplete="current-password" required value={senha} onChange={(event) => setSenha(event.target.value)} placeholder="Sua senha" /></label>{error && <ErrorMessage>{error}</ErrorMessage>}<button className="primary-button" disabled={loading}>{loading ? 'Entrando…' : 'Entrar na área docente'} <span aria-hidden="true">↗</span></button></form><p className="login-footnote">Acesso exclusivo para professores cadastrados.</p></div></section>;
}

function ProtectedRoute({ children }: { children: ReactNode }) { const { user } = useAuth(); return user ? children : <Navigate to="/login" replace />; }

function AdminPage() {
  const { user, token, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);
  async function loadPosts() { setError(''); setLoading(true); try { setPosts(await request<Post[]>('/posts')); } catch (err) { setError((err as Error).message); } finally { setLoading(false); } }
  useEffect(() => { loadPosts(); }, []);
  async function remove(post: Post) {
    if (!window.confirm(`Excluir “${post.titulo}”? Esta ação não pode ser desfeita.`)) return;
    setError('');
    setNotice('');
    setRemovingId(post.id);
    try { await request(`/posts/${post.id}`, { method: 'DELETE', token, onUnauthorized: logout }); setPosts((current) => current.filter((item) => item.id !== post.id)); setNotice('Publicação excluída.'); } catch (err) { setError((err as Error).message); } finally { setRemovingId(null); }
  }
  if (!user || !token) return <Navigate to="/login" replace />;
  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <span className="eyebrow section-eyebrow">ESPAÇO DOCENTE</span>
          <h1>Bom dia, {user.nome.split(' ')[0]}<span>.</span></h1>
          <p>Organize suas ideias e mantenha o blog em movimento.</p>
        </div>
        <Link className="primary-button new-post-button" to="/admin/novo">Nova publicação <span aria-hidden="true">＋</span></Link>
      </div>

      <div className="admin-stats">
        <div><span>PUBLICAÇÕES NO BLOG</span><strong>{loading ? '—' : posts.length.toString().padStart(2, '0')}</strong></div>
        <div><span>SEU ESPAÇO DE ENSINO</span><strong>{user.tipo === 'professor' ? 'ATIVO' : '—'}</strong></div>
        <div><span>ACESSO</span><strong>PROFESSOR</strong></div>
      </div>

      <div className="admin-list-heading">
        <div><span className="eyebrow section-eyebrow">BIBLIOTECA</span><h2>Suas publicações</h2></div>
        <span>{posts.length} ITENS</span>
      </div>

      {notice && <p className="success-message" role="status">{notice}</p>}
      {error && <div className="inline-error" role="alert"><span>{error}</span><button type="button" onClick={loadPosts}>Atualizar lista</button></div>}

      {loading ? <Loading /> : error && posts.length === 0 ? null : posts.length === 0 ? (
        <div className="empty-state admin-empty">
          <span className="empty-icon">✳</span>
          <h3>Seu primeiro texto começa aqui</h3>
          <p>Compartilhe uma aula, uma descoberta ou uma ideia.</p>
          <Link className="read-link" to="/admin/novo">Criar publicação ↗</Link>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>PUBLICAÇÃO</th><th>AUTOR</th><th>DATA</th><th>AÇÕES</th></tr></thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link className="admin-post-title" to={`/posts/${post.id}`}>{post.titulo}</Link>
                    <span className="admin-post-excerpt">{excerpt(post.conteudo, 82)}</span>
                  </td>
                  <td>{post.autor || user.nome}</td>
                  <td>{dateLabel(post.criado_em)}</td>
                  <td>
                    <div className="table-actions">
                      <Link aria-label={`Editar ${post.titulo}`} title="Editar" to={`/admin/editar/${post.id}`}>Editar</Link>
                      <button aria-label={`Excluir ${post.titulo}`} disabled={removingId !== null} onClick={() => remove(post)}>
                        {removingId === post.id ? 'Excluindo…' : 'Excluir'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PostEditorPage({ edit = false }: { edit?: boolean }) {
  const { id } = useParams();
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [retryKey, setRetryKey] = useState(0);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [imagemAlt, setImagemAlt] = useState('');
  const [loading, setLoading] = useState(edit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    if (!edit) return;
    let active = true;
    setLoading(true);
    setLoadError('');
    setTitulo('');
    setConteudo('');
    setImagemUrl('');
    setImagemAlt('');
    request<Post>(`/posts/${id}`).then((post) => { if (active) { setTitulo(post.titulo); setConteudo(post.conteudo); setImagemUrl(post.imagem_url || ''); setImagemAlt(post.imagem_alt || ''); } }).catch((err: Error) => { if (active) setLoadError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [edit, id, retryKey]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    try { await request(edit ? `/posts/${id}` : '/posts', { method: edit ? 'PUT' : 'POST', token, onUnauthorized: logout, body: JSON.stringify({ titulo, conteudo, imagem_url: imagemUrl || null, imagem_alt: imagemAlt.trim() || null }) }); navigate('/admin'); } catch (err) { setError((err as Error).message); } finally { setSaving(false); }
  }
  if (loading) return <Loading label="Carregando publicação…" />;
  if (loadError) return <section className="editor-page"><div className="inline-error" role="alert"><span>{loadError}</span><button type="button" onClick={() => setRetryKey((value) => value + 1)}>Tentar novamente</button></div><Link className="back-link" to="/admin">← Voltar ao painel</Link></section>;
  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) { setError('Escolha uma imagem PNG, JPG, WEBP ou GIF.'); return; }
    if (file.size > 6 * 1024 * 1024) { setError('A imagem deve ter no máximo 6 MB.'); return; }
    try { setError(''); setImagemUrl(await readImageFile(file)); } catch (err) { setError((err as Error).message); }
  }
  return <section className="editor-page"><Link className="back-link" to="/admin">← Voltar ao painel</Link><span className="eyebrow section-eyebrow">{edit ? 'EDITAR PUBLICAÇÃO' : 'NOVA PUBLICAÇÃO'}</span><h1>{edit ? 'Ajuste sua ideia' : 'O que vamos compartilhar'}<span>?</span></h1><p className="editor-intro">Escreva com clareza. Uma boa aula pode começar por aqui.</p><form className="editor-form" onSubmit={submit}><label>Autor<input value={user?.nome || ''} readOnly /></label><label>Título da publicação<input required maxLength={150} value={titulo} onChange={(event) => setTitulo(event.target.value)} placeholder="Ex.: Aprendendo a pensar como cientista" /></label><div className="field-note">{titulo.length}/150 caracteres</div><label>Conteúdo<textarea required rows={12} value={conteudo} onChange={(event) => setConteudo(event.target.value)} placeholder="Conte sua ideia, organize os parágrafos e inspire quem está aprendendo…" /></label><label>Imagem da publicação<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageChange} /><span className="field-help">PNG, JPG, WEBP ou GIF — até 6 MB.</span></label>{imagemUrl && <div className="image-preview"><img src={imagemUrl} alt="Prévia da imagem selecionada" /><button type="button" onClick={() => setImagemUrl('')}>Remover imagem</button></div>}<label>Texto alternativo<input maxLength={250} value={imagemAlt} onChange={(event) => setImagemAlt(event.target.value)} placeholder="Descreva a imagem para quem usa leitor de tela" /></label><div className="editor-footer">{error ? <ErrorMessage>{error}</ErrorMessage> : <span>Você poderá editar esta publicação depois.</span>}<button className="primary-button" disabled={saving}>{saving ? 'Salvando…' : edit ? 'Salvar alterações' : 'Publicar agora'} <span aria-hidden="true">↗</span></button></div></form></section>;
}

function NotFound() { return <section className="empty-state not-found"><span className="eyebrow section-eyebrow">PÁGINA NÃO ENCONTRADA</span><h1>Essa página ainda não foi escrita<span>.</span></h1><Link className="read-link" to="/">Voltar ao início ↗</Link></section>; }

export default function App() {
  const [session, setSession] = useState<Session | null>(readSavedSession);
  useEffect(() => {
    if (!session) return;

    const expiresAt = session.expiresAt;
    let timeout = 0;
    function expireWhenDue() {
      const remaining = Date.parse(expiresAt) - Date.now();
      if (!Number.isFinite(remaining) || remaining <= 0) {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
        return;
      }
      timeout = window.setTimeout(expireWhenDue, Math.min(remaining, 2_147_483_647));
    }

    expireWhenDue();
    return () => window.clearTimeout(timeout);
  }, [session]);
  const auth = useMemo(() => ({
    user: session?.usuario || null,
    token: session?.token || null,
    async login(email: string, senha: string) { const next = await request<Session>('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }); localStorage.setItem(SESSION_KEY, JSON.stringify(next)); setSession(next); },
    logout() { localStorage.removeItem(SESSION_KEY); setSession(null); },
  }), [session]);
  return <AuthProvider value={auth}><Layout><Routes><Route path="/" element={<HomePage />} /><Route path="/posts/:id" element={<PostPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} /><Route path="/admin/novo" element={<ProtectedRoute><PostEditorPage /></ProtectedRoute>} /><Route path="/admin/editar/:id" element={<ProtectedRoute><PostEditorPage edit /></ProtectedRoute>} /><Route path="*" element={<NotFound />} /></Routes></Layout></AuthProvider>;
}
