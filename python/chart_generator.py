#!/usr/bin/env python3
import pandas as pd
import json
import argparse
import sys
import os
from datetime import datetime

def load_datasets():
    """Carrega todos os datasets disponíveis"""
    try:
        base_path = os.path.dirname(os.path.abspath(__file__))
        
        # Carregar datasets
        clientes_df = pd.read_csv(os.path.join(base_path, 'data', 'clientes_lavanderio.csv'))
        metricas_df = pd.read_csv(os.path.join(base_path, 'data', 'metricas_lavanderio.csv'))
        transacoes_df = pd.read_csv(os.path.join(base_path, 'data', 'transacoes_financeiras.csv'))
        
        return clientes_df, metricas_df, transacoes_df
    except Exception as e:
        print(f"Erro ao carregar datasets: {str(e)}", file=sys.stderr)
        return None, None, None

def generate_temporal_chart(chart_type, query=""):
    """Gera dados para gráficos temporais (line/area)"""
    clientes_df, metricas_df, transacoes_df = load_datasets()
    
    if metricas_df is None:
        return None
    
    # Verificar se é gráfico com múltiplas linhas
    is_multi_line = ('faturamento' in query.lower() and 'inadimpl' in query.lower()) or \
                   ('receita' in query.lower() and 'inadimpl' in query.lower()) or \
                   ('duas linhas' in query.lower()) or \
                   (' e ' in query.lower() and ('receita' in query.lower() or 'faturamento' in query.lower()))
    
    # Dados de evolução mensal
    chart_data = []
    for _, row in metricas_df.iterrows():
        mes_nome = {
            '2023-10': 'Out 2023',
            '2023-11': 'Nov 2023', 
            '2023-12': 'Dez 2023',
            '2024-01': 'Jan 2024'
        }.get(row['mes_ano'], row['mes_ano'])
        
        if is_multi_line:
            # Gráfico com múltiplas séries
            chart_data.append({
                'name': mes_nome,
                'Faturamento': float(row['receita_total']),
                'Taxa_Inadimplencia': float(row['taxa_inadimplencia'])
            })
            title = 'Evolução do Faturamento e Taxa de Inadimplência'
            description = 'Comparação mensal entre faturamento (R$) e taxa de inadimplência (%)'
        elif 'receita' in query.lower() or 'faturamento' in query.lower():
            chart_data.append({
                'name': mes_nome,
                'value': float(row['receita_total'])
            })
            title = 'Evolução da Receita Total'
            description = 'Receita mensal da LavandeRio ao longo do tempo'
        elif 'inadimpl' in query.lower():
            chart_data.append({
                'name': mes_nome,
                'value': float(row['taxa_inadimplencia'])
            })
            title = 'Evolução da Taxa de Inadimplência'
            description = 'Taxa de inadimplência mensal (%)'
        elif 'churn' in query.lower():
            chart_data.append({
                'name': mes_nome,
                'value': float(row['churn_rate'])
            })
            title = 'Evolução do Churn Rate'
            description = 'Taxa de cancelamento mensal (%)'
        elif 'ticket' in query.lower():
            chart_data.append({
                'name': mes_nome,
                'value': float(row['ticket_medio'])
            })
            title = 'Evolução do Ticket Médio'
            description = 'Ticket médio mensal'
        else:
            # Default para receita
            chart_data.append({
                'name': mes_nome,
                'value': float(row['receita_total'])
            })
            title = 'Evolução da Receita Total'
            description = 'Receita mensal da LavandeRio'
    
    return {
        'type': chart_type,
        'data': chart_data,
        'title': title,
        'description': description
    }

