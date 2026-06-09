'use client'

import { useData } from '../context/DataContext'
import { formatManen, calcGrowthRate } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function MembersPage() {
  const { projects, members } = useData()
  const currentYear = 2025
  const prevYear = 2024

  const memberStats = members.map(m => {
    const myProjects = projects.filter(p => p.memberId === m.id)
    let orderTarget = 0, orderActual = 0, plTarget = 0, plActual = 0
    let prevOrderActual = 0
    myProjects.forEach(p => {
      const y = p.years.find(d => d.year === currentYear)
      const yp = p.years.find(d => d.year === prevYear)
      if (y) { orderTarget += y.orderTarget; orderActual += y.orderActual; plTarget += y.plTarget; plActual += y.plActual }
      if (yp) prevOrderActual += yp.orderActual
    })
    const orderRate = orderTarget > 0 ? (orderActual / orderTarget) * 100 : 0
    const plRate = plTarget > 0 ? (plActual / plTarget) * 100 : 0
    const yoy = calcGrowthRate(orderTarget, prevOrderActual)
    const avgDealSize = myProjects.length > 0 ? Math.round(orderTarget / myProjects.length) : 0
    return { ...m, myProjects, orderTarget, orderActual, plTarget, plActual, orderRate, plRate, yoy, avgDealSize }
  })

  const barData = memberStats.map(m => ({
    name: m.name.split(' ')[0],
    受注目標: m.orderTarget,
    受注実績: m.orderActual,
    PL目標: m.plTarget,
    PL実績: m.plActual,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">メンバー生産性</h1>
        <p className="text-sm text-gray-500 mt-1">担当者別の目標達成状況と生産性指標</p>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {memberStats.map(m => {
          const rateColor = m.orderRate >= 100 ? 'border-green-300 bg-green-50' :
            m.orderRate >= 80 ? 'border-yellow-300 bg-yellow-50' : 'border-red-300 bg-red-50'
          const rateTextColor = m.orderRate >= 100 ? 'text-green-600' :
            m.orderRate >= 80 ? 'text-yellow-600' : 'text-red-600'
          return (
            <div key={m.id} className={`rounded-xl border p-5 ${rateColor}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-800 text-lg">{m.name}</div>
                  <div className="text-xs text-gray-500">担当 {m.myProjects.length}案件</div>
                </div>
                <div className={`text-xl font-bold ${rateTextColor}`}>{m.orderRate.toFixed(1)}%</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">受注目標</span>
                  <span className="font-medium">{formatManen(m.orderTarget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">受注実績</span>
                  <span className="font-medium">{formatManen(m.orderActual)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">PL目標</span>
                  <span className="font-medium">{formatManen(m.plTarget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">PL達成率</span>
                  <span className="font-medium">{m.plRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-500">平均案件単価</span>
                  <span className="font-semibold text-blue-700">{formatManen(m.avgDealSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">YoY成長率</span>
                  <span className={`font-semibold ${m.yoy >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                    {m.yoy >= 0 ? '+' : ''}{m.yoy.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Comparison Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">メンバー別 目標 vs 実績比較</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}万`} />
            <Tooltip formatter={(v: number) => formatManen(v)} />
            <Legend />
            <Bar dataKey="受注目標" fill="#93c5fd" radius={[3, 3, 0, 0]} />
            <Bar dataKey="受注実績" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="PL目標" fill="#6ee7b7" radius={[3, 3, 0, 0]} />
            <Bar dataKey="PL実績" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-member Project Tables */}
      {memberStats.map(m => (
        <div key={m.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <span className="font-semibold text-gray-800">{m.name}</span>
            <span className="text-sm text-gray-500 ml-2">担当案件一覧</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="text-left px-4 py-2">案件名</th>
                  <th className="text-right px-4 py-2">受注目標</th>
                  <th className="text-right px-4 py-2">受注実績</th>
                  <th className="text-right px-4 py-2">達成率</th>
                  <th className="text-right px-4 py-2">PL目標</th>
                  <th className="text-right px-4 py-2">媒体</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {m.myProjects.map(p => {
                  const y = p.years.find(d => d.year === currentYear)
                  const rate = y && y.orderTarget > 0 ? (y.orderActual / y.orderTarget) * 100 : 0
                  const rateColor = rate >= 100 ? 'text-green-600' : rate >= 80 ? 'text-yellow-600' : 'text-red-600'
                  const mediaLabel = p.media === 'search' ? '検索' : p.media === 'meta' ? 'Meta' : '検索+Meta'
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{p.name}</td>
                      <td className="px-4 py-2 text-right">{y ? formatManen(y.orderTarget) : '-'}</td>
                      <td className="px-4 py-2 text-right">{y ? formatManen(y.orderActual) : '-'}</td>
                      <td className={`px-4 py-2 text-right font-medium ${rateColor}`}>{rate.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-right">{y ? formatManen(y.plTarget) : '-'}</td>
                      <td className="px-4 py-2 text-right text-gray-500">{mediaLabel}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
