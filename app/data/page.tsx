'use client'

import { useState, useRef } from 'react'
import { useData } from '../context/DataContext'
import { formatManen } from '@/lib/utils'
import { Project, YearData } from '@/lib/types'
import { Upload, Download, Plus, Trash2, Save } from 'lucide-react'

const CSV_TEMPLATE_HEADER = '案件名,業界,担当者ID,媒体,年,受注目標,受注実績,PL目標,PL実績,請求ラグ(月),検索予算,Meta予算'
const CSV_TEMPLATE_ROW = 'サンプル案件,EC,m1,both,2025,1000,500,900,200,2,600,400'

function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function DataPage() {
  const { projects, members, addProject, updateProject, deleteProject } = useData()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [newProject, setNewProject] = useState({
    name: '', industry: '', memberId: 'm1', media: 'both' as 'search'|'meta'|'both',
    orderTarget: '', orderActual: '', plTarget: '', plActual: '', billingLag: '2',
    searchBudget: '', metaBudget: ''
  })

  const handleExport = () => {
    const rows = [CSV_TEMPLATE_HEADER]
    projects.forEach(p => {
      p.years.forEach(y => {
        rows.push([p.name, p.industry, p.memberId, p.media, y.year,
          y.orderTarget, y.orderActual, y.plTarget, y.plActual,
          y.billingLagMonths, y.searchBudget, y.metaBudget].join(','))
      })
    })
    downloadCSV(rows.join('\n'), 'kyokukeiei_export.csv')
    setMessage('CSVをエクスポートしました')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleTemplateDownload = () => {
    downloadCSV([CSV_TEMPLATE_HEADER, CSV_TEMPLATE_ROW].join('\n'), 'template.csv')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = (ev.target?.result as string).replace(/^﻿/, '')
      const lines = text.trim().split('\n').slice(1)
      const projectMap: Record<string, Project> = {}
      lines.forEach(line => {
        const cols = line.split(',')
        if (cols.length < 12) return
        const [name, industry, memberId, media, yearStr, orderTarget, orderActual, plTarget, plActual, billingLag, searchBudget, metaBudget] = cols
        const year = parseInt(yearStr)
        const id = `imported_${name.trim()}`
        if (!projectMap[id]) {
          projectMap[id] = { id, name: name.trim(), industry: industry.trim(), memberId: memberId.trim(), media: media.trim() as 'search'|'meta'|'both', years: [] }
        }
        const yd: YearData = {
          year, orderTarget: parseFloat(orderTarget)||0, orderActual: parseFloat(orderActual)||0,
          plTarget: parseFloat(plTarget)||0, plActual: parseFloat(plActual)||0,
          billingLagMonths: parseInt(billingLag)||2, searchBudget: parseFloat(searchBudget)||0, metaBudget: parseFloat(metaBudget)||0
        }
        projectMap[id].years.push(yd)
      })
      Object.values(projectMap).forEach(p => addProject(p))
      setMessage(`${Object.keys(projectMap).length}件の案件をインポートしました`)
      setTimeout(() => setMessage(''), 4000)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  const handleAdd = () => {
    if (!newProject.name) { setMessage('案件名を入力してください'); return }
    const id = `p_${Date.now()}`
    const proj: Project = {
      id, name: newProject.name, industry: newProject.industry,
      memberId: newProject.memberId, media: newProject.media,
      years: [{
        year: 2025,
        orderTarget: parseFloat(newProject.orderTarget)||0,
        orderActual: parseFloat(newProject.orderActual)||0,
        plTarget: parseFloat(newProject.plTarget)||0,
        plActual: parseFloat(newProject.plActual)||0,
        billingLagMonths: parseInt(newProject.billingLag)||2,
        searchBudget: parseFloat(newProject.searchBudget)||0,
        metaBudget: parseFloat(newProject.metaBudget)||0,
      }]
    }
    addProject(proj)
    setNewProject({ name: '', industry: '', memberId: 'm1', media: 'both', orderTarget: '', orderActual: '', plTarget: '', plActual: '', billingLag: '2', searchBudget: '', metaBudget: '' })
    setMessage('案件を追加しました')
    setTimeout(() => setMessage(''), 3000)
  }

  const inputClass = "border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">データ管理</h1>
        <p className="text-sm text-gray-500 mt-1">案件データのインポート・エクスポート・手動入力</p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-300 text-green-800 rounded-lg px-4 py-3 text-sm font-medium">
          {message}
        </div>
      )}

      {/* Import/Export */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={handleTemplateDownload}
          className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl p-4 text-sm font-medium transition-colors">
          <Download size={18} /> CSVテンプレートDL
        </button>
        <button onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 text-sm font-medium transition-colors">
          <Upload size={18} /> CSVインポート
        </button>
        <button onClick={handleExport}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl p-4 text-sm font-medium transition-colors">
          <Download size={18} /> 現在のデータをエクスポート
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-500">
        <span className="font-semibold text-gray-700">CSVフォーマット：</span>
        {CSV_TEMPLATE_HEADER}
      </div>

      {/* Add New Project */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2"><Plus size={18} /> 新規案件追加（2025年）</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="text-xs text-gray-500 mb-1 block">案件名 *</label><input className={inputClass} value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} placeholder="例：楽天系EC" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">業界</label><input className={inputClass} value={newProject.industry} onChange={e => setNewProject({...newProject, industry: e.target.value})} placeholder="例：EC" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">担当者</label>
            <select className={inputClass} value={newProject.memberId} onChange={e => setNewProject({...newProject, memberId: e.target.value})}>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">媒体</label>
            <select className={inputClass} value={newProject.media} onChange={e => setNewProject({...newProject, media: e.target.value as 'search'|'meta'|'both'})}>
              <option value="both">検索+Meta</option>
              <option value="search">検索のみ</option>
              <option value="meta">Metaのみ</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">受注目標（万円）</label><input className={inputClass} type="number" value={newProject.orderTarget} onChange={e => setNewProject({...newProject, orderTarget: e.target.value})} placeholder="1000" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">受注実績（万円）</label><input className={inputClass} type="number" value={newProject.orderActual} onChange={e => setNewProject({...newProject, orderActual: e.target.value})} placeholder="0" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">PL目標（万円）</label><input className={inputClass} type="number" value={newProject.plTarget} onChange={e => setNewProject({...newProject, plTarget: e.target.value})} placeholder="900" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">PL実績（万円）</label><input className={inputClass} type="number" value={newProject.plActual} onChange={e => setNewProject({...newProject, plActual: e.target.value})} placeholder="0" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">請求ラグ（月）</label><input className={inputClass} type="number" value={newProject.billingLag} onChange={e => setNewProject({...newProject, billingLag: e.target.value})} placeholder="2" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">検索予算（万円）</label><input className={inputClass} type="number" value={newProject.searchBudget} onChange={e => setNewProject({...newProject, searchBudget: e.target.value})} placeholder="0" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Meta予算（万円）</label><input className={inputClass} type="number" value={newProject.metaBudget} onChange={e => setNewProject({...newProject, metaBudget: e.target.value})} placeholder="0" /></div>
        </div>
        <button onClick={handleAdd}
          className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors">
          <Save size={16} /> 追加する
        </button>
      </div>

      {/* Project List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-700">登録案件一覧 ({projects.length}件)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase border-b border-gray-100">
                <th className="text-left px-4 py-3">案件名</th>
                <th className="text-left px-4 py-3">業界</th>
                <th className="text-left px-4 py-3">担当</th>
                <th className="text-left px-4 py-3">媒体</th>
                <th className="text-right px-4 py-3">2025受注目標</th>
                <th className="text-right px-4 py-3">データ年数</th>
                <th className="text-center px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map(p => {
                const y2025 = p.years.find(d => d.year === 2025)
                const member = members.find(m => m.id === p.memberId)?.name ?? p.memberId
                const mediaLabel = p.media === 'search' ? '検索' : p.media === 'meta' ? 'Meta' : '検索+Meta'
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.industry}</td>
                    <td className="px-4 py-3 text-gray-600">{member}</td>
                    <td className="px-4 py-3 text-gray-600">{mediaLabel}</td>
                    <td className="px-4 py-3 text-right">{y2025 ? formatManen(y2025.orderTarget) : '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{p.years.length}年分</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => deleteProject(p.id)}
                        className="text-red-400 hover:text-red-600 p-1 rounded transition-colors">
                        <Trash2 size={15} />
                      </button>
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
