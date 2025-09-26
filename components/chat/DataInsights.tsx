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
      <Card className="glass">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchSummary} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading || !summaryData) {
    return (
      <Card className="glass">
        <CardContent className="p-6">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Carregando insights...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const riskData = summaryData.risk_segmentation
  const totalClients = riskData.high_risk + riskData.medium_risk + riskData.low_risk
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Visão Geral da Carteira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Total de Clientes:</span>
                <span className="text-sm font-medium">{summaryData.total_clients}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Valor Total:</span>
                <span className="text-sm font-medium">{formatCurrency(summaryData.total_debt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Ticket Médio:</span>
                <span className="text-sm font-medium">{formatCurrency(summaryData.avg_debt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Atraso Médio:</span>
                <span className="text-sm font-medium">{Math.round(summaryData.avg_delay)} dias</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-secondary" />
              Segmentação de Risco
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
        <Button onClick={fetchSummary} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>
    </div>
  )
}