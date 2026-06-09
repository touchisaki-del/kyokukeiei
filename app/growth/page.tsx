'use client'

import { useState } from 'react'
import { useData } from '../context/DataContext'
import { formatManen, calcGrowthRate, calcCAGR } from '@/lib/utils'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList
} from 'recharts'

export default function GrowthPage() {
  const { projects, members, industryRates } = useData()
  const [filterIndustry, setFilterIndustry] = useState('all')
  const [filterMember, setFilterMember] = useState('all')

  const industries = Array.from(new Set(projects.map(p => p.industry)))

  const filtered = projects.filter(p =>
    (filterIndustry === 'all' || p.industry === filterIndustry) &&
    (filterMember === 'all' || p.memberId === filterMember)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">成長分析</h1>
        <p className="text-sm text-gray-500 mt-1">案件別 受注実績・目標の推移と成長率</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="text-xs text-gray-500 mr-2">業界</label>
          <select
            value={filterIndustry}
            onChange={e => setFilterIndustry(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全業界</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mr-2">担当</label>
          <select
            value={filterMember}
            onChange={e => setFilterMember(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全員</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {/* Per-project charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map(project => {
          const years = [2022, 2023, 2024, 2025]
          const chartData = years.map(yr => {
            const y = project.years.find(d => d.year === yr)
            const prevY = project.years.find(d => d.year === yr - 1)
            const growthRate = prevY && y ? calcGrowthRate(
              yr === 2025 ? y.orderTarget : (y?.orderActual ?? 0),
              prevY.orderActual
            ) : null
            return {
              year: yr.toString(),
              実績: yr < 2025 ? (y?.orderActual ?? 0) : undefined,
              目標2025: yr === 2025 ? y?.orderTarget : undefined,
              growthLabel: growthRate !== null ? `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%` : '',
            }
          })

          // CAGR from 2022 actual to 2024 actual
          const y22 = project.years.find(y => y.year === 2022)?.orderActual ?? 0
          const y24 = project.years.find(y => y.year === 2024)?.orderActual ?? 0
          const y25target = project.years.find(y => y.year === 2025)?.orderTarget ?? 0
          const cagr2224 = calcCAGR(y24, y22, 2)
          const cagr2225 = calcCAGR(y25target, y22, 3)
          const marketGrowth = industryRates.find(r => r.industry === project.industry)?.growthRate2025 ?? 5

          return (
            <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{project.name}</h3>
                  <span className="text-xs text-gray-500">{project.industry}</span>
                </div>
                <div className="text-right text-xs space-y-0.5">
                  <div className="text-gray-500">CAGR('22-'24): <span className="font-semibold text-blue-600">{cagr2224.toFixed(1)}%</span></div>
                  <div className="text-gray-500">CAGR('22-'25目): <span className="font-semibold text-indigo-600">{cagr2225.toFixed(1)}%</span></div>
                  <div className="text-gray-500">市況成長率: <span className="font-semibold text-gray-700">{marketGrowth.toFixed(1)}%</span></div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}万`} />
                  <Tooltip formatter={(v: number) => formatManen(v)} />
                  <Legend />
                  <Bar dataKey="実績" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="growthLabel"
                      position="top"
                      style={{ fontSize: '10px', fill: '#4b5563' }}
                    />
                  </Bar>
                  <Bar dataKey="目標2025" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-400 py-12">条件に一致する案件がありません</div>
      )}
    </div>
  )
}
