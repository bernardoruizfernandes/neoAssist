'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, AlertTriangle, Target, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SummaryData {
  total_clients: number
  total_debt: number
  avg_debt: number
  avg_delay: number
  risk_segmentation: {
    high_risk: number
    medium_risk: number
    low_risk: number
  }
  payment_history_distribution: Record<string, number>
  top_sectors_by_debt: Record<string, {
    valor_devido: number
    dias_atraso: number
  }>
}

export function DataInsights() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/analyze')
      if (!response.ok) {
        throw new Error('Erro ao buscar dados')
      }
      
      const data = await response.json()
      setSummaryData(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  if (error) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-neutral-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-accent-500 mx-auto mb-2" />
            <p className="text-sm text-neutral-600 mb-4">{error}</p>
            <Button 
              onClick={fetchSummary} 
              size="sm" 
              variant="outline"
              aria-label="Tentar carregar dados novamente"
            >
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading || !summaryData) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-neutral-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
            <p className="text-sm text-neutral-600">Carregando insights...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const riskData = summaryData.risk_segmentation
  const totalClients = riskData.high_risk + riskData.medium_risk + riskData.low_risk
  
  return (
    <section className="space-y-6" aria-label="Insights dos dados" role="region">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-neutral-800">Visão Geral da Carteira</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Total de Clientes:</span>
                <span className="text-base font-semibold text-neutral-800">{summaryData.total_clients}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Valor Total:</span>
                <span className="text-base font-semibold text-primary-600">{formatCurrency(summaryData.total_debt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Ticket Médio:</span>
                <span className="text-base font-semibold text-neutral-800">{formatCurrency(summaryData.avg_debt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Atraso Médio:</span>
                <span className="text-base font-semibold text-accent-600">{Math.round(summaryData.avg_delay)} dias</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-neutral-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="text-neutral-800">Segmentação de Risco</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-red-600">Alto Risco (&gt;60 dias)</span>
                  <span className="font-medium">{riskData.high_risk} clientes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-red-500 h-1.5 rounded-full" 
                    style={{ width: `${(riskData.high_risk / totalClients) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-yellow-600">Médio Risco (30-60 dias)</span>
                  <span className="font-medium">{riskData.medium_risk} clientes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-yellow-500 h-1.5 rounded-full" 
                    style={{ width: `${(riskData.medium_risk / totalClients) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">Baixo Risco (&lt;30 dias)</span>
                  <span className="font-medium">{riskData.low_risk} clientes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full" 
                    style={{ width: `${(riskData.low_risk / totalClients) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            Top 5 Setores por Dívida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(summaryData.top_sectors_by_debt).map(([sector, data]) => (
              <div key={sector} className="flex items-center justify-between py-1">
                <div className="flex-1">
                  <span className="text-sm font-medium capitalize">{sector}</span>
                  <div className="text-xs text-gray-500">
                    {Math.round(data.dias_atraso)} dias de atraso médio
                  </div>
                </div>
                <div className="text-sm font-medium text-right">
                  {formatCurrency(data.valor_devido)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button 
          onClick={fetchSummary} 
          variant="outline" 
          size="sm" 
          className="hover:scale-105"
          aria-label="Atualizar dados dos insights"
        >
          <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
          Atualizar Dados
        </Button>
      </div>
    </section>
  )
}