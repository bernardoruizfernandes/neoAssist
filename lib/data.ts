// Dados da LavandeRio estruturados para acesso direto pelo modelo
// Extraídos dos CSVs para garantir funcionamento no Vercel

export interface Cliente {
  customer_id: string
  razao_social: string
  cnpj: string
  plano_servico: 'Basic' | 'Standard' | 'Premium' | 'Enterprise'
  faturamento_mensal: number
  dias_atraso: number
  ultima_cobranca: string
  canal_contato: 'email' | 'whatsapp' | 'telefone' | 'sms'
  score_neofin: number
  status_conta: 'ativo' | 'inadimplente'
  setor_cliente: string
  regiao: string
  tipo_contrato: 'mensal' | 'trimestral' | 'semestral' | 'anual'
}

export interface Metrica {
  mes_ano: string
  receita_recorrente: number
  receita_total: number
  taxa_inadimplencia: number
  cac: number
  ltv: number
  churn_rate: number
  ticket_medio: number
  novos_clientes: number
  clientes_ativos: number
  margem_bruta: number
}

export interface Transacao {
  transaction_id: string
  customer_id: string
  data_vencimento: string
  valor_original: number
  valor_pago: number
  data_pagamento: string | null
  tipo_servico: string
  metodo_pagamento: string
  juros_aplicados: number
  status_transacao: 'pago' | 'em_atraso' | 'inadimplente'
  mes_competencia: string
}

