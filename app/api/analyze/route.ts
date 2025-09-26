import { NextRequest, NextResponse } from 'next/server'

const PYTHON_FUNCTION_PATH = '/api/analyze_python'
const isVercel = !!process.env.VERCEL

export async function POST(request: NextRequest) {
  try {
    const { data, analysisType, query } = await request.json()

    if (!analysisType) {
      return NextResponse.json(
        { error: 'analysisType is required' },
        { status: 400 }
      )
    }

    // Validar se query é obrigatória para RAG
    if (analysisType === 'rag' && !query) {
      return NextResponse.json(
        { error: 'query is required for RAG analysis' },
        { status: 400 }
      )
    }

    // In Vercel, proxy to the Python Serverless Function
    if (isVercel) {
      const res = await fetch(PYTHON_FUNCTION_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType, data, query })
      })

      const json = await res.json()
      return NextResponse.json(json, { status: res.status })
    }

    // Local fallback: run analyzer directly via Python
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const path = await import('path')
    const execAsync = promisify(exec)

    const pythonScriptPath = path.join(process.cwd(), 'python', 'analyzer.py')
    const dataPath = path.join(process.cwd(), 'python', 'data', 'clientes_lavanderio.csv')
    
    // Construir comando baseado no tipo de análise
    let command = `python3 ${pythonScriptPath} --type ${analysisType} --data ${dataPath}`
    if (analysisType === 'rag' && query) {
      command += ` --query "${query.replace(/"/g, '\\"')}"`
    }

    const { stdout, stderr } = await execAsync(command)
    if (stderr) {
      console.error('Python script stderr:', stderr)
    }
    const result = JSON.parse(stdout)
    return NextResponse.json({ analysis: result, timestamp: new Date().toISOString() })

  } catch (error) {
    console.error('Error in analyze API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    if (isVercel) {
      const res = await fetch(PYTHON_FUNCTION_PATH)
      const json = await res.json()
      return NextResponse.json(json, { status: res.status })
    }

    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const path = await import('path')
    const execAsync = promisify(exec)

    const dataPath = path.join(process.cwd(), 'python', 'data', 'clientes_lavanderio.csv')
    const command = `python3 ${path.join(process.cwd(), 'python', 'analyzer.py')} --type summary --data ${dataPath}`

    const { stdout } = await execAsync(command)
    const result = JSON.parse(stdout)
    return NextResponse.json({ summary: result, timestamp: new Date().toISOString() })

  } catch (error) {
    console.error('Error getting analysis summary:', error)
    return NextResponse.json(
      { error: 'Erro ao obter resumo da análise' },
      { status: 500 }
    )
  }
}