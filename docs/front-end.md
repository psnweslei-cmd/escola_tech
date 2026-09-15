# Documentação do front-end EscolaTech

## Escopo

A interface permite que estudantes encontrem e leiam publicações e que professores autenticados administrem o conteúdo do blog. O front-end foi construído em React com TypeScript; a API existente é consumida por HTTP e permanece fora do escopo deste módulo.

## Arquitetura

`web/main.tsx` monta a aplicação React e o roteador. `web/App.tsx` contém as rotas, componentes de página, estado da sessão e cliente HTTP. `web/styles.css` define a identidade visual, os estados da interface e os ajustes para telas menores.

O componente `AuthContext` compartilha usuário e token entre as páginas. O cliente `request` centraliza cabeçalhos, serialização JSON e tratamento de respostas HTTP. A interface usa componentes funcionais e hooks (`useState`, `useEffect`, `useMemo` e `useContext`).

| Rota | Página | Comportamento |
| --- | --- | --- |
| `/` | Catálogo | Lista posts e envia busca para a API |
| `/posts/:id` | Leitura | Exibe o conteúdo completo e o autor |
| `/login` | Acesso docente | Autentica e guarda a sessão até sua expiração |
| `/admin` | Painel docente | Lista, edita e exclui publicações |
| `/admin/novo` | Nova publicação | Envia título e conteúdo autenticados |
| `/admin/editar/:id` | Edição | Carrega os dados e salva alterações autenticadas |

## Integração com a API

| Operação da interface | Requisição |
| --- | --- |
| Listar publicações | `GET /posts` |
| Buscar | `GET /posts/search?query=...` |
| Ler publicação | `GET /posts/:id` |
| Entrar como professor | `POST /auth/login` |
| Criar publicação | `POST /posts` |
| Editar publicação | `PUT /posts/:id` |
| Excluir publicação | `DELETE /posts/:id` |

Depois do login, a interface envia o token retornado no cabeçalho `Authorization: Bearer <token>` nas operações de escrita. A sessão fica em `localStorage`, mas é descartada no logout, ao abrir o app já expirada, quando vence com o app aberto ou quando uma operação protegida recebe `401`. As rotas de administração também verificam se existe uma sessão antes de renderizar seu conteúdo.

Falhas temporárias ao carregar o catálogo, uma publicação, o painel ou os dados de edição oferecem uma nova tentativa. No painel, uma falha inicial não é apresentada como se o blog estivesse vazio. Durante uma exclusão, as ações ficam bloqueadas até a API responder, evitando envios duplicados.

Em desenvolvimento, o Vite encaminha `/posts`, `/auth` e `/usuarios` para a API local. No Compose, o Nginx serve os arquivos estáticos e encaminha as mesmas rotas HTTP ao serviço da API.

## Responsividade e acessibilidade

O layout usa CSS responsivo com pontos de quebra para telas estreitas. Navegação, formulários, títulos e tabelas mantêm elementos semânticos. Campos têm rótulos, ações podem ser acionadas por teclado e recebem destaque visual ao ganhar foco. Erros e carregamentos são anunciados com `role="alert"` e `role="status"`. A preferência do sistema por movimento reduzido desativa animações e rolagem suave.

## Desenvolvimento e validação

```bash
npm run dev:web
npm run test:web
npm run typecheck:web
npm run build:web
```

`tsconfig.web.json` habilita modo estrito. Os testes em `web/App.test.tsx` cobrem catálogo, busca, leitura, login, criação, edição, exclusão e recuperação de erros, simulando as respostas HTTP. O workflow de CI executa os testes e o build.

## Experiência da equipe

Completem esta seção com o relato real do grupo antes da entrega:

- Como a equipe dividiu as tarefas: **[preencher]**
- Qual foi o principal desafio de integrar a interface à API e como foi resolvido: **[preencher com a experiência do grupo]**
- O que aprenderam sobre TypeScript, React ou acessibilidade: **[preencher]**
- O que fariam diferente numa próxima versão: **[preencher]**

## Limitações conhecidas

- Comentários foram omitidos porque são opcionais no enunciado.
- O front-end depende das rotas e do formato de dados descritos acima.
- O vídeo de apresentação deve ser gravado pela equipe usando o roteiro em [`roteiro-demo.md`](roteiro-demo.md).