def generate_distribution_chart(query=""):
    """Gera dados para gráficos de distribuição (pie)"""
    clientes_df, metricas_df, transacoes_df = load_datasets()
    
    if clientes_df is None:
        return None
    
    if 'setor' in query.lower():
        # Verificar se é quantidade ou faturamento
        if 'quantidade' in query.lower() or 'quantas' in query.lower() or 'número' in query.lower():
            # Quantidade de empresas por setor
            setor_count = clientes_df['setor_cliente'].value_counts().reset_index()
            setor_count.columns = ['setor_cliente', 'count']
            
            chart_data = []
            for _, row in setor_count.iterrows():
                chart_data.append({
                    'name': row['setor_cliente'].title(),
                    'value': int(row['count'])
                })
            
            return {
                'type': 'pie',
                'data': chart_data,
                'title': 'Quantidade de Empresas por Setor',
                'description': 'Número de clientes distribuídos por setor de atividade'
            }
        else:
            # Distribuição por faturamento
            setor_stats = clientes_df.groupby('setor_cliente').agg({
                'faturamento_mensal': 'sum'
            }).reset_index()
            
            chart_data = []
            for _, row in setor_stats.iterrows():
                chart_data.append({
                    'name': row['setor_cliente'].title(),
                    'value': float(row['faturamento_mensal'])
                })
            
            return {
                'type': 'pie',
                'data': chart_data,
                'title': 'Distribuição por Setor',
                'description': 'Faturamento total por setor de atividade'
            }
    
    elif 'plano' in query.lower():
        # Verificar se é quantidade ou faturamento
        if 'quantidade' in query.lower() or 'quantas' in query.lower() or 'número' in query.lower():
            # Quantidade de empresas por plano
            plano_count = clientes_df['plano_servico'].value_counts().reset_index()
            plano_count.columns = ['plano_servico', 'count']
            
            chart_data = []
            for _, row in plano_count.iterrows():
                chart_data.append({
                    'name': row['plano_servico'],
                    'value': int(row['count'])
                })
            
            return {
                'type': 'pie',
                'data': chart_data,
                'title': 'Quantidade de Empresas por Plano',
                'description': 'Número de clientes distribuídos por tipo de plano'
            }
        else:
            # Distribuição por faturamento
            plano_stats = clientes_df.groupby('plano_servico').agg({
                'faturamento_mensal': 'sum'
            }).reset_index()
            
            chart_data = []
            for _, row in plano_stats.iterrows():
                chart_data.append({
                    'name': row['plano_servico'],
                    'value': float(row['faturamento_mensal'])
                })
            
            return {
                'type': 'pie',
                'data': chart_data,
                'title': 'Distribuição por Plano',
                'description': 'Faturamento total por tipo de plano'
            }
    
    elif 'regi' in query.lower():
        # Verificar se é quantidade ou faturamento
        if 'quantidade' in query.lower() or 'quantas' in query.lower() or 'número' in query.lower():
            # Quantidade de empresas por região
            regiao_count = clientes_df['regiao'].value_counts().reset_index()
            regiao_count.columns = ['regiao', 'count']
            
            chart_data = []
            for _, row in regiao_count.iterrows():
                chart_data.append({
                    'name': row['regiao'].replace('_', ' ').title(),
                    'value': int(row['count'])
                })
            
            return {
                'type': 'pie',
                'data': chart_data,
                'title': 'Quantidade de Empresas por Região',
                'description': 'Número de clientes distribuídos por região do Rio de Janeiro'
            }
        else:
            # Distribuição por faturamento
            regiao_stats = clientes_df.groupby('regiao').agg({
                'faturamento_mensal': 'sum'
            }).reset_index()
            
            chart_data = []
            for _, row in regiao_stats.iterrows():
                chart_data.append({
                    'name': row['regiao'].replace('_', ' ').title(),
                    'value': float(row['faturamento_mensal'])
                })
            
            return {
                'type': 'pie',
                'data': chart_data,
                'title': 'Distribuição por Região',
                'description': 'Faturamento total por região do Rio de Janeiro'
            }
    
    else:
        # Default: distribuição por setor
        setor_stats = clientes_df.groupby('setor_cliente').agg({
            'faturamento_mensal': 'sum'
        }).reset_index()
        
        chart_data = []
        for _, row in setor_stats.iterrows():
            chart_data.append({
                'name': row['setor_cliente'].title(),
                'value': float(row['faturamento_mensal'])
            })
        
        return {
            'type': 'pie',
            'data': chart_data,
            'title': 'Distribuição por Setor',
            'description': 'Faturamento total por setor de atividade'
        }

