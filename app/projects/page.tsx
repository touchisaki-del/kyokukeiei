'use client'

import { useState, useRef, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { formatManen, calcGrowthRate, getDifficultyLabel } from '@/lib/utils'
import { Project, YearData } from '@/lib/types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { ChevronDown, ChevronUp, Clock, Plus, Trash2, Check, X, Pencil } from 'lucide-react'

// セルをクリックで直接編集できるコンポーネント
function InlineNumberCell({
  value,
  onSave,
  highlight,
}: {
  value: number
  onSave: (v: number) => void
  highlight?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commit = () => {
    const n = parseFloat(draft)
    if (!isNaN(n)) onSave(n)
    setEditing(false)
  }

  if (editing) {
    return (
      <span className="flex items-center justify-end gap-1">
        <input
          ref={inputRef}
          type="number"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          onBlur={commit}
          className="w-24 border border-blue-400 rounded px-1.5 py-0.5 text-right text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <span className="text-xs text-gray-400">万</span>
      </span>
    )
  }

  return (
    <span
      onClick={() => { setDraft(String(value)); setEditing(true) }}
      title="クリックして編集"
      className={`cursor-pointer rounded px-1 hover:bg-blue-50 hover:text-blue-700 transition-colors group flex items-center justify-end gap-1 ${highlight ? 'font-semibold' : ''}`}
    >
      {formatManen(value)}
      <Pencil size={11} className="opacity-0 group-hover:opacity-40" />
    </span>
  )
}

function AchievementBadge({ rate }: { rate: number }) {
  const cls =
    rate >= 100 ? 'bg-green-100 text-green-700 border border-green-300' :
    rate >= 80  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                  'bg-red-100 text-red-700 border border-red-300'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{rate.toFixed(1)}%</span>
}

function ProjectExpandedRow({
  project,
  onUpdate,
}: {
  project: Project
  onUpdate: (p: Project) => void
}) {
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState<Project>(JSON.parse(JSON.stringify(project)))

  const chartData = project.years.map(y => ({
    year: y.year.toString(),
    受注目標: y.orderTarget,
    受注実績: y.orderActual || undefined,
    PL目標: y.plTarget,
    PL実績: y.plActual || undefined,
  }))

  const lag = project.years[0]?.billingLagMonths ?? 0

  const handleSave = () => {
    onUpdate(draft)
    setEditMode(false)
  }

  const setYearField = (year: number, field: keyof YearData, value: number | string) => {
    setDraft(prev => ({
      ...prev,
      years: prev.years.map(y =>
        y.year === year ? { ...y, [field]: typeof value === 'string' ? parseFloat(value) || 0 : value } : y
      )
    }))
  }

  const inputCls = "border border-gray-300 rounded px-2 py-1 text-sm w-full text-right focus:outline-none focus:ring-1 focus:ring-blue-400"

  return (
    <tr>
      <td colSpan={12} className="px-4 py-5 bg-slate-50 border-b border-gray-200">
        <div className="flex flex-col gap-5">

          {/* チャート */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">3ヵ年推移 + 2025年目標</div>
            <ResponsiveContainer width="100%" height={200}>
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

          {/* 年別データ編集テーブル */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-700">年別データ</div>
              {!editMode ? (
                <button
                  onClick={() => { setDraft(JSON.parse(JSON.stringify(project))); setEditMode(true) }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
                >
                  <Pencil size={12} /> 編集モード
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex items-center gap-1 text-xs bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700">
                    <Check size={12} /> 保存
                  </button>
                  <button onClick={() => setEditMode(false)} className="flex items-center gap-1 text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-100">
                    <X size={12} /> キャンセル
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 text-xs text-gray-500 uppercase">
                    <th className="px-3 py-2 text-left">年</th>
                    <th className="px-3 py-2 text-right">受注目標</th>
                    <th className="px-3 py-2 text-right">受注実績</th>
                    <th className="px-3 py-2 text-right">PL目標</th>
                    <th className="px-3 py-2 text-right">PL実績</th>
                    <th className="px-3 py-2 text-right">請求ラグ(月)</th>
                    <th className="px-3 py-2 text-right">検索予算</th>
                    <th className="px-3 py-2 text-right">Meta予算</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {(editMode ? draft.years : project.years)
                    .slice()
                    .sort((a, b) => a.year - b.year)
                    .map(y => (
                    <tr key={y.year} className={y.year === 2025 ? 'bg-blue-50' : ''}>
                      <td className="px-3 py-2 font-semibold text-gray-700">{y.year}{y.year === 2025 && <span className="ml-1 text-xs text-blue-500">今期</span>}</td>
                      {editMode ? (
                        <>
                          <td className="px-3 py-1"><input type="number" className={inputCls} defaultValue={y.orderTarget} onBlur={e => setYearField(y.year, 'orderTarget', e.target.value)} /></td>
                          <td className="px-3 py-1"><input type="number" className={inputCls} defaultValue={y.orderActual} onBlur={e => setYearField(y.year, 'orderActual', e.target.value)} /></td>
                          <td className="px-3 py-1"><input type="number" className={inputCls} defaultValue={y.plTarget} onBlur={e => setYearField(y.year, 'plTarget', e.target.value)} /></td>
                          <td className="px-3 py-1"><input type="number" className={inputCls} defaultValue={y.plActual} onBlur={e => setYearField(y.year, 'plActual', e.target.value)} /></td>
                          <td className="px-3 py-1"><input type="number" className={inputCls} defaultValue={y.billingLagMonths} onBlur={e => setYearField(y.year, 'billingLagMonths', e.target.value)} /></td>
                          <td className="px-3 py-1"><input type="number" className={inputCls} defaultValue={y.searchBudget} onBlur={e => setYearField(y.year, 'searchBudget', e.target.value)} /></td>
                          <td className="px-3 py-1"><input type="number" className={inputCls} defaultValue={y.metaBudget} onBlur={e => setYearField(y.year, 'metaBudget', e.target.value)} /></td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-2 text-right">{formatManen(y.orderTarget)}</td>
                          <td className="px-3 py-2 text-right">{y.orderActual ? formatManen(y.orderActual) : <span className="text-gray-300">-</span>}</td>
                          <td className="px-3 py-2 text-right">{formatManen(y.plTarget)}</td>
                          <td className="px-3 py-2 text-right">{y.plActual ? formatManen(y.plActual) : <span className="text-gray-300">-</span>}</td>
                          <td className="px-3 py-2 text-right">{y.billingLagMonths}ヶ月</td>
                          <td className="px-3 py-2 text-right">{y.searchBudget ? formatManen(y.searchBudget) : <span className="text-gray-300">-</span>}</td>
                          <td className="px-3 py-2 text-right">{y.metaBudget ? formatManen(y.metaBudget) : <span className="text-gray-300">-</span>}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={12} />
              受注目標は契約締結時点、PL目標は実際の請求・計上時点（受注から{lag}ヶ月後）で管理
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

// 新規案件追加行
function AddProjectRow({ onAdd, members }: { onAdd: (p: Project) => void; members: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false)
  const emptyForm = {
    name: '', industry: '', memberId: members[0]?.id ?? 'm1',
    media: 'both' as 'search' | 'meta' | 'both',
    orderTarget: '', orderActual: '', plTarget: '', plActual: '',
    billingLag: '2', searchBudget: '', metaBudget: '',
  }
  const [form, setForm] = useState(emptyForm)

  const handleAdd = () => {
    if (!form.name.trim()) return
    const id = `p_${Date.now()}`
    const proj: Project = {
      id,
      name: form.name.trim(),
      industry: form.industry.trim(),
      memberId: form.memberId,
      media: form.media,
      years: [{
        year: 2025,
        orderTarget: parseFloat(form.orderTarget) || 0,
        orderActual: parseFloat(form.orderActual) || 0,
        plTarget: parseFloat(form.plTarget) || 0,
        plActual: parseFloat(form.plActual) || 0,
        billingLagMonths: parseInt(form.billingLag) || 2,
        searchBudget: parseFloat(form.searchBudget) || 0,
        metaBudget: parseFloat(form.metaBudget) || 0,
      }],
    }
    onAdd(proj)
    setForm(emptyForm)
    setOpen(false)
  }

  const inputCls = "border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"

  return (
    <>
      <tr>
        <td colSpan={12} className="px-4 py-2">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium py-1 hover:bg-blue-50 rounded px-2 transition-colors"
          >
            <Plus size={15} /> 新規案件を追加
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={12} className="px-4 pb-4 bg-blue-50 border-b border-blue-200">
            <div className="bg-white rounded-xl border border-blue-200 p-4">
              <div className="text-sm font-semibold text-gray-700 mb-3">新規案件 — 2025年目標を入力</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">案件名 *</label>
                  <input className={inputCls} placeholder="例：楽天系EC" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">業界</label>
                  <input className={inputCls} placeholder="例：EC" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">担当者</label>
                  <select className={inputCls} value={form.memberId} onChange={e => setForm({...form, memberId: e.target.value})}>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">媒体</label>
                  <select className={inputCls} value={form.media} onChange={e => setForm({...form, media: e.target.value as 'search'|'meta'|'both'})}>
                    <option value="both">検索 + Meta</option>
                    <option value="search">検索のみ</option>
                    <option value="meta">Metaのみ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">受注目標（万円）</label>
                  <input className={inputCls} type="number" placeholder="1000" value={form.orderTarget} onChange={e => setForm({...form, orderTarget: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">受注実績（万円）</label>
                  <input className={inputCls} type="number" placeholder="0" value={form.orderActual} onChange={e => setForm({...form, orderActual: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">PL目標（万円）</label>
                  <input className={inputCls} type="number" placeholder="900" value={form.plTarget} onChange={e => setForm({...form, plTarget: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">PL実績（万円）</label>
                  <input className={inputCls} type="number" placeholder="0" value={form.plActual} onChange={e => setForm({...form, plActual: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">請求ラグ（月）</label>
                  <input className={inputCls} type="number" placeholder="2" value={form.billingLag} onChange={e => setForm({...form, billingLag: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">検索予算（万円）</label>
                  <input className={inputCls} type="number" placeholder="0" value={form.searchBudget} onChange={e => setForm({...form, searchBudget: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Meta予算（万円）</label>
                  <input className={inputCls} type="number" placeholder="0" value={form.metaBudget} onChange={e => setForm({...form, metaBudget: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleAdd} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                  <Check size={14} /> 追加する
                </button>
                <button onClick={() => { setForm(emptyForm); setOpen(false) }} className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
                  <X size={14} /> キャンセル
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function ProjectsPage() {
  const { projects, members, industryRates, updateProject, addProject, deleteProject } = useData()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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

  // セル単体保存
  const patchYear2025 = (projectId: string, field: keyof YearData, value: number) => {
    const proj = projects.find(p => p.id === projectId)
    if (!proj) return
    const updated: Project = {
      ...proj,
      years: proj.years.map(y =>
        y.year === 2025 ? { ...y, [field]: value } : y
      ),
    }
    updateProject(updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">案件目標管理</h1>
        <p className="text-sm text-gray-500 mt-1">FY2025 — 数値セルをクリックして直接編集、行をクリックで詳細・全年編集</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
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
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(row => {
                const expanded = expandedId === row.id
                const yoyColor = row.yoy >= 0 ? 'text-blue-600' : 'text-red-500'
                const diffColor =
                  row.diff.color === 'green' ? 'bg-green-100 text-green-700' :
                  row.diff.color === 'red'   ? 'bg-red-100 text-red-700' :
                                               'bg-yellow-100 text-yellow-700'
                const mediaLabel = row.media === 'search' ? '検索' : row.media === 'meta' ? 'Meta' : '両方'

                return (
                  <>
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50 ${expanded ? 'bg-blue-50' : ''}`}
                    >
                      {/* 案件名 — クリックで展開 */}
                      <td
                        className="px-4 py-3 font-medium text-gray-800 cursor-pointer select-none"
                        onClick={() => setExpandedId(expanded ? null : row.id)}
                      >
                        {row.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{memberName(row.memberId)}</td>
                      <td className="px-4 py-3 text-gray-600">{row.industry}</td>
                      <td className="px-4 py-3 text-gray-600">{mediaLabel}</td>

                      {/* インライン編集セル */}
                      <td className="px-4 py-3 text-right">
                        {row.y25 ? (
                          <InlineNumberCell
                            value={row.y25.orderTarget}
                            onSave={v => patchYear2025(row.id, 'orderTarget', v)}
                            highlight
                          />
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.y25 ? (
                          <InlineNumberCell
                            value={row.y25.orderActual}
                            onSave={v => patchYear2025(row.id, 'orderActual', v)}
                          />
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right"><AchievementBadge rate={row.orderRate} /></td>
                      <td className="px-4 py-3 text-right">
                        {row.y25 ? (
                          <InlineNumberCell
                            value={row.y25.plTarget}
                            onSave={v => patchYear2025(row.id, 'plTarget', v)}
                            highlight
                          />
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.y25 ? (
                          <InlineNumberCell
                            value={row.y25.plActual}
                            onSave={v => patchYear2025(row.id, 'plActual', v)}
                          />
                        ) : '-'}
                      </td>

                      <td className={`px-4 py-3 text-right font-medium ${yoyColor}`}>
                        {row.yoy >= 0 ? '+' : ''}{row.yoy.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${diffColor}`}>{row.diff.label}</span>
                      </td>

                      {/* 展開 & 削除 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {deleteConfirm === row.id ? (
                            <>
                              <button onClick={() => { deleteProject(row.id); setDeleteConfirm(null) }} className="text-xs bg-red-500 text-white rounded px-1.5 py-0.5 hover:bg-red-600">削除</button>
                              <button onClick={() => setDeleteConfirm(null)} className="text-xs border rounded px-1.5 py-0.5 hover:bg-gray-100">✕</button>
                            </>
                          ) : (
                            <button onClick={() => setDeleteConfirm(row.id)} className="text-gray-300 hover:text-red-400 p-1 rounded transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedId(expanded ? null : row.id)}
                            className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
                          >
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded && (
                      <ProjectExpandedRow
                        key={`${row.id}-exp`}
                        project={projects.find(p => p.id === row.id)!}
                        onUpdate={updateProject}
                      />
                    )}
                  </>
                )
              })}

              {/* 新規追加行 */}
              <AddProjectRow onAdd={addProject} members={members} />
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>操作ガイド:</strong>
        　数値セルをクリック → 直接入力して Enter で保存
        　案件名または ∨ ボタンで行を展開 → 全年データの閲覧・一括編集
        　最下行の「新規案件を追加」から案件登録
      </div>
    </div>
  )
}
