==================================================
NEOASSIST - ASSISTENTE INTELIGENTE DE COBRANÇA
==================================================
PARTE 1: SETUP E ESTRUTURA BASE
==================================================

OBJETIVO DO PROJETO
-------------------
Demonstrar capacidades em IA aplicada ao setor financeiro, especificamente em automação de cobranças B2B para impressionar a Neofin.

STACK TECNOLÓGICA
-----------------
- Frontend: Next.js 14 com TypeScript
- Styling: Tailwind CSS com componentes Radix UI  
- Backend: API Routes do Next.js integrado com Python
- IA: OpenAI GPT-4 API
- Análise de Dados: Python com pandas e numpy
- Deploy: Vercel

ESTRUTURA DE PASTAS DO PROJETO
-------------------------------
neoassist/
  app/
    layout.tsx
    page.tsx
    globals.css
    api/
      chat/
        route.ts
      analyze/
        route.ts
  components/
    ui/
      button.tsx
      card.tsx
      input.tsx
    chat/
      ChatInterface.tsx
      MessageList.tsx
  lib/
    openai.ts
    utils.ts
  python/
    analyzer.py
    requirements.txt
    data/
      sample_clients.csv
  public/
    icons/
  .env.local
  package.json
  tailwind.config.js
  tsconfig.json

==================================================
INSTRUÇÕES DE SETUP
==================================================

PASSO 1: CRIAR O PROJETO NEXT.JS
---------------------------------
npx create-next-app@latest neoassist --typescript --tailwind --app
cd neoassist

PASSO 2: INSTALAR DEPENDÊNCIAS DO FRONTEND
-------------------------------------------
npm install openai axios recharts lucide-react @radix-ui/react-slot class-variance-authority clsx tailwind-merge

PASSO 3: SETUP DO AMBIENTE PYTHON
----------------------------------
mkdir python
cd python
python -m venv venv

# No Mac/Linux:
source venv/bin/activate  

# No Windows:
venv\Scripts\activate

pip install pandas numpy fastapi uvicorn
pip freeze > requirements.txt
cd ..

PASSO 4: CRIAR ARQUIVO DE VARIÁVEIS DE AMBIENTE
------------------------------------------------
Criar arquivo .env.local na raiz do projeto:

OPENAI_API_KEY=sua_chave_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000

==================================================
ARQUIVOS DE CONFIGURAÇÃO
==================================================

ARQUIVO: tailwind.config.js
----------------------------
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#8B5CF6",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#EC4899",
          foreground: "#FFFFFF",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
}

ARQUIVO: app/globals.css
------------------------
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 224 71.4% 4.1%;
    --primary: 271 91% 65%;
    --primary-foreground: 0 0% 100%;
    --secondary: 328 85% 70%;
    --secondary-foreground: 0 0% 100%;
    --muted: 220 14.3% 95.9%;
    --muted-foreground: 220 8.9% 46.1%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 271 91% 65%;
    --radius: 0.5rem;
  }
}

@layer utilities {
  .gradient-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .glass {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
  
  .glass-dark {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(to bottom right, #faf5ff, #ffffff, #f3e8ff);
  min-height: 100vh;
}

ARQUIVO: tsconfig.json
----------------------
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

ARQUIVO: python/data/sample_clients.csv
----------------------------------------
cliente_id,nome_empresa,valor_devido,dias_atraso,historico_pagamento,setor,porte,score_credito,canal_preferido
001,Comercial Silva Ltda,5250.00,32,regular,varejo,pequeno,650,whatsapp
002,Indústria Beta SA,15750.00,65,mal_pagador,industria,medio,420,email
003,Tech Solutions Corp,3200.00,15,bom_pagador,tecnologia,pequeno,780,whatsapp
004,Construtora Alfa,45000.00,90,mal_pagador,construcao,grande,380,telefone
005,Mercado Central,8900.00,22,regular,varejo,medio,590,sms
006,Logística Express,12000.00,45,regular,logistica,medio,550,email
007,Farmácia Saúde,2100.00,8,bom_pagador,saude,pequeno,720,whatsapp
008,Auto Peças Motor,6700.00,55,mal_pagador,autopecas,pequeno,450,telefone
009,Consultoria Prime,9500.00,18,bom_pagador,servicos,medio,690,email
010,Padaria Pão Quente,1500.00,40,regular,alimentacao,pequeno,520,whatsapp

==================================================
PRÓXIMAS ETAPAS
==================================================

PARTE 2 - COMPONENTES CORE:
- Layout principal com navegação
- Interface do Chat estilo Linear
- Sistema de mensagens em tempo real
- Integração com GPT-4

PARTE 3 - PYTHON ANALYTICS:
- Script analyzer.py para processar dados
- Análise estatística com pandas
- Geração de insights automáticos
- API endpoints para integração

PARTE 4 - FEATURES AVANÇADAS:
- Upload de CSV
- Geração de gráficos dinâmicos
- Export de relatórios
- Sistema de recomendações

==================================================
COMANDOS ÚTEIS PARA DESENVOLVIMENTO
==================================================

# Rodar o projeto Next.js
npm run dev

# Rodar o servidor Python (quando criado)
cd python
python analyzer.py

# Build para produção
npm run build

# Deploy na Vercel
vercel --prod

==================================================
FIM DA PARTE 1
==================================================