export const clientes: Cliente[] = [
  {
    customer_id: "C001",
    razao_social: "Ribeiro",
    cnpj: "59.382.417/0001-09",
    plano_servico: "Premium",
    faturamento_mensal: 43306.29,
    dias_atraso: 0,
    ultima_cobranca: "2024-01-15",
    canal_contato: "email",
    score_neofin: 850,
    status_conta: "ativo",
    setor_cliente: "hotelaria",
    regiao: "zona_sul",
    tipo_contrato: "anual"
  },
  {
    customer_id: "C002",
    razao_social: "Silva",
    cnpj: "32.487.651/0001-44",
    plano_servico: "Standard",
    faturamento_mensal: 13622.57,
    dias_atraso: 6,
    ultima_cobranca: "2024-01-10",
    canal_contato: "whatsapp",
    score_neofin: 780,
    status_conta: "ativo",
    setor_cliente: "gastronomia",
    regiao: "centro",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C003",
    razao_social: "da Paz Teixeira - EI",
    cnpj: "98.213.560/0001-29",
    plano_servico: "Enterprise",
    faturamento_mensal: 90915.85,
    dias_atraso: 0,
    ultima_cobranca: "2024-01-12",
    canal_contato: "email",
    score_neofin: 920,
    status_conta: "ativo",
    setor_cliente: "saude",
    regiao: "tijuca",
    tipo_contrato: "anual"
  },
  {
    customer_id: "C004",
    razao_social: "Dias",
    cnpj: "64.018.327/0001-73",
    plano_servico: "Premium",
    faturamento_mensal: 28828.73,
    dias_atraso: 18,
    ultima_cobranca: "2023-12-28",
    canal_contato: "telefone",
    score_neofin: 690,
    status_conta: "ativo",
    setor_cliente: "hotelaria",
    regiao: "barra",
    tipo_contrato: "semestral"
  },
  {
    customer_id: "C005",
    razao_social: "Correia",
    cnpj: "91.230.867/0001-99",
    plano_servico: "Standard",
    faturamento_mensal: 7622.85,
    dias_atraso: 46,
    ultima_cobranca: "2023-12-01",
    canal_contato: "email",
    score_neofin: 520,
    status_conta: "inadimplente",
    setor_cliente: "saude",
    regiao: "copacabana",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C006",
    razao_social: "Cardoso",
    cnpj: "41.379.265/0001-20",
    plano_servico: "Premium",
    faturamento_mensal: 19729.56,
    dias_atraso: 4,
    ultima_cobranca: "2024-01-08",
    canal_contato: "whatsapp",
    score_neofin: 740,
    status_conta: "ativo",
    setor_cliente: "eventos",
    regiao: "leblon",
    tipo_contrato: "trimestral"
  },
  {
    customer_id: "C007",
    razao_social: "Jesus Moreira S/A",
    cnpj: "82.513.074/0001-96",
    plano_servico: "Enterprise",
    faturamento_mensal: 45106.1,
    dias_atraso: 0,
    ultima_cobranca: "2024-01-14",
    canal_contato: "email",
    score_neofin: 880,
    status_conta: "ativo",
    setor_cliente: "hotelaria",
    regiao: "barra",
    tipo_contrato: "anual"
  },
  {
    customer_id: "C008",
    razao_social: "da Paz",
    cnpj: "78.065.319/0001-92",
    plano_servico: "Standard",
    faturamento_mensal: 10543.6,
    dias_atraso: 25,
    ultima_cobranca: "2023-12-20",
    canal_contato: "telefone",
    score_neofin: 650,
    status_conta: "ativo",
    setor_cliente: "gastronomia",
    regiao: "ipanema",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C009",
    razao_social: "Novaes",
    cnpj: "98.472.513/0001-08",
    plano_servico: "Basic",
    faturamento_mensal: 3297.07,
    dias_atraso: 66,
    ultima_cobranca: "2023-11-20",
    canal_contato: "sms",
    score_neofin: 420,
    status_conta: "inadimplente",
    setor_cliente: "fitness",
    regiao: "tijuca",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C010",
    razao_social: "Farias",
    cnpj: "32.197.450/0001-02",
    plano_servico: "Standard",
    faturamento_mensal: 15936.33,
    dias_atraso: 20,
    ultima_cobranca: "2024-01-03",
    canal_contato: "email",
    score_neofin: 710,
    status_conta: "ativo",
    setor_cliente: "saude",
    regiao: "zona_norte",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C011",
    razao_social: "Porto S.A.",
    cnpj: "43.082.576/0001-58",
    plano_servico: "Premium",
    faturamento_mensal: 32534.66,
    dias_atraso: 0,
    ultima_cobranca: "2024-01-12",
    canal_contato: "email",
    score_neofin: 800,
    status_conta: "ativo",
    setor_cliente: "hotelaria",
    regiao: "centro",
    tipo_contrato: "anual"
  },
  {
    customer_id: "C012",
    razao_social: "da Mota Ltda.",
    cnpj: "26.780.153/0001-92",
    plano_servico: "Basic",
    faturamento_mensal: 5476.67,
    dias_atraso: 39,
    ultima_cobranca: "2023-12-10",
    canal_contato: "whatsapp",
    score_neofin: 480,
    status_conta: "ativo",
    setor_cliente: "gastronomia",
    regiao: "ipanema",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C013",
    razao_social: "Jesus - EI",
    cnpj: "47.506.189/0001-52",
    plano_servico: "Enterprise",
    faturamento_mensal: 71482.63,
    dias_atraso: 3,
    ultima_cobranca: "2024-01-16",
    canal_contato: "email",
    score_neofin: 900,
    status_conta: "ativo",
    setor_cliente: "saude",
    regiao: "barra",
    tipo_contrato: "anual"
  },
  {
    customer_id: "C014",
    razao_social: "Oliveira Dias e Filhos",
    cnpj: "28.750.193/0001-17",
    plano_servico: "Standard",
    faturamento_mensal: 16446.63,
    dias_atraso: 22,
    ultima_cobranca: "2023-12-25",
    canal_contato: "telefone",
    score_neofin: 620,
    status_conta: "ativo",
    setor_cliente: "hotelaria",
    regiao: "recreio",
    tipo_contrato: "semestral"
  },
  {
    customer_id: "C015",
    razao_social: "Porto Caldeira Ltda.",
    cnpj: "82.456.379/0001-03",
    plano_servico: "Premium",
    faturamento_mensal: 28945.52,
    dias_atraso: 0,
    ultima_cobranca: "2024-01-11",
    canal_contato: "email",
    score_neofin: 860,
    status_conta: "ativo",
    setor_cliente: "saude",
    regiao: "barra",
    tipo_contrato: "anual"
  },
  {
    customer_id: "C016",
    razao_social: "Vieira",
    cnpj: "62.701.893/0001-50",
    plano_servico: "Basic",
    faturamento_mensal: 5611.13,
    dias_atraso: 21,
    ultima_cobranca: "2023-12-18",
    canal_contato: "whatsapp",
    score_neofin: 580,
    status_conta: "ativo",
    setor_cliente: "gastronomia",
    regiao: "ipanema",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C017",
    razao_social: "Cardoso da Rosa Ltda.",
    cnpj: "54.671.028/0001-80",
    plano_servico: "Enterprise",
    faturamento_mensal: 67771.63,
    dias_atraso: 0,
    ultima_cobranca: "2024-01-13",
    canal_contato: "email",
    score_neofin: 940,
    status_conta: "ativo",
    setor_cliente: "hotelaria",
    regiao: "leblon",
    tipo_contrato: "anual"
  },
  {
    customer_id: "C018",
    razao_social: "Gomes S/A",
    cnpj: "54.920.673/0001-99",
    plano_servico: "Premium",
    faturamento_mensal: 28711.67,
    dias_atraso: 13,
    ultima_cobranca: "2024-01-08",
    canal_contato: "email",
    score_neofin: 760,
    status_conta: "ativo",
    setor_cliente: "saude",
    regiao: "barra",
    tipo_contrato: "trimestral"
  },
  {
    customer_id: "C019",
    razao_social: "Cavalcanti Carvalho Ltda.",
    cnpj: "75.406.293/0001-00",
    plano_servico: "Standard",
    faturamento_mensal: 10775.42,
    dias_atraso: 51,
    ultima_cobranca: "2023-12-05",
    canal_contato: "telefone",
    score_neofin: 510,
    status_conta: "inadimplente",
    setor_cliente: "gastronomia",
    regiao: "copacabana",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C020",
    razao_social: "Pinto S/A",
    cnpj: "84.152.906/0001-11",
    plano_servico: "Basic",
    faturamento_mensal: 5155.53,
    dias_atraso: 61,
    ultima_cobranca: "2023-11-25",
    canal_contato: "sms",
    score_neofin: 390,
    status_conta: "inadimplente",
    setor_cliente: "wellness",
    regiao: "zona_sul",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C021",
    razao_social: "Silva",
    cnpj: "34.106.952/0001-06",
    plano_servico: "Premium",
    faturamento_mensal: 42375.79,
    dias_atraso: 1,
    ultima_cobranca: "2024-01-14",
    canal_contato: "email",
    score_neofin: 820,
    status_conta: "ativo",
    setor_cliente: "hotelaria",
    regiao: "copacabana",
    tipo_contrato: "anual"
  },
  {
    customer_id: "C022",
    razao_social: "Cardoso",
    cnpj: "91.527.406/0001-82",
    plano_servico: "Standard",
    faturamento_mensal: 12039.95,
    dias_atraso: 16,
    ultima_cobranca: "2024-01-05",
    canal_contato: "whatsapp",
    score_neofin: 720,
    status_conta: "ativo",
    setor_cliente: "gastronomia",
    regiao: "santa_teresa",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C023",
    razao_social: "Pinto das Neves e Filhos",
    cnpj: "81.250.649/0001-62",
    plano_servico: "Enterprise",
    faturamento_mensal: 89076.12,
    dias_atraso: 7,
    ultima_cobranca: "2024-01-15",
    canal_contato: "email",
    score_neofin: 960,
    status_conta: "ativo",
    setor_cliente: "saude",
    regiao: "copacabana",
    tipo_contrato: "anual"
  },
  {
    customer_id: "C024",
    razao_social: "Pires",
    cnpj: "38.276.901/0001-83",
    plano_servico: "Basic",
    faturamento_mensal: 7487.29,
    dias_atraso: 30,
    ultima_cobranca: "2023-12-15",
    canal_contato: "telefone",
    score_neofin: 540,
    status_conta: "ativo",
    setor_cliente: "hotelaria",
    regiao: "zona_oeste",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C025",
    razao_social: "Silveira Castro e Filhos",
    cnpj: "75.819.260/0001-92",
    plano_servico: "Standard",
    faturamento_mensal: 8782.71,
    dias_atraso: 29,
    ultima_cobranca: "2023-12-22",
    canal_contato: "whatsapp",
    score_neofin: 640,
    status_conta: "ativo",
    setor_cliente: "fitness",
    regiao: "barra",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C026",
    razao_social: "da Luz da Mota - ME",
    cnpj: "06.893.215/0001-65",
    plano_servico: "Premium",
    faturamento_mensal: 37994.35,
    dias_atraso: 0,
    ultima_cobranca: "2024-01-10",
    canal_contato: "email",
    score_neofin: 890,
    status_conta: "ativo",
    setor_cliente: "saude",
    regiao: "leblon",
    tipo_contrato: "anual"
  },
  {
    customer_id: "C027",
    razao_social: "Ribeiro",
    cnpj: "36.195.027/0001-24",
    plano_servico: "Basic",
    faturamento_mensal: 4094.56,
    dias_atraso: 56,
    ultima_cobranca: "2023-11-28",
    canal_contato: "whatsapp",
    score_neofin: 450,
    status_conta: "inadimplente",
    setor_cliente: "gastronomia",
    regiao: "ipanema",
    tipo_contrato: "mensal"
  },
  {
    customer_id: "C028",
    razao_social: "Fernandes S.A.",
    cnpj: "94.018.527/0001-97",
    plano_servico: "Enterprise",
    faturamento_mensal: 58247.68,
    dias_atraso: 0,
    ultima_cobranca: "2024-01-12",
    canal_contato: "email",
    score_neofin: 910,
    status_conta: "ativo",
    setor_cliente: "hotelaria",
    regiao: "leblon",
    tipo_contrato: "anual"
  },
  {
    customer_id: "C029",
    razao_social: "Nogueira Gomes - ME",
    cnpj: "19.267.084/0001-52",
    plano_servico: "Premium",
    faturamento_mensal: 43164.42,
    dias_atraso: 3,
    ultima_cobranca: "2024-01-09",
    canal_contato: "email",
    score_neofin: 810,
    status_conta: "ativo",
    setor_cliente: "saude",
    regiao: "tijuca",
    tipo_contrato: "anual"
  },
  {
    customer_id: "C030",
    razao_social: "Nogueira",
    cnpj: "96.320.714/0001-56",
    plano_servico: "Standard",
    faturamento_mensal: 13822.96,
    dias_atraso: 11,
    ultima_cobranca: "2023-12-28",
    canal_contato: "telefone",
    score_neofin: 670,
    status_conta: "ativo",
    setor_cliente: "gastronomia",
    regiao: "leblon",
    tipo_contrato: "mensal"
  }
]

