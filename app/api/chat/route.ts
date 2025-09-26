import { NextRequest, NextResponse } from 'next/server'
import { openai, systemPrompt } from '@/lib/openai'
import { 
  clientes, 
  metricas, 
  contextoEmpresa, 
  getResumoLavandeRio, 
  getAnalysePorSetor, 
  getClientesPrioritarios,
  calcularFaturamentoPorMes 
} from '@/lib/data'

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()
    let detectedIntent = 'descriptive_analysis' // Default

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // SISTEMA DE DADOS EMBARCADOS - SEMPRE DISPONÍVEL
    let analysisDataToUse = null
    
    // Detectar intent baseado na mensagem
    const messageText = message.toLowerCase()
    
    let enhancedMessage = message
    
    // Detectar qual tipo de dados fornecer baseado na pergunta
    let shouldProvideData = false
    let dataType = 'summary'
    
    // Perguntas que sempre precisam de dados
    if (messageText.includes('client') || messageText.includes('carteira') || 
        messageText.includes('dados') || messageText.includes('analis') ||
        messageText.includes('situação') || messageText.includes('faturamento') ||
        messageText.includes('receita') || messageText.includes('setor') ||
        messageText.includes('inadimpl') || messageText.includes('priorid') ||
        messageText.includes('estratég') || messageText.includes('cobrança') ||
        messageText.includes('mês') || messageText.includes('mes') ||
        messageText.includes('lavanderio') || messageText.includes('empresa')) {
      shouldProvideData = true
      
      // Detectar tipo específico
      if (messageText.includes('priorid') || messageText.includes('urgent')) {
        dataType = 'priority'
      } else if (messageText.includes('setor') || messageText.includes('segmenta')) {
        dataType = 'sector'
      } else if (messageText.includes('faturamento') && (messageText.includes('mês') || messageText.includes('mes'))) {
        dataType = 'monthly_revenue'
      } else if (messageText.includes('contexto') || messageText.includes('empresa') || messageText.includes('lavanderio')) {
        dataType = 'company_context'
      }
    }
    
    // Montar dados baseado no tipo solicitado
    if (shouldProvideData) {
      switch (dataType) {
        case 'priority':
          analysisDataToUse = {
            clientes_prioritarios: getClientesPrioritarios(),
            resumo_geral: getResumoLavandeRio(),
            contexto: "Análise de clientes prioritários para cobrança"
          }
          detectedIntent = 'priority_analysis'
          break
          
        case 'sector':
          analysisDataToUse = {
            analise_por_setor: getAnalysePorSetor(),
            resumo_geral: getResumoLavandeRio(),
            contexto: "Análise de performance por setor de atividade"
          }
          detectedIntent = 'descriptive_analysis'
          break
          
        case 'monthly_revenue':
          analysisDataToUse = {
            faturamento_mensal: calcularFaturamentoPorMes(),
            metricas_mensais: metricas,
            resumo_geral: getResumoLavandeRio(),
            contexto: "Evolução do faturamento mês a mês"
          }
          detectedIntent = 'specific_data'
          break
          
        case 'company_context':
          analysisDataToUse = {
            contexto_empresa: contextoEmpresa,
            resumo_geral: getResumoLavandeRio(),
            contexto: "Informações gerais sobre a LavandeRio"
          }
          detectedIntent = 'descriptive_analysis'
          break
          
        default:
          // Resumo completo para perguntas gerais
          analysisDataToUse = {
            resumo_geral: getResumoLavandeRio(),
            contexto_empresa: contextoEmpresa,
            clientes_sample: clientes.slice(0, 5), // Apenas 5 clientes para não sobrecarregar
            metricas_recentes: metricas.slice(-3), // Últimas 3 métricas
            contexto: "Visão geral da LavandeRio"
          }
          detectedIntent = detectedIntent || 'descriptive_analysis'
      }
    }
    
    if (analysisDataToUse) {
      // Dynamic templates based on detected intent
      const templates = {
        descriptive_analysis: {
          level: 'ANÁLISE DESCRITIVA DOS DADOS ATUAIS',
          instruction: 'Examine os dados fornecidos e descreva a situação atual. Foque em COMO OS DADOS ESTÃO organizados, distribuídos e segmentados. Use números específicos dos dados reais.',
          chainOfThought: '1) Primeiro examine todos os dados 2) Identifique padrões e distribuições 3) Descreva a situação atual com números específicos'
        },
        specific_data: {
          level: 'RESPOSTA DIRETA E CONCISA',
          instruction: 'Extraia e forneça o número/dado específico solicitado. Seja direto e objetivo.',
          chainOfThought: '1) Identifique exatamente qual dado é solicitado 2) Extraia o valor dos dados 3) Responda diretamente'
        },
        strategic_advice: {
          level: 'RECOMENDAÇÕES ESTRATÉGICAS',
          instruction: 'Analise os dados e forneça recomendações acionáveis. Combine insights dos dados com estratégias práticas.',
          chainOfThought: '1) Analise os dados atuais 2) Identifique oportunidades e riscos 3) Sugira ações específicas baseadas nos dados'
        },
        priority_analysis: {
          level: 'ANÁLISE DE PRIORIZAÇÃO',
          instruction: 'Analise os dados e crie um ranking de prioridades. Use métricas específicas para justificar a ordem.',
          chainOfThought: '1) Examine todos os registros 2) Aplique critérios de priorização 3) Crie ranking com justificativas baseadas nos dados'
        },
        insights_recovery: {
          level: 'INSIGHTS E PROJEÇÕES',
          instruction: 'Analise os dados para gerar insights sobre potencial de recuperação e estimativas futuras.',
          chainOfThought: '1) Analise histórico e padrões 2) Calcule probabilidades baseadas nos dados 3) Projete cenários com base nas evidências'
        }
      }
      
      const template = templates[detectedIntent as keyof typeof templates] || templates.descriptive_analysis
      
      const directive = `

🔥 DADOS REAIS DA LAVANDERIO - USE OBRIGATORIAMENTE 🔥

⚡ NÍVEL DE RESPOSTA: ${template.level}

🎯 INSTRUÇÃO ESPECÍFICA: ${template.instruction}

🧠 PROCESSO DE PENSAMENTO: ${template.chainOfThought}

📊 IMPORTANTE SOBRE GRÁFICOS: Se a resposta contém dados numéricos que podem ser visualizados (como faturamento mensal, distribuição por setor, rankings), SEMPRE termine sugerindo: "💡 Esta análise pode ser visualizada em gráfico - clique no botão 'Gerar Gráfico' que aparecerá abaixo da resposta!"

⚠️ IMPORTANTE: Estes são os ÚNICOS dados disponíveis sobre a LavandeRio. Se você não encontrar informação específica solicitada nos dados abaixo, responda: "Desculpe, este é um produto em desenvolvimento e não possuo essa informação específica. Posso ajudar com: análise de clientes, faturamento mensal, performance por setor, clientes prioritários para cobrança, ou contexto geral da empresa."

📊 DADOS DISPONÍVEIS DA LAVANDERIO:
`
      enhancedMessage = `${message}${directive}${JSON.stringify(analysisDataToUse, null, 2)}

✅ Use SOMENTE os dados acima para responder. Se a informação não estiver disponível, use a mensagem de limitação indicada.`
    } else {
      // Para perguntas que não precisam de dados, informar limitações
      enhancedMessage = `${message}

INSTRUÇÃO ESPECIAL: Esta pergunta parece não necessitar dos dados específicos da LavandeRio. Se você não conseguir responder adequadamente, informe que é um produto em desenvolvimento com foco em análise financeira da LavandeRio e sugira perguntas que pode responder: "Como está a situação da LavandeRio?", "Quais clientes precisam de atenção prioritária?", "Faturamento mês a mês", etc.`
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: enhancedMessage }
    ]

    // Dynamic temperature based on intent
    const temperatureMap = {
      'descriptive_analysis': 0.05, // Very precise for data analysis
      'specific_data': 0.02, // Extremely precise for exact data
      'strategic_advice': 0.3, // Some creativity for strategies
      'priority_analysis': 0.1, // Precise ranking
      'insights_recovery': 0.2 // Balanced for insights
    }
    
    const temperature = detectedIntent ? temperatureMap[detectedIntent as keyof typeof temperatureMap] || 0.1 : 0.1

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as any,
      temperature: temperature,
      max_tokens: 1200,
    })

    const responseContent = completion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.'

    return NextResponse.json({
      content: responseContent,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'Configuração da API OpenAI necessária' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}