import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { data, analysisType } = await request.json()

    if (!data || !analysisType) {
      return NextResponse.json(
        { error: 'Data and analysis type are required' },
        { status: 400 }
      )
    }

    const pythonScriptPath = path.join(process.cwd(), 'python', 'analyzer.py')
    const dataPath = path.join(process.cwd(), 'python', 'data', 'sample_clients.csv')

    const command = `python3 ${pythonScriptPath} --type ${analysisType} --data ${dataPath}`

    try {
      const { stdout, stderr } = await execAsync(command)
      
      if (stderr) {
        console.error('Python script stderr:', stderr)
      }

      const result = JSON.parse(stdout)

      return NextResponse.json({
        analysis: result,
        timestamp: new Date().toISOString()
      })

    } catch (execError) {
      console.error('Error executing Python script:', execError)
      return NextResponse.json(
        { error: 'Erro ao executar análise Python' },
        { status: 500 }
      )
    }

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
    const dataPath = path.join(process.cwd(), 'python', 'data', 'sample_clients.csv')
    const command = `python3 ${path.join(process.cwd(), 'python', 'analyzer.py')} --type summary --data ${dataPath}`

    const { stdout } = await execAsync(command)
    const result = JSON.parse(stdout)

    return NextResponse.json({
      summary: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting analysis summary:', error)
    return NextResponse.json(
      { error: 'Erro ao obter resumo da análise' },
      { status: 500 }
    )
  }
}