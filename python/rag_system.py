#!/usr/bin/env python3
"""
Sistema RAG simplificado para LavandeRio
Implementa busca semântica sem dependências complexas
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime

# Implementação simples de cosine similarity sem sklearn
def cosine_similarity_simple(a, b):
    """Calcula similaridade de cosseno entre dois vetores"""
    try:
        dot_product = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        return dot_product / (norm_a * norm_b) if norm_a != 0 and norm_b != 0 else 0
    except:
        return 0

# Versão simplificada sem OpenAI para MVP
class SimpleRAG:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        self.knowledge_base = []
        self.load_data()
    
    def get_context_for_query(self, query):
        """Busca baseada em keywords para MVP"""
        query_lower = query.lower()
        relevant_items = []
        
        # Busca por keywords relevantes
        keywords = {
            'situação': ['contexto_empresa', 'metricas_mensais'],
            'lavanderio': ['contexto_empresa'],
            'clientes': ['cliente_profile', 'setor_analysis'],
            'setor': ['setor_analysis'],
            'inadimplência': ['metricas_mensais'],
            'tendência': ['metricas_mensais'],
            'prioridade': ['cliente_profile'],
            'segmentação': ['setor_analysis'],
            'faturamento': ['cliente_profile', 'setor_analysis'],
            'receita': ['metricas_mensais']
        }
        
        target_types = set()
        for keyword, types in keywords.items():
            if keyword in query_lower:
                target_types.update(types)
        
        # Se não encontrou keywords específicas, retorna contexto geral
        if not target_types:
            target_types = {'contexto_empresa', 'metricas_mensais'}
        
        # Filtrar itens relevantes
        for item in self.knowledge_base:
            if item['metadata'].get('type') in target_types:
                relevant_items.append(item)
        
        # Limitar a 3 itens mais relevantes
        relevant_items = relevant_items[:3]
        
        # Combinar contextos
        context = "DADOS RELEVANTES DA LAVANDERIO:\n\n"
        for item in relevant_items:
            context += f"{item['content']}\n\n"
        
        return context if relevant_items else self._get_general_summary()
    
    def load_data(self):
        """Método base - implementado na subclasse"""
        pass
    
    def _get_general_summary(self):
        """Método base - implementado na subclasse"""
        return "Dados da LavandeRio carregados com sucesso."

class LavandeRioRAG(SimpleRAG):
    def __init__(self, data_dir="data"):
        super().__init__(data_dir)
        
    def load_data(self):
        """Carrega todos os dados da LavandeRio"""
        try:
            # Carregar clientes
            clientes_df = pd.read_csv(f"{self.data_dir}/clientes_lavanderio.csv")
            
            # Carregar transações 
            transacoes_df = pd.read_csv(f"{self.data_dir}/transacoes_financeiras.csv")
            
            # Carregar métricas
            metricas_df = pd.read_csv(f"{self.data_dir}/metricas_lavanderio.csv")
            
            # Carregar contexto
            with open(f"{self.data_dir}/contexto_lavanderio.json", 'r') as f:
                contexto = json.load(f)
            
            # Criar knowledge base estruturada
            self._create_knowledge_base(clientes_df, transacoes_df, metricas_df, contexto)
            
        except Exception as e:
            print(f"Erro ao carregar dados: {e}")
            
    def _create_knowledge_base(self, clientes, transacoes, metricas, contexto):
        """Cria base de conhecimento estruturada"""
        
        # 1. Resumos por cliente
        for _, cliente in clientes.iterrows():
            cliente_transacoes = transacoes[transacoes['customer_id'] == cliente['customer_id']]
            
            # Calcular métricas do cliente
            total_faturado = cliente_transacoes['valor_original'].sum()
            total_pago = cliente_transacoes['valor_pago'].sum()
            taxa_pagamento = (total_pago / total_faturado * 100) if total_faturado > 0 else 0
            
            knowledge_item = {
                "type": "cliente_profile",
                "content": f"""
                Cliente: {cliente['razao_social']} ({cliente['customer_id']})
                Setor: {cliente['setor_cliente']} | Região: {cliente['regiao']} | Plano: {cliente['plano_servico']}
                Faturamento Mensal: R$ {cliente['faturamento_mensal']:,.2f}
                Status: {cliente['status_conta']} | Score Neofin: {cliente['score_neofin']}
                Dias em Atraso: {cliente['dias_atraso']} | Canal Preferido: {cliente['canal_contato']}
                Histórico Financeiro: Total faturado R$ {total_faturado:,.2f}, Taxa de pagamento: {taxa_pagamento:.1f}%
                Tipo de Contrato: {cliente['tipo_contrato']}
                """,
                "metadata": {
                    "customer_id": cliente['customer_id'],
                    "setor": cliente['setor_cliente'],
                    "status": cliente['status_conta'],
                    "score": cliente['score_neofin'],
                    "atraso": cliente['dias_atraso']
                }
            }
            self.knowledge_base.append(knowledge_item)
        
        # 2. Análises por setor
        setores_analysis = clientes.groupby('setor_cliente').agg({
            'faturamento_mensal': ['sum', 'mean', 'count'],
            'dias_atraso': 'mean',
            'score_neofin': 'mean'
        }).round(2)
        
        for setor in setores_analysis.index:
            knowledge_item = {
                "type": "setor_analysis",
                "content": f"""
                Análise do Setor {setor.title()}:
                - Total de clientes: {setores_analysis.loc[setor, ('faturamento_mensal', 'count')]}
                - Faturamento total: R$ {setores_analysis.loc[setor, ('faturamento_mensal', 'sum')]:,.2f}
                - Ticket médio: R$ {setores_analysis.loc[setor, ('faturamento_mensal', 'mean')]:,.2f}
                - Dias atraso médio: {setores_analysis.loc[setor, ('dias_atraso', 'mean')]:.1f}
                - Score médio: {setores_analysis.loc[setor, ('score_neofin', 'mean')]:.0f}
                """,
                "metadata": {"setor": setor, "type": "setor"}
            }
            self.knowledge_base.append(knowledge_item)
            
        # 3. Métricas operacionais por mês
        for _, metrica in metricas.iterrows():
            knowledge_item = {
                "type": "metricas_mensais",
                "content": f"""
                Métricas {metrica['mes_ano']}:
                - Receita Total: R$ {metrica['receita_total']:,.2f}
                - Taxa Inadimplência: {metrica['taxa_inadimplencia']:.1f}%
                - CAC: R$ {metrica['cac']:,.2f} | LTV: R$ {metrica['ltv']:,.2f}
                - Churn Rate: {metrica['churn_rate']:.1f}%
                - Ticket Médio: R$ {metrica['ticket_medio']:,.2f}
                - Clientes Ativos: {metrica['clientes_ativos']}
                - Margem Bruta: {metrica['margem_bruta']:.1f}%
                """,
                "metadata": {"mes": metrica['mes_ano'], "type": "metricas"}
            }
            self.knowledge_base.append(knowledge_item)
            
        # 4. Contexto da empresa
        knowledge_item = {
            "type": "contexto_empresa",
            "content": f"""
            LavandeRio - Informações Gerais:
            Empresa: {contexto['empresa']['nome']} (fundada em {contexto['empresa']['fundacao']})
            Modelo de Negócio: {contexto['negocio']['modelo']}
            Segmentos Atendidos: {', '.join(contexto['negocio']['segmentos'])}
            Capacidade: {contexto['negocio']['capacidade_diaria']}
            
            Desafios Atuais:
            - Inadimplência cresceu de 8.5% para 16.7% (out/23 a jan/24)
            - Sazonalidade: queda de 20% entre dez-jan
            - Fluxo de caixa: 45 dias prazo vs 30 dias custo
            
            Solução Neofin implementada em setembro/2023 com módulos:
            {', '.join(contexto['solucao_neofin']['modulos'])}
            """,
            "metadata": {"type": "contexto"}
        }
        self.knowledge_base.append(knowledge_item)
        
    
    def _get_general_summary(self):
        """Retorna resumo geral quando busca específica falha"""
        try:
            # Carregando dados básicos
            clientes_df = pd.read_csv(f"{self.data_dir}/clientes_lavanderio.csv")
            metricas_df = pd.read_csv(f"{self.data_dir}/metricas_lavanderio.csv")
            
            latest_metrics = metricas_df.iloc[-1] if len(metricas_df) > 0 else None
            
            return f"""
