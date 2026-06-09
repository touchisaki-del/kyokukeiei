'use client'

import { useData } from './context/DataContext'
import { formatManen, calcGrowthRate } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#6366f1']

function KpiCard({
  title, target, actual, unit = '万円'
}: { title: string; target: number; actual: number; unit?: string }) {
  const rate = target > 0 ? (actual / target) * 100 : 0
  const color = rate >= 100 ? 'text-green-600' : rate >= 80 ? 'text-yellow-600' : 'text-red-600'
  const bg = rate >= 100 ? 'bg-green-50 border-green-200' : rate >= 80 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
  return (
    <div className={`rounded-xl border p-5 ${bg}`}>
      <div className="text-sm text-gray-500 font-medium mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-800">{actual.toLocaleString()}<span className="text-sm ml-1">{unit}</span></div>
      <div className="text-xs text-gray-500 mt-1">目標: {target.toLocaleString()}{unit}</div>
      <div className={`text-lg font-semibold mt-2 ${color}`}>{rate.toFixed(1)}% 達成</div>
    </div>
  )
}

export default function DashboardPage() {
  const { projects, members } = useData()

  // Aggregate 2025 data
  const currentYear = 2025
  let totalOrderTarget = 0, totalOrderActual = 0, totalPlTarget = 0, totalPlActual = 0
  let prevOrderActual = 0

  projects.forEach(p => {
    const y2025 = p.years.find(y => y.year === currentYear)
    const y2024 = p.years.find(y => y.year === 2024)
    if (y2025) {
      totalOrderTarget += y2025.orderTarget
      totalOrderActual += y2025.orderActual
      totalPlTarget += y2025.plTarget
      totalPlActual += y2025.plActual
    }
    if (y2024) {
      prevOrderActual += y2024.orderActual
    }
  })

  const yoyGrowth = calcGrowthRate(totalOrderTarget, prevOrderActual)

  // Top 5 by 2025 order target
  const top5 = [...projects]
    .map(p => ({ name: p.name, target: p.years.find(y => y.year === currentYear)?.orderTarget ?? 0 }))
    .sort((a, b) => b.target - a.target)
    .slice(0, 5)

  // Media breakdown
  let totalSearch = 0, totalMeta = 0
  projects.forEach(p => {
    const y = p.years.find(y => y.year === currentYear)
    if (y) {
      totalSearch += y.searchBudget
      totalMeta += y.metaBudget
    }
  })
  const mediaPieData = [
    { name: '検索広告', value: totalSearch },
    { name: 'Meta広告', value: totalMeta },
  ]

  // All projects table
  const tableRows = projects.map(p => {
    const y = p.years.find(y => y.year === currentYear)
    const yPrev = p.years.find(y => y.year === 2024)
    const rate = y && y.orderTarget > 0 ? (y.orderActual / y.orderTarget) * 100 : 0
    const yoy = y && yPrev ? calcGrowthRate(y.orderTarget, yPrev.orderActual) : 0
    return { ...p, y, rate, yoy }
  })

  const member = (id: string) => members.find(m => m.id === id)?.name ?? id

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">FY2025 営業目標管理 — 全案件サマリー</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="受注目標合計" target={totalOrderTarget} actual={totalOrderActual} />
        <KpiCard title="PL目標合計" target={totalPlTarget} actual={totalPlActual} />
        <div className="rounded-xl border bg-blue-50 border-blue-200 p-5">
          <div className="text-sm text-gray-500 font-medium mb-1">YoY成長率（目標）</div>
          <div className={`text-2xl font-bold ${yoyGrowth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {yoyGrowth >= 0 ? '+' : ''}{yoyGrowth.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">対前年実績比</div>
          <div className="flex items-center gap-1 mt-2">
            {yoyGrowth >= 0 ? <TrendingUp size={16} className="text-blue-600" /> : <TrendingDown size={16} className="text-red-600" />}
            <span className="text-xs text-gray-600">前年実績: {formatManen(prevOrderActual)}</span>
          </div>
        </div>
        <div className="rounded-xl border bg-purple-50 border-purple-200 p-5">
          <div className="text-sm text-gray-500 font-medium mb-1">案件数</div>
          <div className="text-2xl font-bold text-purple-700">{projects.length}</div>
          <div className="text-xs text-gray-500 mt-1">担当メンバー: {members.length}名</div>
          <div className="flex items-center gap-1 mt-2">
            <Target size={16} className="text-purple-600" />
            <span className="text-xs text-gray-600">平均 {formatManen(Math.round(totalOrderTarget / projects.length))} / 案件</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">受注目標 TOP5（2025年）</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={top5} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}万`} />
              <Tooltip formatter={(v: number) => formatManen(v)} />
              <Bar dataKey="target" name="受注目標" radius={[4, 4, 0, 0]}>
                {top5.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Media Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">媒体別予算配分</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={mediaPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                <Cell fill="#3b82f6" />
                <Cell fill="#8b5cf6" />
              </Pie>
              <Tooltip formatter={(v: number) => formatManen(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />検索広告</span>
              <span className="font-medium">{formatManen(totalSearch)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />Meta広告</span>
              <span className="font-medium">{formatManen(totalMeta)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* All Projects Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-700">全案件 2025年目標 vs 実績</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="text-left px-4 py-3">案件名</th>
                <th className="text-left px-4 py-3">担当</th>
                <th className="text-left px-4 py-3">業界</th>
                <th className="text-right px-4 py-3">受注目標</th>
                <th className="text-right px-4 py-3">受注実績</th>
                <th className="text-right px-4 py-3">達成率</th>
                <th className="text-right px-4 py-3">YoY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableRows.map(row => {
                const rateColor = row.rate >= 100 ? 'text-green-600 bg-green-50' : row.rate >= 80 ? 'text-yellow-700 bg-yellow-50' : 'text-red-600 bg-red-50'
                const yoyColor = row.yoy >= 0 ? 'text-blue-600' : 'text-red-500'
                return (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600">{member(row.memberId)}</td>
                    <td className="px-4 py-3 text-gray-600">{row.industry}</td>
                    <td className="px-4 py-3 text-right">{row.y ? formatManen(row.y.orderTarget) : '-'}</td>
                    <td className="px-4 py-3 text-right">{row.y ? formatManen(row.y.orderActual) : '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rateColor}`}>
                        {row.rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${yoyColor}`}>
                      {row.yoy >= 0 ? '+' : ''}{row.yoy.toFixed(1)}%
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
