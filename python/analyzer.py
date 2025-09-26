#!/usr/bin/env python3
"""
NeoAssist Data Analyzer com Sistema RAG
Script para análise de dados de cobrança e inadimplência da LavandeRio
"""

import pandas as pd
import numpy as np
import json
import argparse
import sys
import os
from datetime import datetime, timedelta
from rag_system import LavandeRioRAG

class CollectionAnalyzer:
    def __init__(self, data_path):
        """Inicializa o analisador com dados da LavandeRio"""
        try:
            # Usar o novo dataset da LavandeRio
            data_dir = os.path.dirname(data_path)
            self.df = pd.read_csv(os.path.join(data_dir, "clientes_lavanderio.csv"))
            self.transacoes_df = pd.read_csv(os.path.join(data_dir, "transacoes_financeiras.csv"))
            self.metricas_df = pd.read_csv(os.path.join(data_dir, "metricas_lavanderio.csv"))
            
            # Inicializar sistema RAG
            self.rag = LavandeRioRAG(data_dir)
            
            self.validate_data()
        except Exception as e:
            raise Exception(f"Erro ao carregar dados: {str(e)}")
    
    def validate_data(self):
        """Valida se os dados têm as colunas necessárias"""
        required_columns = [
            'customer_id', 'razao_social', 'faturamento_mensal', 'dias_atraso',
            'setor_cliente', 'score_neofin', 'canal_contato', 'status_conta'
        ]
        
        missing_columns = [col for col in required_columns if col not in self.df.columns]
        if missing_columns:
            raise Exception(f"Colunas obrigatórias não encontradas: {missing_columns}")
    
    def get_summary_stats(self):
        """Retorna estatísticas resumidas da carteira LavandeRio"""
        total_clients = len(self.df)
        total_revenue = self.df['faturamento_mensal'].sum()
        avg_revenue = self.df['faturamento_mensal'].mean()
        avg_delay = self.df['dias_atraso'].mean()
        
        # Segmentação por risco (baseado em dias de atraso)
        high_risk = len(self.df[self.df['dias_atraso'] > 60])
        medium_risk = len(self.df[(self.df['dias_atraso'] > 30) & (self.df['dias_atraso'] <= 60)])
        low_risk = len(self.df[self.df['dias_atraso'] <= 30])
        
        # Distribuição por status de conta
        status_distribution = self.df['status_conta'].value_counts().to_dict()
        
        # Setores com maior faturamento
        sector_analysis = self.df.groupby('setor_cliente').agg({
            'faturamento_mensal': 'sum',
            'dias_atraso': 'mean',
            'score_neofin': 'mean'
        }).sort_values('faturamento_mensal', ascending=False).head(5)
        
        # Análise por plano de serviço
        plan_analysis = self.df.groupby('plano_servico').agg({
            'faturamento_mensal': ['sum', 'mean', 'count'],
            'dias_atraso': 'mean'
        }).round(2)
        
        # Converter para formato serializável
        plan_dict = {}
        for plan in plan_analysis.index:
            plan_dict[plan] = {
                'total_revenue': float(plan_analysis.loc[plan, ('faturamento_mensal', 'sum')]),
                'avg_revenue': float(plan_analysis.loc[plan, ('faturamento_mensal', 'mean')]),
                'client_count': int(plan_analysis.loc[plan, ('faturamento_mensal', 'count')]),
                'avg_delay': float(plan_analysis.loc[plan, ('dias_atraso', 'mean')])
            }
        
        # Últimas métricas disponíveis
        latest_metrics = self.metricas_df.iloc[-1] if len(self.metricas_df) > 0 else None
        
        return {
            'total_clients': int(total_clients),
            'total_monthly_revenue': float(total_revenue),
            'avg_monthly_revenue': float(avg_revenue),
            'avg_delay': float(avg_delay),
            'risk_segmentation': {
                'high_risk': int(high_risk),
                'medium_risk': int(medium_risk),
                'low_risk': int(low_risk)
            },
            'status_distribution': status_distribution,
            'top_sectors_by_revenue': sector_analysis.to_dict('index'),
            'plan_analysis': plan_dict,
            'latest_metrics': {
                'taxa_inadimplencia': float(latest_metrics['taxa_inadimplencia']) if latest_metrics is not None else 0,
                'receita_total': float(latest_metrics['receita_total']) if latest_metrics is not None else 0,
                'churn_rate': float(latest_metrics['churn_rate']) if latest_metrics is not None else 0,
                'margem_bruta': float(latest_metrics['margem_bruta']) if latest_metrics is not None else 0
            },
            'analysis_timestamp': datetime.now().isoformat(),
            'empresa': 'LavandeRio - Soluções em Lavanderia Especializada'
        }
    
    def analyze_priority_clients(self):
        """Identifica clientes prioritários para cobrança LavandeRio"""
        # Score de prioridade baseado em faturamento, atraso e score Neofin
        df_copy = self.df.copy()
        
        # Normalizar valores para o cálculo
        max_revenue = df_copy['faturamento_mensal'].max()
        max_delay = df_copy['dias_atraso'].max() if df_copy['dias_atraso'].max() > 0 else 1
        
        # Calcular score de prioridade (maior = mais prioritário)
        df_copy['priority_score'] = (
            (df_copy['faturamento_mensal'] / max_revenue) * 0.4 +  # Impacto financeiro
            (df_copy['dias_atraso'] / max_delay) * 0.4 +           # Urgência
            ((1000 - df_copy['score_neofin']) / 1000) * 0.2       # Risco (score baixo = mais risco)
        )
        
        # Filtrar apenas clientes com atraso ou inadimplentes
        problematic_clients = df_copy[
            (df_copy['dias_atraso'] > 0) | (df_copy['status_conta'] == 'inadimplente')
        ].copy()
        
        if len(problematic_clients) == 0:
            return {
                'priority_clients': [],
                'total_priority_revenue': 0,
                'avg_priority_delay': 0,
                'analysis_timestamp': datetime.now().isoformat(),
                'message': 'Nenhum cliente com pendências encontrado'
            }
        
        priority_clients = problematic_clients.nlargest(10, 'priority_score')[
            ['customer_id', 'razao_social', 'faturamento_mensal', 'dias_atraso', 
             'status_conta', 'score_neofin', 'setor_cliente', 'canal_contato', 'priority_score']
        ]
        
        return {
            'priority_clients': priority_clients.to_dict('records'),
            'total_priority_revenue': float(priority_clients['faturamento_mensal'].sum()),
            'avg_priority_delay': float(priority_clients['dias_atraso'].mean()),
            'priority_by_sector': priority_clients['setor_cliente'].value_counts().to_dict(),
            'analysis_timestamp': datetime.now().isoformat(),
            'empresa': 'LavandeRio'
        }
    
    def analyze_collection_strategies(self):
        """Sugere estratégias de cobrança por segmento"""
        strategies = {}
        
        # Segmentação por dias de atraso
        segments = {
            'early_stage': self.df[self.df['dias_atraso'] <= 30],
            'middle_stage': self.df[(self.df['dias_atraso'] > 30) & (self.df['dias_atraso'] <= 60)],
            'late_stage': self.df[self.df['dias_atraso'] > 60]
        }
        
        for segment_name, segment_data in segments.items():
            if len(segment_data) > 0:
                preferred_channels = segment_data['canal_preferido'].value_counts().head(3).to_dict()
                avg_score = segment_data['score_credito'].mean()
                total_value = segment_data['valor_devido'].sum()
                
                strategies[segment_name] = {
                    'client_count': len(segment_data),
                    'total_debt': float(total_value),
                    'avg_credit_score': float(avg_score),
                    'preferred_channels': preferred_channels,
                    'recommended_approach': self._get_strategy_recommendation(segment_name, avg_score)
                }
        
        return {
            'strategies_by_segment': strategies,
            'analysis_timestamp': datetime.now().isoformat()
        }
    
    def rag_query(self, query):
        """Método especial para consultas RAG"""
        try:
            context = self.rag.get_context_for_query(query)
            return {
                'query': query,
                'context': context,
                'analysis_timestamp': datetime.now().isoformat(),
                'type': 'rag_query'
            }
        except Exception as e:
            return {
                'query': query,
                'context': f"Erro na consulta RAG: {str(e)}",
                'analysis_timestamp': datetime.now().isoformat(),
                'type': 'rag_error'
            }
    
    def _get_strategy_recommendation(self, segment, avg_score):
        """Retorna recomendação de estratégia baseada no segmento e score"""
        if segment == 'early_stage':
            if avg_score > 600:
                return "Abordagem amigável via canal preferido. Lembrete cortês com facilidades de pagamento."
            else:
                return "Contato proativo com proposta de parcelamento. Acompanhamento semanal."
        
        elif segment == 'middle_stage':
            if avg_score > 500:
                return "Negociação ativa com desconto para pagamento à vista. Contato telefônico direto."
            else:
                return "Ação intensiva com plano de pagamento estruturado. Acompanhamento rigoroso."
        
        else:  # late_stage
            if avg_score > 400:
                return "Negociação agressiva com descontos significativos. Último aviso antes de ação legal."
            else:
                return "Preparação para ação judicial. Última chance de acordo extrajudicial."
    
    def generate_recovery_insights(self):
        """Gera insights sobre potencial de recuperação"""
        # Análise por porte da empresa
        size_analysis = self.df.groupby('porte').agg({
            'valor_devido': ['sum', 'mean', 'count'],
            'score_credito': 'mean',
            'dias_atraso': 'mean'
        }).round(2)
        
        # Correlação entre score de crédito e valor devido
        correlation = self.df['score_credito'].corr(self.df['valor_devido'])
        
        # Estimativa de recuperação baseada em histórico
        recovery_rates = {
            'bom_pagador': 0.85,
            'regular': 0.65,
            'mal_pagador': 0.35
        }
        
        self.df['estimated_recovery'] = self.df.apply(
            lambda row: row['valor_devido'] * recovery_rates.get(row['historico_pagamento'], 0.5),
            axis=1
        )
        
        total_estimated_recovery = self.df['estimated_recovery'].sum()
        recovery_by_segment = self.df.groupby('historico_pagamento')['estimated_recovery'].sum().to_dict()
        
        return {
            'size_analysis': size_analysis.to_dict(),
            'credit_score_correlation': float(correlation),
            'estimated_total_recovery': float(total_estimated_recovery),
            'recovery_by_payment_history': recovery_by_segment,
            'recovery_rate_assumptions': recovery_rates,
            'analysis_timestamp': datetime.now().isoformat()
        }

def main():
    parser = argparse.ArgumentParser(description='NeoAssist Data Analyzer com RAG')
    parser.add_argument('--type', required=True, choices=['summary', 'priority', 'strategies', 'insights', 'rag'],
                        help='Tipo de análise a ser executada')
    parser.add_argument('--data', required=True, help='Caminho para o arquivo CSV de dados')
    parser.add_argument('--query', help='Query para busca RAG (obrigatório quando type=rag)')
    
    args = parser.parse_args()
    
    try:
        analyzer = CollectionAnalyzer(args.data)
        
        if args.type == 'summary':
            result = analyzer.get_summary_stats()
        elif args.type == 'priority':
            result = analyzer.analyze_priority_clients()
        elif args.type == 'strategies':
            result = analyzer.analyze_collection_strategies()
        elif args.type == 'insights':
            result = analyzer.generate_recovery_insights()
        elif args.type == 'rag':
            if not args.query:
                raise Exception("Query é obrigatória para análise RAG. Use --query 'sua pergunta'")
            result = analyzer.rag_query(args.query)
        
        # Output como JSON para integração com Next.js
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }
        print(json.dumps(error_result, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()