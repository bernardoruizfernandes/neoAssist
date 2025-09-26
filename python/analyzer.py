#!/usr/bin/env python3
"""
NeoAssist Data Analyzer
Script para análise de dados de cobrança e inadimplência
"""

import pandas as pd
import numpy as np
import json
import argparse
import sys
from datetime import datetime, timedelta

class CollectionAnalyzer:
    def __init__(self, data_path):
        """Inicializa o analisador com dados de clientes"""
        try:
            self.df = pd.read_csv(data_path)
            self.validate_data()
        except Exception as e:
            raise Exception(f"Erro ao carregar dados: {str(e)}")
    
    def validate_data(self):
        """Valida se os dados têm as colunas necessárias"""
        required_columns = [
            'cliente_id', 'nome_empresa', 'valor_devido', 'dias_atraso',
            'historico_pagamento', 'setor', 'porte', 'score_credito', 'canal_preferido'
        ]
        
        missing_columns = [col for col in required_columns if col not in self.df.columns]
        if missing_columns:
            raise Exception(f"Colunas obrigatórias não encontradas: {missing_columns}")
    
    def get_summary_stats(self):
        """Retorna estatísticas resumidas da carteira"""
        total_clients = len(self.df)
        total_debt = self.df['valor_devido'].sum()
        avg_debt = self.df['valor_devido'].mean()
        avg_delay = self.df['dias_atraso'].mean()
        
        # Segmentação por risco
        high_risk = len(self.df[self.df['dias_atraso'] > 60])
        medium_risk = len(self.df[(self.df['dias_atraso'] > 30) & (self.df['dias_atraso'] <= 60)])
        low_risk = len(self.df[self.df['dias_atraso'] <= 30])
        
        # Distribuição por histórico
        payment_history = self.df['historico_pagamento'].value_counts().to_dict()
        
        # Setores mais inadimplentes
        sector_analysis = self.df.groupby('setor').agg({
            'valor_devido': 'sum',
            'dias_atraso': 'mean'
        }).sort_values('valor_devido', ascending=False).head(5)
        
        return {
            'total_clients': int(total_clients),
            'total_debt': float(total_debt),
            'avg_debt': float(avg_debt),
            'avg_delay': float(avg_delay),
            'risk_segmentation': {
                'high_risk': int(high_risk),
                'medium_risk': int(medium_risk),
                'low_risk': int(low_risk)
            },
            'payment_history_distribution': payment_history,
            'top_sectors_by_debt': sector_analysis.to_dict('index'),
            'analysis_timestamp': datetime.now().isoformat()
        }
    
    def analyze_priority_clients(self):
        """Identifica clientes prioritários para cobrança"""
        # Score de prioridade baseado em valor, atraso e histórico
        priority_weights = {
            'mal_pagador': 3,
            'regular': 2,
            'bom_pagador': 1
        }
        
        self.df['priority_score'] = (
            self.df['valor_devido'] * 0.4 +
            self.df['dias_atraso'] * 50 * 0.4 +
            self.df['historico_pagamento'].map(priority_weights) * 1000 * 0.2
        )
        
        priority_clients = self.df.nlargest(10, 'priority_score')[
            ['cliente_id', 'nome_empresa', 'valor_devido', 'dias_atraso', 
             'historico_pagamento', 'score_credito', 'priority_score']
        ]
        
        return {
            'priority_clients': priority_clients.to_dict('records'),
            'total_priority_debt': float(priority_clients['valor_devido'].sum()),
            'avg_priority_delay': float(priority_clients['dias_atraso'].mean()),
            'analysis_timestamp': datetime.now().isoformat()
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
    parser = argparse.ArgumentParser(description='NeoAssist Data Analyzer')
    parser.add_argument('--type', required=True, choices=['summary', 'priority', 'strategies', 'insights'],
                        help='Tipo de análise a ser executada')
    parser.add_argument('--data', required=True, help='Caminho para o arquivo CSV de dados')
    
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