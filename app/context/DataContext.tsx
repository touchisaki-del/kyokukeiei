'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Project, Member, IndustryRate } from '@/lib/types'
import { sampleProjects, sampleMembers, industryRates as sampleIndustryRates } from '@/lib/sampleData'

interface DataContextType {
  projects: Project[]
  members: Member[]
  industryRates: IndustryRate[]
  setProjects: (projects: Project[]) => void
  setMembers: (members: Member[]) => void
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  deleteProject: (id: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjectsState] = useState<Project[]>(sampleProjects)
  const [members] = useState<Member[]>(sampleMembers)
  const [industryRates] = useState<IndustryRate[]>(sampleIndustryRates)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kyokukeiei_projects')
      if (stored) {
        try {
          setProjectsState(JSON.parse(stored))
        } catch {
          setProjectsState(sampleProjects)
        }
      }
    }
  }, [])

  const setProjects = (newProjects: Project[]) => {
    setProjectsState(newProjects)
    if (typeof window !== 'undefined') {
      localStorage.setItem('kyokukeiei_projects', JSON.stringify(newProjects))
    }
  }

  const setMembers = () => {}

  const addProject = (project: Project) => {
    const updated = [...projects, project]
    setProjects(updated)
  }

  const updateProject = (project: Project) => {
    const updated = projects.map(p => p.id === project.id ? project : p)
    setProjects(updated)
  }

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id)
    setProjects(updated)
  }

  return (
    <DataContext.Provider value={{
      projects, members, industryRates,
      setProjects, setMembers, addProject, updateProject, deleteProject
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
