'use client'

import { useData } from '../context/DataContext'
import { calcGrowthRate, getDifficultyLabel } from '@/lib/utils'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Label, Cell
} from 'recharts'

interface ScatterPoint {
  x: number
  y: number
  name: string
  industry: string
  color: string
}

const CustomDot = (props: { cx?: number; cy?: number; payload?: ScatterPoint }) => {
  const { cx = 0, cy = 0, payload } = props
  if (!payload) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={payload.color} opacity={0.85} />
      <text x={cx + 10} y={cy + 4} fontSize={11} fill="#374151">{payload.name}</text>
    </g>
  )
}

export default function MarketPage() {
  const { projects, industryRates } = useData()

  const scatterData: ScatterPoint[] = projects.map(p => {
    const y25 = p.years.find(y => y.year === 2025)
    const y24 = p.years.find(y => y.year === 2024)
    const projectGrowth = y25 && y24 ? calcGrowthRate(y25.orderTarget, y24.orderActual) : 0
    const marketGrowth = industryRates.find(r => r.industry === p.industry)?.growthRate2025 ?? 5
    const diff = getDifficultyLabel(projectGrowth, marketGrowth)
    const color = diff.color === 'green' ? '#10b981' : diff.color === 'red' ? '#ef4444' : '#f59e0b'
    return {
      x: marketGrowth,
      y: projectGrowth,
      name: p.name,
      industry: p.industry,
      color,
    }
  })

  const tableRows = projects.map(p => {
    const y25 = p.years.find(y => y.year === 2025)
    const y24 = p.years.find(y => y.year === 2024)
    const projectGrowth = y25 && y24 ? calcGrowthRate(y25.orderTarget, y24.orderActual) : 0
    const marketGrowth = industryRates.find(r => r.industry === p.industry)?.growthRate2025 ?? 5
    const diff = getDifficultyLabel(projectGrowth, marketGrowth)
    return { ...p, projectGrowth, marketGrowth, diff }
  })

  // Reference line data for y=x diagonal
  const allVals = scatterData.flatMap(d => [d.x, d.y])
  const minVal = Math.floor(Math.min(...allVals) - 2)
  const maxVal = Math.ceil(Math.max(...allVals) + 2)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">市況比較</h1>
        <p className="text-sm text-gray-500 mt-1">業界市況成長率 vs 案件成長率 — 難易度評価</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-1">散布図: 市況成長率 vs 案件成長率（2025年）</h2>
        <p className="text-xs text-gray-500 mb-4">対角線の上側 = 市況を超える成長目標、下側 = 市況以下（難易度高）</p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 80, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[minVal, maxVal]}
              tick={{ fontSize: 11 }}
              name="市況成長率"
            >
              <Label value="業界市況成長率 (%)" position="bottom" offset={20} style={{ fontSize: 12, fill: '#6b7280' }} />
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              domain={[minVal, maxVal]}
              tick={{ fontSize: 11 }}
              name="案件成長率"
            >
              <Label value="案件成長率 (%)" angle={-90} position="insideLeft" offset={10} style={{ fontSize: 12, fill: '#6b7280' }} />
            </YAxis>
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (!payload || !payload[0]) return null
                const d = payload[0].payload as ScatterPoint
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 text-xs shadow">
                    <div className="font-semibold text-gray-800">{d.name}</div>
                    <div>業界: {d.industry}</div>
                    <div>市況: {d.x.toFixed(1)}%</div>
                    <div>案件: {d.y.toFixed(1)}%</div>
                  </div>
                )
              }}
            />
            {/* Diagonal reference line */}
            <ReferenceLine
              segment={[{ x: minVal, y: minVal }, { x: maxVal, y: maxVal }]}
              stroke="#9ca3af"
              strokeDasharray="6 4"
              strokeWidth={1.5}
            />
            <Scatter data={scatterData} shape={<CustomDot />} />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> 市況超え（+5%以上）</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> 市況並み（±5%以内）</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> 難易度高（-5%以下）</span>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-700">難易度評価サマリー</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="text-left px-4 py-3">案件名</th>
                <th className="text-left px-4 py-3">業界</th>
                <th className="text-right px-4 py-3">業界市況成長率</th>
                <th className="text-right px-4 py-3">案件成長率（目標）</th>
                <th className="text-right px-4 py-3">差分</th>
                <th className="text-center px-4 py-3">難易度評価</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableRows.map(row => {
                const diffVal = row.projectGrowth - row.marketGrowth
                const diffColor = diffVal >= 0 ? 'text-green-600' : 'text-red-600'
                const badgeColor = row.diff.color === 'green'
                  ? 'bg-green-100 text-green-700'
                  : row.diff.color === 'red'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
                return (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.industry}</td>
                    <td className="px-4 py-3 text-right">{row.marketGrowth.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right">{row.projectGrowth >= 0 ? '+' : ''}{row.projectGrowth.toFixed(1)}%</td>
                    <td className={`px-4 py-3 text-right font-semibold ${diffColor}`}>
                      {diffVal >= 0 ? '+' : ''}{diffVal.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>
                        {row.diff.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
