-- Conteúdo editorial inicial da EscolaTech. Seguro para executar mais de uma vez.
-- As imagens são fotografias/obras com licença indicada na fonte.

INSERT INTO posts (
  titulo, conteudo, categoria, imagem_url, imagem_alt, imagem_credito,
  imagem_fonte_url, referencia_titulo, referencia_url, usuario_id
)
SELECT
  'Porcentagem sem mistério: como ler descontos e aumentos',
  'Porcentagem significa uma parte em cada cem. Para resolver um problema, transforme a taxa em decimal e multiplique pelo valor de referência. Assim, 25% de 80 é 0,25 × 80 = 20. Em um desconto, subtraímos esse resultado do preço original; em um aumento, somamos.\n\nUma boa estratégia é estimar antes de calcular: 25% é um quarto, então 25% de 80 precisa ser próximo de 20. Essa checagem simples ajuda a perceber erros de sinal ou de vírgula.\n\nDesafio: uma mochila custa R$ 160 e recebe 15% de desconto. Qual é o valor final? Primeiro calcule 0,15 × 160 = 24; depois faça 160 − 24 = R$ 136.',
  'MATEMÁTICA',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Percentage_chalkboard.JPG/1280px-Percentage_chalkboard.JPG',
  'Símbolo de porcentagem escrito em um quadro negro de sala de aula',
  'Feen — CC BY-SA 3.0',
  'https://commons.wikimedia.org/wiki/File:Percentage_chalkboard.JPG',
  'OpenStax: aplicações de porcentagem',
  'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent',
  16
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE titulo = 'Porcentagem sem mistério: como ler descontos e aumentos');

INSERT INTO posts (
  titulo, conteudo, categoria, imagem_url, imagem_alt, imagem_credito,
  imagem_fonte_url, referencia_titulo, referencia_url, usuario_id
)
SELECT
  'Independência do Brasil: uma linha do tempo para entender 1822',
  'A Independência do Brasil foi resultado de um processo político, e não de um único acontecimento. Em 9 de janeiro de 1822, no Dia do Fico, Dom Pedro decidiu permanecer no Brasil diante das pressões das Cortes portuguesas. Nos meses seguintes, José Bonifácio ajudou a organizar o novo governo e a articular a separação.\n\nEm 7 de setembro, às margens do Ipiranga, Dom Pedro proclamou a Independência. A imagem tradicional registra um momento simbólico, mas estudar a sequência — a transferência da corte em 1808, o retorno de Dom João VI e o Dia do Fico — ajuda a compreender as disputas de poder e os grupos envolvidos.\n\nPergunta para a turma: quais mudanças políticas já estavam acontecendo antes do grito do Ipiranga? Monte uma linha do tempo com pelo menos quatro acontecimentos e indique quem participou de cada etapa.',
  'HISTÓRIA',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Independencia_brasil_001.jpg/1280px-Independencia_brasil_001.jpg',
  'A Proclamação da Independência, pintura de François-René Moreaux',
  'François-René Moreaux — domínio público',
  'https://commons.wikimedia.org/wiki/File:Independencia_brasil_001.jpg',
  'Governo Federal: Linha do Tempo da Independência',
  'https://www.gov.br/pt-br/campanhas/bicentenario./linha-do-tempo-da-independencia',
  16
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE titulo = 'Independência do Brasil: uma linha do tempo para entender 1822');

INSERT INTO posts (
  titulo, conteudo, categoria, imagem_url, imagem_alt, imagem_credito,
  imagem_fonte_url, referencia_titulo, referencia_url, usuario_id
)
SELECT
  'Pontuação e sentido: a vírgula também comunica',
  'Pontuar não é apenas fazer uma pausa para respirar. Os sinais organizam as relações entre as ideias e podem mudar a interpretação de uma frase. Compare: “Não, quero ir” e “Não quero ir”. Na primeira, a vírgula introduz uma resposta afirmativa; na segunda, a palavra não nega a ação.\n\nNa revisão de um texto, procure três coisas: se a frase tem uma ideia completa, se a pontuação separa termos que pertencem juntos e se o sinal escolhido combina com o efeito desejado. Leia em voz baixa, mas confirme a regra pela estrutura da oração — a entonação sozinha pode enganar.\n\nExercício: reescreva a frase “Quando terminou a aula a turma saiu” com a pontuação adequada e explique qual informação foi deslocada para o início do período.',
  'PORTUGUÊS',
  'https://upload.wikimedia.org/wikipedia/commons/6/61/Real_Gabinete_Portugu%C3%AAs_de_Leitura_-_Rio_de_Janeiro%2C_Brasil.jpg',
  'Interior do Real Gabinete Português de Leitura, no Rio de Janeiro',
  'Cyro A. Silva — CC BY 2.0',
  'https://commons.wikimedia.org/wiki/File:Real_Gabinete_Portugu%C3%AAs_de_Leitura_-_Rio_de_Janeiro,_Brasil.jpg',
  'Inep: Matriz de Referência de Língua Portuguesa do Saeb',
  'https://download.inep.gov.br/educacao_basica/prova_brasil_saeb/menu_do_professor/o_que_cai_nas_provas/Matriz_de_Referencia_de_Lingua_Portuguesa.pdf',
  16
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE titulo = 'Pontuação e sentido: a vírgula também comunica');

