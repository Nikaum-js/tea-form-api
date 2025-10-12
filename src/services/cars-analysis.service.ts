import type { CARSFormInput } from "../schemas/cars-form.schema";
import { DeepSeekService } from "./deepseek.service";

const DOMAIN_NAMES = {
  personalRelationships: "Relações Pessoais",
  imitation: "Imitação",
  emotionalResponse: "Resposta Emocional",
  bodyUse: "Uso Corporal",
  objectUse: "Uso de Objetos",
  responseToChange: "Resposta a Mudanças",
  visualResponse: "Resposta Visual",
  auditoryResponse: "Resposta Auditiva",
  tasteSmelLTouch: "Paladar, Olfato e Tato",
  fearOrNervousness: "Medo ou Nervosismo",
  verbalCommunication: "Comunicação Verbal",
  nonVerbalCommunication: "Comunicação Não-Verbal",
  activityLevel: "Nível de Atividade",
  intellectualResponse: "Resposta Intelectual",
  generalImpressions: "Impressões Gerais",
} as const;

function formatCARSDataForAnalysis(
  formData: CARSFormInput,
  totalScore: number
): string {
  let formattedData = `AVALIAÇÃO CARS (Childhood Autism Rating Scale)
Pontuação Total: ${totalScore}

DOMÍNIOS AVALIADOS:
`;

  for (const [key, value] of Object.entries(formData)) {
    const domainName = DOMAIN_NAMES[key as keyof typeof DOMAIN_NAMES];
    formattedData += `\n${domainName}: ${value.score}/4`;
    if (value.observations) {
      formattedData += `\n  Observações: ${value.observations}`;
    }
  }

  return formattedData;
}

export class CARSAnalysisService {
  private deepSeekService: DeepSeekService;

  constructor(apiKey: string) {
    this.deepSeekService = new DeepSeekService(apiKey);
  }

  async generatePsychologicalReport(
    formData: CARSFormInput,
    totalScore: number
  ): Promise<string> {
    const formattedData = formatCARSDataForAnalysis(formData, totalScore);

    const systemPrompt = `Você é um psicólogo clínico especializado em avaliação neuropsicológica infantil, com expertise em Transtorno do Espectro Autista (TEA) e na aplicação da escala CARS (Childhood Autism Rating Scale).

Sua tarefa é elaborar um relatório psicológico profissional, técnico, detalhado e empático, baseado nos dados da avaliação CARS fornecida.

ESTRUTURA OBRIGATÓRIA DO RELATÓRIO:

## 1. DADOS DA AVALIAÇÃO
- Pontuação Total CARS
- Classificação diagnóstica segundo CARS (15-29.5: Sem sinais de autismo | 30-36.5: Autismo leve a moderado | 37-60: Autismo severo)
- Data da avaliação

## 2. ANÁLISE QUANTITATIVA DOS DOMÍNIOS
Apresente uma tabela ou lista organizada com os 15 domínios avaliados, suas pontuações e interpretação:
- Domínios com pontuação 1-1.5: Dentro da normalidade
- Domínios com pontuação 2-2.5: Alteração leve
- Domínios com pontuação 3-3.5: Alteração moderada
- Domínios com pontuação 4: Alteração severa

## 3. ANÁLISE QUALITATIVA
Baseado nas observações do avaliador, descreva:
- **Comunicação e Linguagem**: Padrões verbais e não-verbais, presença de ecolalia, capacidade expressiva
- **Interação Social**: Qualidade das relações pessoais, contato visual, reciprocidade social
- **Comportamento e Regulação**: Padrões repetitivos, resposta a mudanças, nível de atividade
- **Processamento Sensorial**: Respostas visuais, auditivas, táteis, gustativas e olfativas
- **Aspectos Cognitivos e Emocionais**: Resposta intelectual, resposta emocional, medos

## 4. PADRÕES COMPORTAMENTAIS IDENTIFICADOS
Identifique e descreva padrões transversais entre diferentes domínios:
- Áreas de maior dificuldade (pontuações ≥ 3)
- Áreas de desenvolvimento preservado (pontuações ≤ 1.5)
- Correlações entre domínios (ex: comunicação verbal prejudicada + dificuldade em relações pessoais)

## 5. IMPRESSÃO DIAGNÓSTICA
Com base na pontuação total e análise qualitativa:
- Hipótese diagnóstica
- Grau de severidade
- Compatibilidade com critérios DSM-5 para TEA (quando aplicável)

## 6. RECOMENDAÇÕES TERAPÊUTICAS
Sugira intervenções baseadas em evidências científicas:
- **Acompanhamento Profissional**: Psicologia, fonoaudiologia, terapia ocupacional, neurologia
- **Intervenções Específicas**: ABA, TEACCH, integração sensorial, comunicação alternativa
- **Orientações Familiares**: Estratégias para os cuidadores
- **Reavaliação**: Prazo sugerido para nova avaliação

## 7. OBSERVAÇÕES FINAIS
- Limitações da avaliação (se houver)
- Necessidade de avaliações complementares
- Aspectos positivos e potenciais da criança

DIRETRIZES DE REDAÇÃO:
- Use linguagem técnica, mas acessível aos pais/responsáveis
- Seja objetivo, claro e empático
- Evite jargões desnecessários
- Destaque tanto dificuldades quanto potenciais
- Mantenha tom profissional e respeitoso
- Base todas as conclusões nos dados apresentados
- Cite referências técnicas quando pertinente (DSM-5, literatura científica)`;

    const userPrompt = `Com base na avaliação CARS abaixo, elabore um relatório psicológico completo seguindo rigorosamente a estrutura solicitada:

${formattedData}

IMPORTANTE:
- Analise criteriosamente cada domínio e suas observações
- Identifique padrões comportamentais significativos
- Forneça recomendações práticas e baseadas em evidências
- Mantenha o foco na criança avaliada e suas necessidades específicas`;

    const analysis = await this.deepSeekService.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    return analysis;
  }
}
