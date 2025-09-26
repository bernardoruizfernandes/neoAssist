import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)
const isVercel = !!process.env.VERCEL
const PYTHON_FUNCTION_PATH = '/api/chart_python'

export async function POST(request: NextRequest) {
  try {
    const { chartType, query, analysisData } = await request.json()

    if (!chartType) {
      return NextResponse.json(
        { error: 'chartType is required' },
        { status: 400 }
      )
    }

    // In Vercel, proxy to the Python Serverless Function
    if (isVercel) {
      const res = await fetch(PYTHON_FUNCTION_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartType, query, analysisData })
      })

      const json = await res.json()
      return NextResponse.json(json)
    }

    // Local development
    const pythonScriptPath = path.join(process.cwd(), 'python', 'chart_generator.py')
    const dataPath = path.join(process.cwd(), 'python', 'data', 'clientes_lavanderio.csv')
    
    let command = `python3 ${pythonScriptPath} --type ${chartType} --data ${dataPath}`
    if (query) {
      command += ` --query "${query.replace(/"/g, '\\"')}"`
    }

    const { stdout, stderr } = await execAsync(command)
    if (stderr) {
      console.error('Python script stderr:', stderr)
    }

    const result = JSON.parse(stdout)
    
    return NextResponse.json({
      success: true,
      chartData: result.chartData
    })

  } catch (error) {
    console.error('Chart generation error:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao gerar dados do gráfico',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}