INSERT INTO posts (
  titulo, conteudo, categoria, imagem_url, imagem_alt, imagem_credito,
  imagem_fonte_url, referencia_titulo, referencia_url, usuario_id
)
SELECT
  'Como o DNS encontra um site na internet',
  'Quando digitamos um endereço como escola.tech no navegador, o computador precisa descobrir qual servidor responde por aquele nome. O DNS funciona como uma agenda: traduz o domínio legível para um endereço IP. Primeiro o navegador consulta o cache local; se não encontrar a resposta, a consulta passa por um resolvedor e pelos servidores responsáveis pelo domínio.\n\nEsse processo acontece antes de o navegador pedir o HTML, o CSS ou as imagens. Por isso, um erro de DNS pode impedir o carregamento de uma página mesmo quando o servidor está funcionando. O cache reduz o tempo das próximas consultas, mas também explica por que uma alteração de domínio pode demorar a aparecer para todos.\n\nAtividade: abra as ferramentas de rede do navegador e identifique a primeira requisição feita ao carregar uma página. Depois compare o tempo de resolução DNS com o tempo de download do documento.',
  'INFORMÁTICA',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Computer_Circuit_Board_MOD_45153619.jpg/1280px-Computer_Circuit_Board_MOD_45153619.jpg',
  'Placa de circuito de um computador com chips e componentes eletrônicos',
  'Harland Quarrington / MOD — Open Government Licence 1.0',
  'https://commons.wikimedia.org/wiki/File:Computer_Circuit_Board_MOD_45153619.jpg',
  'Cloudflare: como o DNS funciona',
  'https://developers.cloudflare.com/fundamentals/concepts/how-cloudflare-works/',
  16
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE titulo = 'Como o DNS encontra um site na internet');

INSERT INTO posts (
  titulo, conteudo, categoria, imagem_url, imagem_alt, imagem_credito,
  imagem_fonte_url, referencia_titulo, referencia_url, usuario_id
)
SELECT
  'Teorema de Pitágoras: medindo distâncias com triângulos',
  'O Teorema de Pitágoras relaciona os lados de um triângulo retângulo: a² + b² = c². Os catetos são os lados que formam o ângulo de 90 graus e a hipotenusa é o lado oposto a esse ângulo.\n\nEle aparece em situações bem concretas: descobrir o comprimento de uma escada apoiada na parede, calcular a diagonal de uma tela ou medir a distância entre dois pontos em um mapa cartesiano.\n\nExemplo: se os catetos medem 6 e 8, temos 6² + 8² = 36 + 64 = 100. Portanto, a hipotenusa mede 10. Antes de calcular, desenhe o triângulo e identifique quais medidas são conhecidas.',
  'MATEMÁTICA',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Mathematics_(cryptography)_on_a_blackboard.jpg?width=1280',
  'Quadro negro com cálculos matemáticos escritos em giz',
  'David Malone — CC BY 4.0',
  'https://commons.wikimedia.org/wiki/File:Mathematics_(cryptography)_on_a_blackboard.jpg',
  'OpenStax: trigonometria em triângulos retângulos',
  'https://openstax.org/books/contemporary-mathematics/pages/10-8-right-triangle-trigonometry',
  16
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE titulo = 'Teorema de Pitágoras: medindo distâncias com triângulos');

