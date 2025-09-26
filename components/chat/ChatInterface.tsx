'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
      // Check for special commands that trigger Python analysis
      let analysisData = null
      if (currentInput.toLowerCase().includes('analis') || 
          currentInput.toLowerCase().includes('priorit') ||
          currentInput.toLowerCase().includes('estratég') ||
          currentInput.toLowerCase().includes('insight')) {
        
        let analysisType = 'summary'
        if (currentInput.toLowerCase().includes('priorit')) analysisType = 'priority'
        if (currentInput.toLowerCase().includes('estratég')) analysisType = 'strategies'
        if (currentInput.toLowerCase().includes('insight')) analysisType = 'insights'

        try {
          const analysisResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: {}, analysisType })
          })
          
          if (analysisResponse.ok) {
            const analysisResult = await analysisResponse.json()
            analysisData = analysisResult.analysis
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
          analysisData: analysisData
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
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

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-semibold text-center">NeoAssist</h1>
          <p className="text-sm text-gray-500 text-center">Assistente Inteligente para Automação Financeira</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Como posso ajudar você?</h2>
            <p className="text-gray-600 mb-8 text-lg max-w-3xl leading-relaxed">
              Sou especializado em automação financeira, análise de fluxo de caixa, gestão de contas a pagar/receber, otimização de processos e muito mais para empresas B2B.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-4xl">
              <button
                onClick={() => setInput('Analise o fluxo de caixa e projeções financeiras')}
                className="p-6 text-left bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="font-semibold text-gray-800 mb-2">💰 Análise de fluxo de caixa</div>
                <div className="text-sm text-gray-600">Projeções financeiras e otimização de capital de giro</div>
              </button>
              <button
                onClick={() => setInput('Como automatizar o processo de contas a pagar e receber?')}
                className="p-6 text-left bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="font-semibold text-gray-800 mb-2">⚡ Automação de processos</div>
                <div className="text-sm text-gray-600">Automatize contas a pagar, receber e conciliação bancária</div>
              </button>
              <button
                onClick={() => setInput('Analise os riscos de crédito e inadimplência dos clientes')}
                className="p-6 text-left bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="font-semibold text-gray-800 mb-2">🛡️ Gestão de risco</div>
                <div className="text-sm text-gray-600">Análise de crédito, prevenção de fraudes e gestão de inadimplência</div>
              </button>
              <button
                onClick={() => setInput('Gere relatórios financeiros e dashboards analíticos')}
                className="p-6 text-left bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="font-semibold text-gray-800 mb-2">📊 Relatórios inteligentes</div>
                <div className="text-sm text-gray-600">Dashboards analíticos e insights para tomada de decisão</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "border-b border-gray-200",
                  message.role === 'assistant' ? 'bg-white' : 'bg-gray-50'
                )}
              >
                <div className="flex gap-6 px-8 py-8 max-w-4xl mx-auto">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      message.role === 'assistant' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-800 text-white'
                    )}>
                      {message.role === 'assistant' ? (
                        <Bot className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="prose prose-lg max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="border-b border-gray-200 bg-white">
                <div className="flex gap-6 px-8 py-8 max-w-4xl mx-auto">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex space-x-2 items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta sobre automação financeira, fluxo de caixa, gestão de riscos ou otimização de processos..."
                disabled={isLoading}
                rows={1}
                className="w-full resize-none border border-gray-300 rounded-xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 max-h-40 shadow-sm"
                style={{ minHeight: '56px' }}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="self-end h-[56px] px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm transition-colors"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-3 text-center">
            NeoAssist pode fornecer análises baseadas em dados reais e soluções de automação financeira personalizadas.
          </p>
        </div>
      </div>
    </div>
  )
}