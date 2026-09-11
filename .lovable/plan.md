# Plano: completar o site sem trabalho manual

## Contexto atual (verificado)
- A **home** mostra cursos e oportunidades **falsos** (dados fixos em `src/lib/site-data.ts`), não o banco real. A barra de busca da home não funciona.
- As páginas de **vagas, concursos e estágio** já puxam do banco, mas o banco tem **0 oportunidades publicadas** e **0 modelos de currículo** — então aparecem vazias.
- A página **Conteúdos/Dicas** é só um conjunto de cards estáticos: não tem texto de artigo, não tem página de leitura, não tem tabela no banco e nem gestão no painel admin.
- O **Painel do aluno** (`/painel`) usa a tabela antiga `user_courses` (com nome do curso em texto e status manual), enquanto a página **Meus cursos** usa o sistema novo de `enrollments` com progresso real. São dois sistemas diferentes convivendo.

## O que vou fazer

### Fase 1 — Home conectada ao banco real
- Trocar as seções "Cursos em destaque" e "Oportunidades recentes" da home para buscar do banco: cursos `status='publicado'` + oportunidades publicadas (vagas/concursos/estágios).
- Fazer a barra de busca da home funcionar: ao digitar e buscar, redirecionar para `/cursos` (ou uma nova página `/busca`) com o termo, buscando cursos + oportunidades ao mesmo tempo.
- Remover a dependência de `site-data.ts` na home (os dados falsos somem).

### Fase 2 — Preencher o site com 30 cursos e conteúdo de verdade (sem você cadastrar nada)
Popular o banco de uma vez com conteúdo realista, via migração:

**30 cursos, todos com imagem de capa**, divididos assim:
- **~20 cursos próprios completos** — cada um com capa, descrição, objetivos, público-alvo, módulos e de 4 a 8 aulas com texto real escrito para o curso (não texto de enchimento), mais atividade final. Temas úteis para quem está começando:
  - Carreira: currículo do zero, entrevista de emprego, primeiro emprego, LinkedIn, comunicação e postura profissional, organização e produtividade
  - Informática: informática básica, Word, Excel do zero ao essencial, Excel intermediário, Google Drive e ferramentas online, segurança digital
  - Negócios: atendimento ao cliente, vendas, rotinas administrativas, educação financeira, empreendedorismo
  - Tecnologia: lógica de programação, introdução ao HTML e CSS, introdução ao marketing digital
- **~10 cursos externos recomendados** com capa, plataforma e link (Fundação Bradesco, Sebrae, Escola Virtual Gov, Curso em Vídeo, Google Ateliê Digital, entre outros).

**Videoaulas:** cada aula que fizer sentido ganha uma videoaula gratuita já existente no YouTube, incorporada dentro da aula (o campo de vídeo já existe no sistema). Gerar vídeo original com IA sairia caro demais para 30 cursos — por isso a escolha por vídeos gratuitos e públicos, sempre creditando o canal. Você pode trocar qualquer vídeo depois pelo painel.

**Capas:** geradas por IA, no estilo visual do site (rosa e branco), uma por curso.

Além dos cursos:
- **Vagas:** ~8 vagas publicadas com requisitos, local, prazo e link.
- **Concursos:** ~5 concursos (prefeitura, TRT, banco público) com cargo, vagas, taxa, datas.
- **Estágios:** ~5 estágios (TI, RH, marketing, administrativo) com bolsa, requisitos e link.
- **Modelos de currículo:** ~3 modelos ativos com preview.
- Categorias e etiquetas para organizar tudo.
- Os cards de curso na listagem e na home passam a mostrar a imagem de capa (hoje o card não exibe capa nenhuma).


### Fase 3 — Conteúdos/Dicas virando uma seção real de artigos
- Criar tabela `articles` (título, slug, resumo, corpo em texto/markdown, imagem, categoria, etiquetas, status, publicado_em) com RLS + GRANTs.
- CRUD no painel admin (listar, criar, editar, publicar, excluir) seguindo o padrão dos outros gerenciadores.
- Página `/conteudos` lista artigos publicados do banco (em vez dos cards estáticos).
- Nova rota `/conteudo/$slug` com a página de leitura do artigo.
- Semear ~6 artigos de exemplo (como conseguir primeiro emprego, como fazer currículo, entrevista, etc.).

### Fase 4 — Padronizar o Painel do aluno
- Trocar o uso da tabela `user_courses` pelo sistema `enrollments` no `/painel`: mostrar matrículas reais com progresso e link para o curso, igual ao `/meus-cursos`.
- Manter a edição de perfil e o botão sair como estão.
- (A tabela `user_courses` antiga pode continuar existindo, mas o painel deixa de depender dela.)

## Detalhes técnicos
- Home: queries Supabase diretas no componente com `useQuery` (mesmo padrão das outras páginas públicas).
- Busca: termo via `useNavigate` para `/cursos` com query string, ou página `/busca` única que consulta cursos + 3 tabelas de oportunidades.
- Migração única com `INSERT` literais para todo o conteúdo de exemplo (cursos, oportunidades, currículos, categorias, etiquetas, artigos).
- Tabela `articles`: mesma estrutura de status/categorias/etiquetas já usada pelas oportunidades, reaproveitando `content_categories` (scope `conteudo`) e `content_tags`.
- Painel: substituir a query de `user_courses` por `enrollments` com join em `courses`, reusando o tipo já usado em `/meus-cursos`.

## Ordem sugerida
Fase 2 primeiro (preencher conteúdo) → Fase 1 (home real) → Fase 3 (artigos) → Fase 4 (painel). Assim a home já tem o que mostrar assim que for conectada.
