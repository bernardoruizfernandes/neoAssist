'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, User, Bot, Info, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { detectChartableContent, extractChartTitle } from '@/lib/chartDetection'
import { ChartContainer } from '@/components/charts/ChartContainer'

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  data: any[]
  title: string
  description?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  chartable?: boolean
  chartData?: ChartData
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingChart, setLoadingChart] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Advanced Intent Classification System
      let analysisData = null
      const input = currentInput.toLowerCase()
      
      // Step 1: Intent Detection
      const intentPatterns = {
        descriptive_analysis: [
          'como.*segmentado', 'como.*distribuído', 'como.*classificado',
          'qual.*situação', 'como.*está', 'como.*encontra',
          'mostre.*dados', 'analise.*atual', 'status.*carteira'
        ],
        specific_data: [
          'quantos', 'quanto', 'qual.*total', 'número.*de',
          'soma.*de', 'valor.*total', 'lista.*de'
        ],
        strategic_advice: [
          'como.*cobrar', 'estratég', 'abordagem', 'recomenda',
          'sugira', 'como.*proceder', 'próximos.*passos'
        ],
        priority_analysis: [
          'priorit', 'urgent', 'importante', 'primeiro',
          'ranking', 'ordem.*import'
        ],
        insights_recovery: [
          'insight', 'recupera', 'potencial', 'estimativa',
          'previsão', 'probabilidade', 'chance'
        ]
      }
      
      // Classify intent
      let detectedIntent = 'summary'
      let intentScore = 0
      
      for (const [intent, patterns] of Object.entries(intentPatterns)) {
        const matches = patterns.filter(pattern => new RegExp(pattern).test(input)).length
        if (matches > intentScore) {
          intentScore = matches
          detectedIntent = intent
        }
      }
      
      // Step 2: Determine if data analysis is needed
      const needsAnalysis = intentScore > 0 || 
          input.includes('analis') || input.includes('dados') ||
          input.includes('client') || input.includes('carteira') ||
          input.includes('risco') || input.includes('cobrança')
      
      // Step 3: Check for explicit chart requests
      const explicitChartRequest = input.includes('gráfico') || 
          input.includes('gráfico') || input.includes('chart') || 
          input.includes('visualiza') || input.includes('plota') || 
          input.includes('mostra em gráfico') || input.includes('gera um gráfico') ||
          input.includes('gere um gráfico') || input.includes('fazer um gráfico') ||
          input.includes('criar um gráfico') || input.includes('desenha') ||
          /gera\s+.*gr[áa]fico/.test(input) || /faz\s+.*gr[áa]fico/.test(input)

      if (needsAnalysis) {
        // Map intent to analysis type
        let analysisType = 'summary'
        switch (detectedIntent) {
          case 'priority_analysis':
            analysisType = 'priority'
            break
          case 'strategic_advice':
            analysisType = 'strategies'
            break
          case 'insights_recovery':
            analysisType = 'insights'
            break
          case 'descriptive_analysis':
          case 'specific_data':
          default:
            analysisType = 'summary'
        }

        try {
          // Para perguntas específicas sobre contexto/dados, usar RAG
          if (detectedIntent === 'descriptive_analysis' || 
              input.includes('lavanderio') || 
              input.includes('empresa') ||
              input.includes('contexto') ||
              input.includes('histórico') ||
              input.includes('tendência')) {
            
            // Consulta RAG para contexto específico
            const ragResponse = await fetch('/api/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                data: {}, 
                analysisType: 'rag',
                query: currentInput 
              })
            })
            
            if (ragResponse.ok) {
              const ragResult = await ragResponse.json()
              analysisData = ragResult.analysis
            }
          } else {
            // Análise padrão para outros tipos
            const analysisResponse = await fetch('/api/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: {}, analysisType })
            })
            
            if (analysisResponse.ok) {
              const analysisResult = await analysisResponse.json()
              analysisData = analysisResult.analysis
            }
          }
        } catch (analysisError) {
          console.error('Analysis error:', analysisError)
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          history: messages,
          analysisData: analysisData,
          detectedIntent: detectedIntent
        }),
      })

      const data = await response.json()

      // Detectar se a resposta pode gerar gráfico
      const chartDetection = detectChartableContent(data.content, currentInput)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        chartable: chartDetection.isChartable || explicitChartRequest,
        chartData: undefined
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Se foi um pedido explícito de gráfico, gerar automaticamente
      if (explicitChartRequest) {
        setTimeout(() => {
          generateChart(assistantMessage.id, currentInput) // Usar a query original do usuário
        }, 500) // Pequeno delay para a mensagem aparecer primeiro
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const generateChart = async (messageId: string, messageContent: string) => {
    setLoadingChart(messageId)
    
    try {
      // Detectar novamente para obter o tipo de gráfico
      const chartDetection = detectChartableContent(messageContent, '')
      
      if (!chartDetection.chartType) {
        throw new Error('Tipo de gráfico não detectado')
      }

      const response = await fetch('/api/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartType: chartDetection.chartType,
          query: messageContent
        })
      })

      const data = await response.json()
      
      if (data.success && data.chartData) {
        // Atualizar a mensagem com os dados do gráfico
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, chartData: data.chartData }
            : msg
        ))
      } else {
        throw new Error(data.error || 'Erro ao gerar gráfico')
      }
    } catch (error) {
      console.error('Erro ao gerar gráfico:', error)
      // Mostrar erro para o usuário
      alert('Erro ao gerar gráfico. Tente novamente.')
    } finally {
      setLoadingChart(null)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Modern Minimalist Header */}
      <header className="border-b border-neutral-200/50 backdrop-blur-sm bg-white/80 sticky top-0 z-10" role="banner">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-lg sm:text-xl font-semibold text-neutral-900">NeoAssist</h1>
                <p className="text-xs text-neutral-500">Powered by Neofin AI</p>
              </div>
            </button>
            
            <div className="relative group">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors duration-200 cursor-help">
                <Info className="w-4 h-4 text-neutral-600" />
              </div>
              <div className="absolute right-0 top-10 w-80 p-4 bg-white border border-neutral-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                <div className="text-sm text-neutral-800 space-y-2">
                  <h3 className="font-semibold text-primary-600">Sobre o NeoAssist</h3>
                  <p>Assistente inteligente especializado em análise financeira B2B da LavandeRio, uma rede de lavanderias com 30 clientes ativos.</p>
                  <p>Sistema RAG integrado para consultas contextuais sobre métricas financeiras, inadimplência e estratégias de cobrança.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto" role="main" aria-label="Área de mensagens">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-8 animate-pulse-slow">
              <Bot className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-neutral-900">Como posso ajudar você?</h2>
            <div className="flex flex-col space-y-3 w-full max-w-2xl">
              <button
                onClick={() => setInput('Como está a situação atual da LavandeRio?')}
                className="p-4 text-left border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
              >
                <div className="text-sm font-medium text-neutral-700">Como está a situação atual da LavandeRio?</div>
              </button>
              <button
                onClick={() => setInput('Quais clientes precisam de atenção prioritária?')}
                className="p-4 text-left border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
              >
                <div className="text-sm font-medium text-neutral-700">Quais clientes precisam de atenção prioritária?</div>
              </button>
              <button
                onClick={() => setInput('Gera um gráfico de quantidade de empresas por setor')}
                className="p-4 text-left border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
              >
                <div className="text-sm font-medium text-neutral-700">Gera um gráfico de quantidade de empresas por setor</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "py-8 animate-fade-in",
                  message.role === 'assistant' ? 'bg-transparent' : 'bg-transparent'
                )}
              >
                <div className={cn(
                  "flex gap-4 max-w-full",
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}>
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
                      message.role === 'assistant' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-neutral-700 text-white'
                    )}>
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  <div className={cn(
                    "flex-1 min-w-0 space-y-2",
                    message.role === 'user' ? 'text-right' : ''
                  )}>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {message.role === 'assistant' ? 'NeoAssist' : 'Você'}
                    </div>
                    <div className={cn(
                      "prose prose-sm max-w-none",
                      message.role === 'assistant' 
                        ? 'text-neutral-800' 
                        : 'text-neutral-700'
                    )}>
                      <div className="whitespace-pre-wrap leading-relaxed font-medium">
                        {message.content}
                      </div>
                      
                      {/* Botão para gerar gráfico */}
                      {message.role === 'assistant' && message.chartable && !message.chartData && (
                        <div className="mt-4 pt-3 border-t border-neutral-200">
                          <Button
                            onClick={() => generateChart(message.id, message.content)}
                            disabled={loadingChart === message.id}
                            variant="outline"
                            size="sm"
                            className="text-primary-600 border-primary-300 hover:bg-primary-50"
                          >
                            {loadingChart === message.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2" />
                                Gerando...
                              </>
                            ) : (
                              <>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                📊 Gerar Gráfico
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      
                      {/* Mostrar gráfico se disponível */}
                      {message.chartData && (
                        <div className="mt-4">
                          <ChartContainer chartData={message.chartData} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="py-8 animate-fade-in">
                <div className="flex gap-4 max-w-full">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      NeoAssist
                    </div>
                    <div className="flex space-x-1 items-center">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Modern Input Area */}
      <div className="border-t border-neutral-200/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre a LavandeRio, seus clientes, métricas financeiras, tendências..."
                disabled={isLoading}
                rows={1}
                aria-label="Digite sua pergunta"
                aria-describedby="input-help"
                className="w-full resize-none border border-neutral-300 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 disabled:opacity-50 max-h-40 shadow-sm placeholder:text-neutral-400 bg-white/90"
                style={{ minHeight: '52px' }}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              aria-label={isLoading ? "Enviando mensagem..." : "Enviar mensagem"}
              className="self-end h-[52px] px-5"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">{isLoading ? "Enviando..." : "Enviar"}</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}