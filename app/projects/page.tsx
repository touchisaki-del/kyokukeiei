'use client'

import { useState } from 'react'
import { useData } from '../context/DataContext'
import { formatManen, calcGrowthRate, getDifficultyLabel } from '@/lib/utils'
import { Project } from '@/lib/types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { ChevronDown, ChevronUp, Clock } from 'lucide-react'

function AchievementBadge({ rate }: { rate: number }) {
  const cls = rate >= 100
    ? 'bg-green-100 text-green-700 border border-green-300'
    : rate >= 80
    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
    : 'bg-red-100 text-red-700 border border-red-300'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {rate.toFixed(1)}%
    </span>
  )
}

function ProjectRowExpanded({ project }: { project: Project }) {
  const chartData = project.years.map(y => ({
    year: y.year.toString(),
    受注目標: y.orderTarget,
    受注実績: y.orderActual || undefined,
    PL目標: y.plTarget,
    PL実績: y.plActual || undefined,
  }))
  const lag = project.years[0]?.billingLagMonths ?? 0
  return (
    <tr>
      <td colSpan={10} className="px-4 py-4 bg-blue-50">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-700 mb-2">3ヵ年推移 + 2025年目標</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}万`} />
                <Tooltip formatter={(v: number) => formatManen(v)} />
                <Legend />
                <Line type="monotone" dataKey="受注目標" stroke="#3b82f6" strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="受注実績" stroke="#1d4ed8" strokeWidth={2} />
                <Line type="monotone" dataKey="PL目標" stroke="#10b981" strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="PL実績" stroke="#065f46" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-48 space-y-3">
            <div className="bg-white rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock size={14} />
                <span className="font-medium">請求ラグ</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">{lag}<span className="text-sm ml-1">ヶ月</span></div>
              <div className="text-xs text-gray-400 mt-1">受注→PL計上までの期間</div>
            </div>
            <div className="bg-white rounded-lg border p-3 text-xs text-gray-500 leading-relaxed">
              受注目標は契約締結時点、PL目標は実際の請求・計上時点（受注から{lag}ヶ月後）で管理します。
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

export default function ProjectsPage() {
  const { projects, members, industryRates } = useData()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const memberName = (id: string) => members.find(m => m.id === id)?.name ?? id

  const rows = projects.map(p => {
    const y25 = p.years.find(y => y.year === 2025)
    const y24 = p.years.find(y => y.year === 2024)
    const orderRate = y25 && y25.orderTarget > 0 ? (y25.orderActual / y25.orderTarget) * 100 : 0
    const plRate = y25 && y25.plTarget > 0 ? (y25.plActual / y25.plTarget) * 100 : 0
    const yoy = y25 && y24 ? calcGrowthRate(y25.orderTarget, y24.orderActual) : 0
    const marketGrowth = industryRates.find(r => r.industry === p.industry)?.growthRate2025 ?? 5
    const diff = getDifficultyLabel(yoy, marketGrowth)
    return { ...p, y25, orderRate, plRate, yoy, diff }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">案件目標管理</h1>
        <p className="text-sm text-gray-500 mt-1">FY2025 — 受注目標・PL目標・達成状況</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="text-left px-4 py-3">案件名</th>
                <th className="text-left px-4 py-3">担当</th>
                <th className="text-left px-4 py-3">業界</th>
                <th className="text-left px-4 py-3">媒体</th>
                <th className="text-right px-4 py-3">受注目標</th>
                <th className="text-right px-4 py-3">受注実績</th>
                <th className="text-right px-4 py-3">達成率</th>
                <th className="text-right px-4 py-3">PL目標</th>
                <th className="text-right px-4 py-3">PL実績</th>
                <th className="text-right px-4 py-3">YoY</th>
                <th className="text-center px-4 py-3">市況評価</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(row => {
                const expanded = expandedId === row.id
                const yoyColor = row.yoy >= 0 ? 'text-blue-600' : 'text-red-500'
                const diffColor = row.diff.color === 'green' ? 'bg-green-100 text-green-700' : row.diff.color === 'red' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                const mediaLabel = row.media === 'search' ? '検索' : row.media === 'meta' ? 'Meta' : '両方'
                return (
                  <>
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50 cursor-pointer ${expanded ? 'bg-blue-50' : ''}`}
                      onClick={() => setExpandedId(expanded ? null : row.id)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                      <td className="px-4 py-3 text-gray-600">{memberName(row.memberId)}</td>
                      <td className="px-4 py-3 text-gray-600">{row.industry}</td>
                      <td className="px-4 py-3 text-gray-600">{mediaLabel}</td>
                      <td className="px-4 py-3 text-right">{row.y25 ? formatManen(row.y25.orderTarget) : '-'}</td>
                      <td className="px-4 py-3 text-right">{row.y25 ? formatManen(row.y25.orderActual) : '-'}</td>
                      <td className="px-4 py-3 text-right"><AchievementBadge rate={row.orderRate} /></td>
                      <td className="px-4 py-3 text-right">{row.y25 ? formatManen(row.y25.plTarget) : '-'}</td>
                      <td className="px-4 py-3 text-right">{row.y25 ? formatManen(row.y25.plActual) : '-'}</td>
                      <td className={`px-4 py-3 text-right font-medium ${yoyColor}`}>
                        {row.yoy >= 0 ? '+' : ''}{row.yoy.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${diffColor}`}>{row.diff.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                    </tr>
                    {expanded && <ProjectRowExpanded key={`${row.id}-exp`} project={row} />}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>達成率凡例:</strong> <span className="text-green-700">■ 100%以上</span> / <span className="text-yellow-700">■ 80〜99%</span> / <span className="text-red-700">■ 80%未満</span>
        　　<strong>市況評価:</strong> 案件成長率と業界市況成長率の差分で判定（±5%以内 = 市況並み）
      </div>
    </div>
  )
}
