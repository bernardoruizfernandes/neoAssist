import { NextRequest, NextResponse } from 'next/server'
import { openai, systemPrompt } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { message, history, analysisData } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    let enhancedMessage = message
    if (analysisData) {
      enhancedMessage = `${message}\n\nDados de análise relevantes:\n${JSON.stringify(analysisData, null, 2)}`
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: enhancedMessage }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as any,
      temperature: 0.3,
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