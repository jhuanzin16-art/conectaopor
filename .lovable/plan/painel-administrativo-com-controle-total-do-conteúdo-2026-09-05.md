# Painel administrativo com controle total do conteúdo

Objetivo: administrar cursos, aulas, quizzes, certificados, modelos de currículo, vagas, concursos, estágios, categorias/tags e destaques direto pelo painel, sem tocar em código.

Por ser um sistema grande, a entrega será feita em 4 fases. Cada fase termina funcionando de ponta a ponta (banco + tela admin + tela pública).

## Fase 1 — Base de conteúdo e taxonomias
- Tabelas de `categorias` e `tags` genéricas (servem para cursos, vagas, concursos e estágios), com ativar/desativar, ordem e exclusão.
- Padrão de status para todo conteúdo: rascunho, publicado, desativado, arquivado.
- Campo de destaque e ordem de exibição em todo conteúdo.
- Armazenamento de arquivos (capas, banners, PDFs, vídeos, modelos) com upload pelo painel.
- Telas admin: Categorias, Tags e Mídia.

## Fase 2 — Cursos, módulos, aulas em blocos e quizzes
- Cursos com todos os campos pedidos: subtítulo, descrição curta e completa, capa, banner, categoria/subcategoria, tags, nível, carga horária, instrutor, objetivos, público-alvo, pré-requisitos, o que vai aprender, ordem, destaque, modelo de certificado, regras de conclusão, data de publicação.
- Ações: criar, editar, duplicar, publicar, despublicar, arquivar, excluir.
- Módulos dentro do curso: criar, renomear, reordenar, duplicar, excluir.
- Aulas dentro dos módulos: criar, editar, duplicar, reordenar, excluir, marcar obrigatória/opcional.
- Aula montada por blocos combináveis: texto, título/subtítulo, imagem, vídeo enviado, YouTube/Vimeo/link externo, PDF, arquivo para download, lista, tabela, botão, material complementar e quiz. Blocos podem ser reordenados.
- Quizzes: pergunta, alternativas, resposta correta, explicação, pontuação, tentativas, nota mínima, obrigatoriedade.
- Pré-visualização da aula e do curso antes de publicar.
- Página pública do curso passa a renderizar os blocos e os quizzes, com progresso e regras de conclusão.

## Fase 3 — Certificados e modelos de currículo
- Modelos de certificado: cadastrar, enviar arquivo (PNG/JPG/PDF), ativar/desativar, editar, definir padrão e definir por curso.
- Editor de posicionamento dos campos automáticos sobre o modelo: nome do aluno, curso, carga horária, data de conclusão e código.
- Emissão só quando o aluno cumprir as regras de conclusão definidas no curso.
- Modelos de currículo: nome, descrição, arquivo, imagem de prévia, categoria, ativar/desativar, recomendado, ordem, editar e remover. Aparecem automaticamente em "Criar meu currículo".

## Fase 4 — Vagas, concursos e estágios
- Vagas com todos os campos pedidos, mais duplicar, encerrar, reabrir, arquivar, destacar e ordenar.
- Concursos com todos os campos, mais marcações: destaque, inscrições abertas, em breve, encerrado.
- Estágios com todos os campos pedidos.
- Páginas públicas `/vagas`, `/concursos` e `/estagio` passam a ler do banco com filtros por categoria e tag.
- Home passa a exibir automaticamente os conteúdos marcados como destaque.

## Notas técnicas
- Tudo no banco do Lovable Cloud, com RLS: leitura pública apenas de conteúdo publicado; escrita restrita a staff; exclusão definitiva restrita a super admin.
- Blocos de aula guardados em tabela própria com `tipo` + dados em JSON, para permitir novos tipos de bloco no futuro sem migração.
- Uploads em buckets de storage separados (capas, materiais, certificados, currículos).
- Registro de auditoria simples (quem alterou e quando) nas tabelas de conteúdo.