export const metricas: Metrica[] = [
  {
    mes_ano: "2023-10",
    receita_recorrente: 920993.98,
    receita_total: 872140.03,
    taxa_inadimplencia: 7.65,
    cac: 1455.97,
    ltv: 47061.06,
    churn_rate: 2.36,
    ticket_medio: 27471.18,
    novos_clientes: 3,
    clientes_ativos: 30,
    margem_bruta: 63.66
  },
  {
    mes_ano: "2023-11",
    receita_recorrente: 909413.39,
    receita_total: 901784.97,
    taxa_inadimplencia: 8.87,
    cac: 1276.86,
    ltv: 49549.94,
    churn_rate: 3.71,
    ticket_medio: 32843.44,
    novos_clientes: 2,
    clientes_ativos: 30,
    margem_bruta: 69.62
  },
  {
    mes_ano: "2023-12",
    receita_recorrente: 759034.28,
    receita_total: 805705.11,
    taxa_inadimplencia: 14.11,
    cac: 998.75,
    ltv: 40251.59,
    churn_rate: 6.21,
    ticket_medio: 29310.09,
    novos_clientes: 1,
    clientes_ativos: 30,
    margem_bruta: 70.49
  },
  {
    mes_ano: "2024-01",
    receita_recorrente: 805454.96,
    receita_total: 775137.83,
    taxa_inadimplencia: 14.89,
    cac: 1516.38,
    ltv: 40811.11,
    churn_rate: 8.44,
    ticket_medio: 29542.87,
    novos_clientes: 0,
    clientes_ativos: 30,
    margem_bruta: 60.32
  },
  {
    mes_ano: "2024-02",
    receita_recorrente: 768316.13,
    receita_total: 784073.26,
    taxa_inadimplencia: 12.63,
    cac: 1741.96,
    ltv: 39234.89,
    churn_rate: 5.17,
    ticket_medio: 31625.8,
    novos_clientes: 2,
    clientes_ativos: 31,
    margem_bruta: 76.67
  },
  {
    mes_ano: "2024-03",
    receita_recorrente: 940768.56,
    receita_total: 867343.73,
    taxa_inadimplencia: 12.73,
    cac: 1306.61,
    ltv: 46122.69,
    churn_rate: 4.08,
    ticket_medio: 30462.15,
    novos_clientes: 3,
    clientes_ativos: 32,
    margem_bruta: 77.14
  },
  {
    mes_ano: "2024-04",
    receita_recorrente: 928423.38,
    receita_total: 816802.66,
    taxa_inadimplencia: 10.81,
    cac: 1521.64,
    ltv: 44572.69,
    churn_rate: 4.4,
    ticket_medio: 31140.94,
    novos_clientes: 2,
    clientes_ativos: 32,
    margem_bruta: 59.27
  },
  {
    mes_ano: "2024-05",
    receita_recorrente: 984549.31,
    receita_total: 959697.65,
    taxa_inadimplencia: 13.83,
    cac: 1547.23,
    ltv: 42511.9,
    churn_rate: 4.01,
    ticket_medio: 30797.13,
    novos_clientes: 2,
    clientes_ativos: 33,
    margem_bruta: 66.13
  },
  {
    mes_ano: "2024-06",
    receita_recorrente: 987253.41,
    receita_total: 837142.77,
    taxa_inadimplencia: 12.36,
    cac: 1256.92,
    ltv: 40615.67,
    churn_rate: 2.57,
    ticket_medio: 28419.63,
    novos_clientes: 1,
    clientes_ativos: 33,
    margem_bruta: 61.2
  },
  {
    mes_ano: "2024-07",
    receita_recorrente: 948209.4,
    receita_total: 1020560.97,
    taxa_inadimplencia: 11.27,
    cac: 1506.5,
    ltv: 43298.84,
    churn_rate: 3.01,
    ticket_medio: 29121.87,
    novos_clientes: 2,
    clientes_ativos: 34,
    margem_bruta: 61.14
  },
  {
    mes_ano: "2024-08",
    receita_recorrente: 1024734.23,
    receita_total: 996454.26,
    taxa_inadimplencia: 11.83,
    cac: 1306.22,
    ltv: 43909.17,
    churn_rate: 2.8,
    ticket_medio: 28819.89,
    novos_clientes: 2,
    clientes_ativos: 34,
    margem_bruta: 54.75
  },
  {
    mes_ano: "2024-09",
    receita_recorrente: 880990.56,
    receita_total: 902153.41,
    taxa_inadimplencia: 10.99,
    cac: 1433.8,
    ltv: 48112.38,
    churn_rate: 2.4,
    ticket_medio: 32873.03,
    novos_clientes: 2,
    clientes_ativos: 35,
    margem_bruta: 70.46
  },
  {
    mes_ano: "2024-10",
    receita_recorrente: 915716.66,
    receita_total: 878576.81,
    taxa_inadimplencia: 8.31,
    cac: 1423.4,
    ltv: 47779.28,
    churn_rate: 2.2,
    ticket_medio: 31004.45,
    novos_clientes: 2,
    clientes_ativos: 35,
    margem_bruta: 67.97
  },
  {
    mes_ano: "2024-11",
    receita_recorrente: 899955.0,
    receita_total: 1052461.36,
    taxa_inadimplencia: 10.64,
    cac: 1362.32,
    ltv: 50639.8,
    churn_rate: 2.34,
    ticket_medio: 32455.54,
    novos_clientes: 1,
    clientes_ativos: 35,
    margem_bruta: 55.96
  },
  {
    mes_ano: "2024-12",
    receita_recorrente: 791354.17,
    receita_total: 853924.6,
    taxa_inadimplencia: 11.17,
    cac: 1129.8,
    ltv: 45247.16,
    churn_rate: 5.65,
    ticket_medio: 32445.4,
    novos_clientes: 0,
    clientes_ativos: 35,
    margem_bruta: 60.16
  }
]

