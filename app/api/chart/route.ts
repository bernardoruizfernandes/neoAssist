import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { 
  clientes, 
  metricas, 
  contextoEmpresa, 
  getResumoLavandeRio, 
  getAnalysePorSetor, 
  calcularFaturamentoPorMes 
} from '@/lib/data'

export async function POST(request: NextRequest) {
  try {
    const { chartType, query } = await request.json()

    if (!chartType) {
      return NextResponse.json(
        { error: 'chartType is required' },
        { status: 400 }
      )
    }

    // Obter dados relevantes baseado no tipo de gráfico e query
    let relevantData = null
    let dataContext = ""

    // Detectar que tipo de dados fornecer
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes('mês') || queryLower.includes('mes') || queryLower.includes('faturamento') || queryLower.includes('temporal')) {
      // Dados temporais
      relevantData = {
        faturamento_mensal: calcularFaturamentoPorMes(),
        metricas_mensais: metricas,
        tipo_dados: 'temporal'
      }
      dataContext = "Dados mensais de faturamento e métricas da LavandeRio"
    } else if (queryLower.includes('setor') || queryLower.includes('distribui') || queryLower.includes('segmenta')) {
      // Dados por setor
      relevantData = {
        analise_por_setor: getAnalysePorSetor(),
        tipo_dados: 'distribuicao'
      }
      dataContext = "Distribuição de clientes e faturamento por setor"
    } else if (queryLower.includes('client') || queryLower.includes('ranking') || queryLower.includes('priorit')) {
      // Dados de clientes
      relevantData = {
        clientes: clientes,
        resumo: getResumoLavandeRio(),
        tipo_dados: 'ranking'
      }
      dataContext = "Dados de clientes da LavandeRio"
    } else {
      // Dados gerais - usar faturamento mensal como padrão
      relevantData = {
        faturamento_mensal: calcularFaturamentoPorMes(),
        resumo: getResumoLavandeRio(),
        tipo_dados: 'geral'
      }
      dataContext = "Dados gerais da LavandeRio"
    }

    // Usar GPT para estruturar os dados para o gráfico
    const prompt = `Você é um especialista em visualização de dados. Preciso que estruture dados da LavandeRio para um gráfico tipo "${chartType}".

CONTEXTO: ${dataContext}
QUERY DO USUÁRIO: "${query}"
TIPO DE GRÁFICO: ${chartType}

DADOS DISPONÍVEIS:
${JSON.stringify(relevantData, null, 2)}

INSTRUÇÕES:
1. Analise os dados e a query do usuário
2. Estruture os dados no formato correto para o tipo de gráfico solicitado
3. Retorne APENAS um JSON válido seguindo exatamente este formato:

Para gráfico "line" ou "area":
{
  "type": "${chartType}",
  "title": "Título do Gráfico",
  "data": [
    {"name": "Jan 2024", "value": 775137.83},
    {"name": "Fev 2024", "value": 784073.26}
  ]
}

Para gráfico "bar":
{
  "type": "${chartType}",
  "title": "Título do Gráfico", 
  "data": [
    {"name": "Hotelaria", "value": 450000},
    {"name": "Gastronomia", "value": 320000}
  ]
}

Para gráfico "pie":
{
  "type": "${chartType}",
  "title": "Título do Gráfico",
  "data": [
    {"name": "Hotelaria", "value": 15, "percentage": 45.5},
    {"name": "Saúde", "value": 8, "percentage": 24.2}
  ]
}

IMPORTANTE:
- Use SOMENTE os dados fornecidos acima
- Para valores monetários, use números sem formatação (ex: 775137.83)
- Para percentuais em pie charts, calcule baseado nos dados reais
- Nomes devem ser curtos e descritivos
- Título deve ser claro e específico
- Máximo 12 pontos de dados
- Se não conseguir gerar o gráfico com os dados disponíveis, retorne: {"error": "Dados insuficientes para este tipo de gráfico"}

RESPONDA APENAS COM O JSON, SEM EXPLICAÇÕES:`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    })

    const gptResponse = completion.choices[0]?.message?.content || ''
    
    try {
      const chartData = JSON.parse(gptResponse)
      
      if (chartData.error) {
        return NextResponse.json({
          success: false,
          error: chartData.error
        }, { status: 400 })
      }
      
      return NextResponse.json({
        success: true,
        chartData: chartData
      })
      
    } catch (parseError) {
      console.error('Erro ao parsear resposta do GPT:', gptResponse)
      return NextResponse.json({
        success: false,
        error: 'Erro ao estruturar dados do gráfico'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Chart generation error:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao gerar dados do gráfico',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}