INSERT INTO posts (
  titulo, conteudo, categoria, imagem_url, imagem_alt, imagem_credito,
  imagem_fonte_url, referencia_titulo, referencia_url, usuario_id
)
SELECT
  'Lei Áurea: o que mudou em 13 de maio de 1888?',
  'A Lei nº 3.353, conhecida como Lei Áurea, foi assinada em 13 de maio de 1888 pela princesa Isabel, então regente do Império. Com apenas dois artigos, ela declarou extinta a escravidão no Brasil.\n\nA lei foi um marco jurídico importante, mas não resolveu por si só as desigualdades criadas por séculos de escravidão. Pessoas recém-libertas não receberam, junto com a liberdade formal, políticas de reparação, terra, moradia, educação ou trabalho garantido.\n\nPara estudar o tema com profundidade, observe o documento, identifique a data, quem o assinou e o que cada artigo determina. Depois, discuta por que a abolição é parte de uma história mais ampla de resistência e luta por direitos.',
  'HISTÓRIA',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lei_Áurea_(Golden_Law).tif?width=1200',
  'Documento histórico da Lei Áurea, de 13 de maio de 1888',
  'Domínio público',
  'https://commons.wikimedia.org/wiki/File:Lei_Áurea_(Golden_Law).tif',
  'Presidência da República: Lei nº 3.353 de 1888',
  'https://legislacao.presidencia.gov.br/atos/?ano=1888&ato=25f0TPn5keVRVT6f8&tipo=LIM%E2%84%96%3D3353',
  16
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE titulo = 'Lei Áurea: o que mudou em 13 de maio de 1888?');

INSERT INTO posts (
  titulo, conteudo, categoria, imagem_url, imagem_alt, imagem_credito,
  imagem_fonte_url, referencia_titulo, referencia_url, usuario_id
)
SELECT
  'Coesão textual: como as ideias se conectam',
  'Um texto coeso guia o leitor de uma ideia à outra. Para isso, usamos recursos como pronomes, repetições intencionais, sinônimos e conectivos. Eles evitam que cada frase pareça isolada.\n\nObserve: “Mariana comprou um livro. Ela começou a leitura no ônibus.” O pronome ela retoma Mariana; sem essa relação, o leitor precisaria descobrir novamente de quem a frase fala. Conectivos também sinalizam relação: “portanto” indica conclusão, “porém” indica contraste e “porque” introduz explicação.\n\nPrática: escolha um parágrafo seu e marque as palavras que retomam pessoas, objetos ou ideias. Em seguida, verifique se há conectivos suficientes para mostrar causa, contraste ou sequência.',
  'PORTUGUÊS',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Real_Gabinete_Português_de_Leitura_-_Rio_de_Janeiro,_Brasil.jpg?width=1000',
  'Fachada do Real Gabinete Português de Leitura, no Rio de Janeiro',
  'Cyro A. Silva — CC BY 2.0',
  'https://commons.wikimedia.org/wiki/File:Real_Gabinete_Portugu%C3%AAs_de_Leitura_-_Rio_de_Janeiro,_Brasil.jpg',
  'MEC: coesão textual e pronomes',
  'https://portaldoprofessor.mec.gov.br/fichaTecnicaAula.html?aula=15269',
  16
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE titulo = 'Coesão textual: como as ideias se conectam');

INSERT INTO posts (
  titulo, conteudo, categoria, imagem_url, imagem_alt, imagem_credito,
  imagem_fonte_url, referencia_titulo, referencia_url, usuario_id
)
SELECT
  'Senhas e autenticação: hábitos simples para proteger contas',
  'Uma senha precisa ser difícil de adivinhar e diferente para cada serviço importante. Informações pessoais, sequências como 123456 e palavras muito conhecidas facilitam tentativas de ataque.\n\nPrefira frases longas, únicas e fáceis de lembrar apenas para você. Um gerenciador de senhas pode ajudar a criar combinações diferentes sem exigir que você memorize todas. Sempre que o serviço oferecer, ative a autenticação em dois fatores: ela adiciona uma segunda confirmação além da senha.\n\nAntes de entrar em uma conta, confira o endereço do site. Links recebidos por mensagem podem imitar páginas conhecidas. Em caso de dúvida, abra o navegador e digite o endereço oficial por conta própria.',
  'INFORMÁTICA',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Cybersecurity.png?width=1280',
  'Cadeado sobre um padrão de circuitos eletrônicos, representando segurança digital',
  'jaydeep_ — CC0',
  'https://commons.wikimedia.org/wiki/File:Cybersecurity.png',
  'CERT.br: Cartilha de Segurança para Internet',
  'https://cartilha.cert.br/livro/cartilha-seguranca-internet.pdf',
  16
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE titulo = 'Senhas e autenticação: hábitos simples para proteger contas');