// Contexto da empresa LavandeRio
export const contextoEmpresa = {
  empresa: {
    nome: "LavandeRio - Soluções em Lavanderia Especializada",
    cnpj: "11.222.333/0001-44",
    fundacao: "2018",
    sede: "Rio de Janeiro, RJ",
    filiais: 8,
    funcionarios: 145
  },
  negocio: {
    modelo: "B2B Lavanderia Especializada",
    segmentos: ["Hotelaria", "Gastronomia", "Saúde", "Eventos", "Fitness"],
    territorio: "Grande Rio de Janeiro",
    capacidade_diaria: "2.5 toneladas de roupas",
    tipos_servico: {
      basic: "Lavagem padrão para academias e pequenos estabelecimentos",
      standard: "Lavagem e passadoria para restaurantes e clínicas",
      premium: "Lavagem, passadoria e tratamentos especiais para hotéis",
      enterprise: "Soluções completas para hospitais e grandes redes"
    }
  },
  desafios_financeiros: {
    inadimplencia: "Taxa cresceu de 8.5% (out/23) para 16.7% (jan/24)",
    sazonalidade: "Queda de 20% na receita entre dezembro e janeiro",
    fluxo_caixa: "45 dias prazo médio vs 30 dias custo operacional",
    clientes_problema: [
      "Pequenos restaurantes com alta rotatividade",
      "Academias com contratos de baixo valor",
      "Eventos sazonais com pagamentos irregulares"
    ]
  },
  solucao_neofin: {
    implementacao: "Setembro 2023",
    modulos: ["Análise Preditiva", "Automação de Cobrança", "Gestão de Risco"],
    resultados: {
      reducao_inadimplencia: "Meta: -50% em 6 meses",
      melhoria_fluxo: "Meta: reduzir prazo médio para 35 dias",
      eficiencia_cobranca: "Meta: automatizar 80% das cobranças"
    }
  }
}

