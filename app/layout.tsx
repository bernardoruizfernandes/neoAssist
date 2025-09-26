import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NeoAssist - Assistente Inteligente para Automação Financeira',
  description: 'IA especializada em automação financeira B2B, gestão de fluxo de caixa, contas a pagar/receber e otimização de processos financeiros',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}