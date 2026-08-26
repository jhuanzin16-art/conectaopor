export type Curso = {
  id: string;
  nome: string;
  instituicao: string;
  categoria: string;
  duracao: string;
  certificado: boolean;
};

export const categorias = [
  "Tecnologia",
  "Administração",
  "Direito",
  "Marketing",
  "Finanças",
  "Idiomas",
  "Desenvolvimento pessoal",
] as const;

export const cursos: Curso[] = [
  { id: "1", nome: "Lógica de Programação", instituicao: "Fundação Bradesco", categoria: "Tecnologia", duracao: "40h", certificado: true },
  { id: "2", nome: "Excel Básico ao Avançado", instituicao: "Sebrae", categoria: "Administração", duracao: "30h", certificado: true },
  { id: "3", nome: "Introdução ao Direito do Trabalho", instituicao: "ENAP", categoria: "Direito", duracao: "20h", certificado: true },
  { id: "4", nome: "Marketing Digital para Iniciantes", instituicao: "Google Ateliê", categoria: "Marketing", duracao: "25h", certificado: true },
  { id: "5", nome: "Educação Financeira Pessoal", instituicao: "Banco Central", categoria: "Finanças", duracao: "15h", certificado: false },
  { id: "6", nome: "Inglês Básico para o Trabalho", instituicao: "IFRS", categoria: "Idiomas", duracao: "60h", certificado: true },
  { id: "7", nome: "Comunicação e Oratória", instituicao: "USP Livre", categoria: "Desenvolvimento pessoal", duracao: "12h", certificado: false },
  { id: "8", nome: "Desenvolvimento Web com HTML e CSS", instituicao: "Curso em Vídeo", categoria: "Tecnologia", duracao: "45h", certificado: true },
  { id: "9", nome: "Gestão de Projetos Ágeis", instituicao: "Escola Virtual Gov", categoria: "Administração", duracao: "20h", certificado: true },
];

export type Oportunidade = {
  id: string;
  titulo: string;
  empresa: string;
  local: string;
  tipo: "Emprego" | "Estágio" | "Aprendizagem" | "Concurso";
  requisitos: string;
  prazo: string;
};

export const oportunidades: Oportunidade[] = [
  { id: "1", titulo: "Assistente Administrativo", empresa: "Grupo Aurora", local: "Fortaleza, CE", tipo: "Emprego", requisitos: "Ensino médio completo e pacote Office", prazo: "30/09" },
  { id: "2", titulo: "Auxiliar de Atendimento", empresa: "RedeMais", local: "Remoto", tipo: "Emprego", requisitos: "Boa comunicação, sem experiência", prazo: "12/10" },
  { id: "3", titulo: "Analista Júnior de Marketing", empresa: "Agência Prisma", local: "São Paulo, SP", tipo: "Emprego", requisitos: "Cursando Marketing ou Publicidade", prazo: "05/10" },
  { id: "4", titulo: "Estágio em Desenvolvimento Front-end", empresa: "TechFlow", local: "Remoto", tipo: "Estágio", requisitos: "Cursando TI, noções de HTML/CSS", prazo: "20/09" },
  { id: "5", titulo: "Estágio em Recursos Humanos", empresa: "Vita Saúde", local: "Recife, PE", tipo: "Estágio", requisitos: "Cursando Psicologia ou Administração", prazo: "28/09" },
  { id: "6", titulo: "Jovem Aprendiz Administrativo", empresa: "Indústria Sol", local: "Fortaleza, CE", tipo: "Aprendizagem", requisitos: "16 a 22 anos, cursando ensino médio", prazo: "15/10" },
  { id: "7", titulo: "Concurso Prefeitura — Agente Administrativo", empresa: "Prefeitura Municipal", local: "Caucaia, CE", tipo: "Concurso", requisitos: "Ensino médio completo", prazo: "10/11" },
  { id: "8", titulo: "Concurso Tribunal — Técnico Judiciário", empresa: "TRT", local: "Nacional", tipo: "Concurso", requisitos: "Ensino médio completo", prazo: "22/11" },
  { id: "9", titulo: "Concurso Banco Público — Escriturário", empresa: "Banco Estadual", local: "Nacional", tipo: "Concurso", requisitos: "Ensino médio completo", prazo: "01/12" },
];

export const conteudos = [
  { id: "1", titulo: "Como conseguir o primeiro emprego", resumo: "Passos práticos para se candidatar mesmo sem experiência.", tempo: "6 min" },
  { id: "2", titulo: "Como fazer um bom currículo", resumo: "Estrutura, linguagem e erros que eliminam candidatos.", tempo: "8 min" },
  { id: "3", titulo: "Como se preparar para uma entrevista", resumo: "Perguntas comuns e como responder com segurança.", tempo: "7 min" },
  { id: "4", titulo: "Como encontrar cursos gratuitos", resumo: "Onde buscar cursos confiáveis e com certificado.", tempo: "5 min" },
  { id: "5", titulo: "Como conseguir estágio", resumo: "Plataformas, currículo e networking para estudantes.", tempo: "6 min" },
  { id: "6", titulo: "Como desenvolver habilidades profissionais", resumo: "Soft skills que fazem diferença no início da carreira.", tempo: "9 min" },
];
