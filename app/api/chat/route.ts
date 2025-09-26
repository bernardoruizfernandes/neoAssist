import { NextRequest, NextResponse } from 'next/server'
import { openai, systemPrompt } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { message, history, analysisData, detectedIntent } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    let enhancedMessage = message
    if (analysisData) {
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
      
      // Regras fortes para não inventar números e usar cobertura de dados
      const paymentCoverageHint = `\n\nREGRAS CRÍTICAS AO FALAR DE DATA DE PAGAMENTO:\n- Se a pergunta mencionar "data de pagamento" ou "faturamento por data de pagamento", VOCÊ DEVE usar analysisData.data_coverage.payment_revenue_by_month.\n- Filtre pelo ANO solicitado. Responda SOMENTE com os meses presentes em payment_revenue_by_month para esse ano.\n- NÃO invente meses ou valores ausentes. Se algum mês não existir, não preencha.\n- Se não houver nenhum mês para o período pedido, diga claramente: "Não há registros de pagamento no período solicitado".\n- NÃO afirme que os dados são futuros se houver meses disponíveis no mapa.\n`

      const directive = `\n\n🔥 DADOS REAIS ANEXADOS - USE OBRIGATORIAMENTE 🔥\n\n⚡ NÍVEL DE RESPOSTA: ${template.level}\n\n🎯 INSTRUÇÃO ESPECÍFICA: ${template.instruction}\n\n🧠 PROCESSO DE PENSAMENTO: ${template.chainOfThought}\n${paymentCoverageHint}\n📊 IMPORTANTE SOBRE GRÁFICOS: Se a pergunta solicitar gráficos, visualizações ou dados que podem ser visualizados (como "quantidade por setor", "distribuição", "evolução temporal"), SEMPRE termine sua resposta sugerindo: "💡 Esta análise pode ser visualizada em gráfico - clique no botão 'Gerar Gráfico' que aparecerá abaixo da resposta!"\n\n📊 DADOS DE ANÁLISE:\n`
      enhancedMessage = `${message}${directive}${JSON.stringify(analysisData, null, 2)}\n\n✅ Use o processo de pensamento acima e analise os dados para responder`
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