// Função para calcular faturamento mês a mês com base nas transações
export function calcularFaturamentoPorMes(): Record<string, number> {
  const faturamentoPorMes: Record<string, number> = {}
  
  // Dados das métricas mensais
  metricas.forEach(metrica => {
    faturamentoPorMes[metrica.mes_ano] = metrica.receita_total
  })
  
  return faturamentoPorMes
}

// Função para obter dados agregados da empresa
export function getResumoLavandeRio() {
  const totalClientes = clientes.length
  const clientesAtivos = clientes.filter(c => c.status_conta === 'ativo').length
  const clientesInadimplentes = clientes.filter(c => c.status_conta === 'inadimplente').length
  const faturamentoMensalTotal = clientes.reduce((sum, c) => sum + c.faturamento_mensal, 0)
  const ticketMedio = faturamentoMensalTotal / totalClientes
  
  // Última métrica disponível
  const ultimaMetrica = metricas[metricas.length - 1]
  
  return {
    total_clientes: totalClientes,
    clientes_ativos: clientesAtivos,
    clientes_inadimplentes: clientesInadimplentes,
    faturamento_mensal_total: faturamentoMensalTotal,
    ticket_medio: ticketMedio,
    taxa_inadimplencia_atual: ultimaMetrica.taxa_inadimplencia,
    margem_bruta_atual: ultimaMetrica.margem_bruta,
    faturamento_por_mes: calcularFaturamentoPorMes(),
    data_ultima_atualizacao: ultimaMetrica.mes_ano
  }
}