def generate_ranking_chart(query=""):
    """Gera dados para gráficos de ranking (bar)"""
    clientes_df, metricas_df, transacoes_df = load_datasets()
    
    if clientes_df is None:
        return None
    
    if 'top' in query.lower() or 'maior' in query.lower():
        # Top clientes por faturamento
        top_clientes = clientes_df.nlargest(10, 'faturamento_mensal')
        
        chart_data = []
        for _, row in top_clientes.iterrows():
            # Simplificar nome da empresa
            nome_simples = row['razao_social'].split()[0:2]
            nome_display = ' '.join(nome_simples)
            
            chart_data.append({
                'name': nome_display,
                'value': float(row['faturamento_mensal'])
            })
        
        return {
            'type': 'bar',
            'data': chart_data,
            'title': 'Top 10 Clientes por Faturamento',
            'description': 'Ranking dos clientes com maior faturamento mensal'
        }
    
    elif 'atraso' in query.lower():
        # Clientes com maior atraso
        clientes_atraso = clientes_df[clientes_df['dias_atraso'] > 0].nlargest(10, 'dias_atraso')
        
        chart_data = []
        for _, row in clientes_atraso.iterrows():
            nome_simples = row['razao_social'].split()[0:2]
            nome_display = ' '.join(nome_simples)
            
            chart_data.append({
                'name': nome_display,
                'value': int(row['dias_atraso'])
            })
        
        return {
            'type': 'bar',
            'data': chart_data,
            'title': 'Clientes com Maior Atraso',
            'description': 'Ranking por dias de atraso no pagamento'
        }
    
    elif 'score' in query.lower():
        # Ranking por score Neofin
        top_scores = clientes_df.nlargest(10, 'score_neofin')
        
        chart_data = []
        for _, row in top_scores.iterrows():
            nome_simples = row['razao_social'].split()[0:2]
            nome_display = ' '.join(nome_simples)
            
            chart_data.append({
                'name': nome_display,
                'value': int(row['score_neofin'])
            })
        
        return {
            'type': 'bar',
            'data': chart_data,
            'title': 'Top 10 Clientes por Score Neofin',
            'description': 'Ranking dos clientes com melhor score de crédito'
        }
    
    else:
        # Default: top faturamento
        top_clientes = clientes_df.nlargest(8, 'faturamento_mensal')
        
        chart_data = []
        for _, row in top_clientes.iterrows():
            nome_simples = row['razao_social'].split()[0:2]
            nome_display = ' '.join(nome_simples)
            
            chart_data.append({
                'name': nome_display,
                'value': float(row['faturamento_mensal'])
            })
        
        return {
            'type': 'bar',
            'data': chart_data,
            'title': 'Top 8 Clientes por Faturamento',
            'description': 'Ranking dos principais clientes da LavandeRio'
        }

def generate_chart_data(chart_type, query=""):
    """Função principal para gerar dados do gráfico"""
    try:
        if chart_type in ['line', 'area']:
            return generate_temporal_chart(chart_type, query)
        elif chart_type == 'pie':
            return generate_distribution_chart(query)
        elif chart_type == 'bar':
            return generate_ranking_chart(query)
        else:
            return None
    except Exception as e:
        print(f"Erro ao gerar dados do gráfico: {str(e)}", file=sys.stderr)
        return None

def main():
    parser = argparse.ArgumentParser(description='Gerador de dados para gráficos')
    parser.add_argument('--type', required=True, help='Tipo do gráfico (line, bar, pie, area)')
    parser.add_argument('--query', default="", help='Query do usuário para contexto')
    parser.add_argument('--data', help='Caminho para o arquivo de dados (compatibilidade)')
    
    args = parser.parse_args()
    
    chart_data = generate_chart_data(args.type, args.query)
    
    if chart_data:
        result = {
            'success': True,
            'chartData': chart_data
        }
    else:
        result = {
            'success': False,
            'error': 'Não foi possível gerar dados para o gráfico'
        }
    
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()