SITUAÇÃO ATUAL DA LAVANDERIO:

📊 CARTEIRA DE CLIENTES:
- Total de clientes: {len(clientes_df)}
- Clientes ativos: {len(clientes_df[clientes_df['status_conta'] == 'ativo'])}
- Clientes inadimplentes: {len(clientes_df[clientes_df['status_conta'] == 'inadimplente'])}

💰 PERFORMANCE FINANCEIRA:
- Faturamento mensal: R$ {clientes_df['faturamento_mensal'].sum():,.2f}
- Ticket médio: R$ {clientes_df['faturamento_mensal'].mean():,.2f}
- Taxa de inadimplência: {latest_metrics['taxa_inadimplencia'] if latest_metrics is not None else 'N/A'}%
- Margem bruta: {latest_metrics['margem_bruta'] if latest_metrics is not None else 'N/A'}%

🏢 SEGMENTOS PRINCIPAIS:
- {', '.join(clientes_df['setor_cliente'].value_counts().head(3).index.tolist())}

⚠️ DESAFIOS ATUAIS:
- Inadimplência cresceu de 8.5% (out/23) para 16.7% (jan/24)
- Sazonalidade: queda de 20% entre dezembro e janeiro
- Fluxo de caixa: 45 dias prazo médio vs 30 dias custo operacional
            """
        except Exception as e:
            return f"Erro ao carregar dados: {str(e)}"

# Função para uso direto
def get_rag_context(query, data_dir="data"):
    """Função simplificada para obter contexto RAG"""
    try:
        rag = LavandeRioRAG(data_dir)
        return rag.get_context_for_query(query)
    except Exception as e:
        return f"Erro no sistema RAG: {str(e)}"