// Função para análise por setor
export function getAnalysePorSetor() {
  const setPorSetor: Record<string, {
    clientes: number,
    faturamento_total: number,
    ticket_medio: number,
    score_medio: number,
    atraso_medio: number
  }> = {}
  
  clientes.forEach(cliente => {
    const setor = cliente.setor_cliente
    if (!setPorSetor[setor]) {
      setPorSetor[setor] = {
        clientes: 0,
        faturamento_total: 0,
        ticket_medio: 0,
        score_medio: 0,
        atraso_medio: 0
      }
    }
    
    setPorSetor[setor].clientes += 1
    setPorSetor[setor].faturamento_total += cliente.faturamento_mensal
    setPorSetor[setor].score_medio += cliente.score_neofin
    setPorSetor[setor].atraso_medio += cliente.dias_atraso
  })
  
  // Calcular médias
  Object.keys(setPorSetor).forEach(setor => {
    const dados = setPorSetor[setor]
    dados.ticket_medio = dados.faturamento_total / dados.clientes
    dados.score_medio = dados.score_medio / dados.clientes
    dados.atraso_medio = dados.atraso_medio / dados.clientes
  })
  
  return setPorSetor
}

// Função para identificar clientes prioritários
export function getClientesPrioritarios() {
  return clientes
    .filter(c => c.dias_atraso > 0 || c.status_conta === 'inadimplente')
    .sort((a, b) => {
      // Score de prioridade: faturamento alto + atraso alto + score baixo
      const scoreA = (a.faturamento_mensal / 1000) + a.dias_atraso + (1000 - a.score_neofin) / 10
      const scoreB = (b.faturamento_mensal / 1000) + b.dias_atraso + (1000 - b.score_neofin) / 10
      return scoreB - scoreA
    })
    .slice(0, 10)
}