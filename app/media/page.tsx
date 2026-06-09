'use client'

import { useData } from '../context/DataContext'
import { formatManen, calcGrowthRate } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

export default function MediaPage() {
  const { projects } = useData()
  const currentYear = 2025
  const prevYear = 2024

  let totalSearch2025 = 0, totalMeta2025 = 0
  let totalSearch2024 = 0, totalMeta2024 = 0

  projects.forEach(p => {
    const y = p.years.find(d => d.year === currentYear)
    const yp = p.years.find(d => d.year === prevYear)
    if (y) { totalSearch2025 += y.searchBudget; totalMeta2025 += y.metaBudget }
    if (yp) { totalSearch2024 += yp.searchBudget; totalMeta2024 += yp.metaBudget }
  })

  const searchGrowth = calcGrowthRate(totalSearch2025, totalSearch2024)
  const metaGrowth = calcGrowthRate(totalMeta2025, totalMeta2024)

  const stackedData = projects.map(p => {
    const y = p.years.find(d => d.year === currentYear)
    return { name: p.name, 検索広告: y?.searchBudget ?? 0, Meta広告: y?.metaBudget ?? 0 }
  })

  const pieData = [
    { name: '検索広告', value: totalSearch2025 },
    { name: 'Meta広告', value: totalMeta2025 },
  ]

  const trendData = [2022, 2023, 2024, 2025].map(year => {
    let s = 0, m = 0
    projects.forEach(p => {
      const y = p.years.find(d => d.year === year)
      if (y) { s += y.searchBudget; m += y.metaBudget }
    })
    return { year: `${year}年`, 検索広告: s, Meta広告: m }
  })

  const tableRows = projects.map(p => {
    const y = p.years.find(d => d.year === currentYear)
    const yp = p.years.find(d => d.year === prevYear)
    const searchGr = y && yp ? calcGrowthRate(y.searchBudget, yp.searchBudget) : 0
    const metaGr = y && yp ? calcGrowthRate(y.metaBudget, yp.metaBudget) : 0
    const total = (y?.searchBudget ?? 0) + (y?.metaBudget ?? 0)
    const searchRatio = total > 0 ? ((y?.searchBudget ?? 0) / total * 100).toFixed(0) : '-'
    const metaRatio = total > 0 ? ((y?.metaBudget ?? 0) / total * 100).toFixed(0) : '-'
    return { ...p, y, searchGr, metaGr, searchRatio, metaRatio }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">媒体別分析</h1>
        <p className="text-sm text-gray-500 mt-1">検索広告 vs Meta広告 の予算配分・成長目標</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="text-sm text-gray-500">検索広告 合計目標</div>
          <div className="text-2xl font-bold text-blue-700">{formatManen(totalSearch2025)}</div>
          <div className={`text-sm font-medium mt-1 ${searchGrowth >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            YoY {searchGrowth >= 0 ? '+' : ''}{searchGrowth.toFixed(1)}%
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <div className="text-sm text-gray-500">Meta広告 合計目標</div>
          <div className="text-2xl font-bold text-purple-700">{formatManen(totalMeta2025)}</div>
          <div className={`text-sm font-medium mt-1 ${metaGrowth >= 0 ? 'text-purple-600' : 'text-red-500'}`}>
            YoY {metaGrowth >= 0 ? '+' : ''}{metaGrowth.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="text-sm text-gray-500">検索比率</div>
          <div className="text-2xl font-bold text-gray-700">
            {(totalSearch2025 / (totalSearch2025 + totalMeta2025) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">検索 : Meta</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="text-sm text-gray-500">Meta比率</div>
          <div className="text-2xl font-bold text-gray-700">
            {(totalMeta2025 / (totalSearch2025 + totalMeta2025) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">前年比 Meta {metaGrowth >= 0 ? '+' : ''}{metaGrowth.toFixed(1)}%</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">案件別 検索 vs Meta 予算（2025年）</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stackedData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}万`} />
              <Tooltip formatter={(v: number) => formatManen(v)} />
              <Legend />
              <Bar dataKey="検索広告" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Meta広告" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">媒体ミックス（2025年）</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                <Cell fill="#3b82f6" />
                <Cell fill="#8b5cf6" />
              </Pie>
              <Tooltip formatter={(v: number) => formatManen(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">媒体別 3年間トレンド</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}万`} />
            <Tooltip formatter={(v: number) => formatManen(v)} />
            <Legend />
            <Bar dataKey="検索広告" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Meta広告" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-700">案件別 媒体配分詳細</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase border-b border-gray-100">
                <th className="text-left px-4 py-3">案件名</th>
                <th className="text-right px-4 py-3">検索予算</th>
                <th className="text-right px-4 py-3">検索比率</th>
                <th className="text-right px-4 py-3">検索YoY</th>
                <th className="text-right px-4 py-3">Meta予算</th>
                <th className="text-right px-4 py-3">Meta比率</th>
                <th className="text-right px-4 py-3">Meta YoY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableRows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                  <td className="px-4 py-3 text-right">{row.y ? formatManen(row.y.searchBudget) : '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{row.searchRatio}%</td>
                  <td className={`px-4 py-3 text-right font-medium ${row.searchGr >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                    {row.y?.searchBudget ? `${row.searchGr >= 0 ? '+' : ''}${row.searchGr.toFixed(1)}%` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">{row.y ? formatManen(row.y.metaBudget) : '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{row.metaRatio}%</td>
                  <td className={`px-4 py-3 text-right font-medium ${row.metaGr >= 0 ? 'text-purple-600' : 'text-red-500'}`}>
                    {row.y?.metaBudget ? `${row.metaGr >= 0 ? '+' : ''}${row.metaGr.toFixed(1)}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
