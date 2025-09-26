export interface ChartDetectionResult {
  isChartable: boolean
  chartType?: 'line' | 'bar' | 'pie' | 'area'
  confidence: number
  suggestedTitle?: string
}

export function detectChartableContent(content: string, userQuery: string): ChartDetectionResult {
  const normalizedContent = content.toLowerCase()
  const normalizedQuery = userQuery.toLowerCase()
  
  // Padrões que indicam dados temporais (Line/Area Charts)
  const temporalPatterns = [
    /m[eê]s a m[eê]s/,
    /ao longo do tempo/,
    /evolu[çc][aã]o/,
    /tend[eê]ncia/,
    /hist[óo]rico/,
    /crescimento/,
    /queda/,
    /varia[çc][aã]o/,
    /janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/,
    /2018|2019|2020|2021|2022|2023|2024/,
    /trimestre|semestre|anual/,
    /duas linhas/,
    /múltiplas linhas/,
    /faturamento.*inadimpl/,
    /inadimpl.*faturamento/,
    /receita.*inadimpl/,
    /inadimpl.*receita/,
    /pagamentos.*data de vencimento/,
    /n[úu]mero de pagamentos.*data/,
    /data de pagamento/,
    /pago.*por m[eê]s/,
    /faturamento.*por m[eê]s/,
    /faturamento.*mensal/,
    /receita.*mensal/,
    /faturamento.*em 202[0-9]/,
    /receita.*em 202[0-9]/,
    /r\$.*\d+.*r\$.*\d+/  // Múltiplos valores monetários (indica série temporal)
  ]
  
  // Padrões que indicam distribuições (Pie Charts)
  const distributionPatterns = [
    /distribu[íi][çc][aã]o/,
    /por setor/,
    /por regi[aã]o/,
    /por tipo/,
    /por categoria/,
    /segmenta[çc][aã]o/,
    /participa[çc][aã]o/,
    /propor[çc][aã]o/,
    /percentual/,
    /porcentagem/,
    /quantidade.*por/,
    /n[úu]mero.*por/,
    /quantas.*empresas/,
    /quantos.*clientes/
  ]
  
  // Padrões que indicam rankings/comparações (Bar Charts)
  const rankingPatterns = [
    /ranking/,
    /top \d+/,
    /maiores/,
    /menores/,
    /compara[çc][aã]o/,
    /vs\.|versus/,
    /entre/,
    /ordem/,
    /classifica[çc][aã]o/
  ]
  
  // Padrões que indicam valores numéricos que podem ser graficados
  const numericalPatterns = [
    /r\$\s*[\d.,]+/,
    /\d+[\.,]?\d*\s*(mil|milh[õo]es?|k|m)/,
    /\d+[\.,]?\d*%/,
    /faturamento/,
    /receita/,
    /valor/,
    /quantidade/,
    /n[úu]mero/
  ]
  
  let chartType: 'line' | 'bar' | 'pie' | 'area' | undefined
  let confidence = 0
  let suggestedTitle = ''
  
  // Detectar tipo de gráfico baseado nos padrões
  const temporalScore = temporalPatterns.filter(pattern => 
    pattern.test(normalizedContent) || pattern.test(normalizedQuery)
  ).length
  
  const distributionScore = distributionPatterns.filter(pattern => 
    pattern.test(normalizedContent) || pattern.test(normalizedQuery)
  ).length
  
  const rankingScore = rankingPatterns.filter(pattern => 
    pattern.test(normalizedContent) || pattern.test(normalizedQuery)
  ).length
  
  const numericalScore = numericalPatterns.filter(pattern => 
    pattern.test(normalizedContent) || pattern.test(normalizedQuery)
  ).length
  
  // Lógica de decisão para tipo de gráfico
  if (temporalScore > 0 && numericalScore > 0) {
    chartType = temporalScore > 2 ? 'area' : 'line'
    confidence = Math.min(90, (temporalScore + numericalScore) * 15)
    suggestedTitle = 'Evolução Temporal'
  } else if (distributionScore > 0 && numericalScore > 0) {
    chartType = 'pie'
    confidence = Math.min(85, (distributionScore + numericalScore) * 12)
    suggestedTitle = 'Distribuição por Categoria'
  } else if (rankingScore > 0 && numericalScore > 0) {
    chartType = 'bar'
    confidence = Math.min(80, (rankingScore + numericalScore) * 10)
    suggestedTitle = 'Ranking e Comparações'
  }
  
  // Aumentar confiança se há palavras-chave específicas na query
  const explicitChartKeywords = [
    'gráfico', 'grafico', 'chart', 'visualiza', 'mostra', 'plota', 'desenha'
  ]
  
  const hasExplicitRequest = explicitChartKeywords.some(keyword => 
    normalizedQuery.includes(keyword)
  )
  
  if (hasExplicitRequest && chartType) {
    confidence = Math.min(95, confidence + 20)
  }
  
  // Reduzir confiança se o conteúdo é muito curto ou genérico
  if (content.length < 100 || numericalScore === 0) {
    confidence = confidence * 0.6
  }
  
  return {
    isChartable: confidence > 40 && chartType !== undefined,
    chartType,
    confidence,
    suggestedTitle: chartType ? suggestedTitle : undefined
  }
}

