'use client'

import React from 'react'

interface ClassStat {
  className: string
  count: number
}

interface StatusStat {
  status: string
  count: number
  color: string
}

interface MonthStat {
  month: string
  count: number
}

interface DashboardChartsProps {
  classStats: ClassStat[]
  statusStats: StatusStat[]
  monthlyStats: MonthStat[]
  totalAdmissions: number
}

export function DashboardCharts({
  classStats,
  statusStats,
  monthlyStats,
  totalAdmissions,
}: DashboardChartsProps) {
  const maxClassCount = Math.max(...classStats.map((c) => c.count), 1)
  const maxMonthCount = Math.max(...monthlyStats.map((m) => m.count), 1)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
      {/* 1. Applications by Class */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid hsl(220, 20%, 90%)', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
            Applications by Class
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Distribution of student enrollment requests across academic grades
          </p>
        </div>

        {classStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'hsl(220, 15%, 50%)' }}>
            No class data recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {classStats.map((item) => {
              const percentage = Math.round((item.count / maxClassCount) * 100)
              const totalPercentage = totalAdmissions > 0 ? Math.round((item.count / totalAdmissions) * 100) : 0

              return (
                <div key={item.className}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    <span style={{ color: 'hsl(220, 30%, 20%)' }}>{item.className}</span>
                    <span style={{ color: 'hsl(220, 70%, 40%)' }}>
                      {item.count} <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)' }}>({totalPercentage}%)</span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'hsl(220, 20%, 94%)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.max(percentage, 6)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, hsl(220, 70%, 45%), hsl(220, 80%, 55%))',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. Applications by Status */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid hsl(220, 20%, 90%)', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
            Application Pipeline Status
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Current progression of applicants through admission workflow
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {statusStats.map((s) => (
            <div
              key={s.status}
              style={{
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid hsl(220, 20%, 92%)',
                background: 'hsl(220, 20%, 98%)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', color: 'hsl(220, 15%, 45%)', marginTop: '0.2rem' }}>
                {s.status.toLowerCase().replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>

        {/* 3. Monthly Submission Trend */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'hsl(220, 30%, 20%)', margin: '0 0 0.75rem 0' }}>
            Recent Submission Volume
          </h4>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '90px', paddingBottom: '0.5rem' }}>
            {monthlyStats.map((m) => {
              const heightPct = Math.max(Math.round((m.count / maxMonthCount) * 100), 12)
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'hsl(220, 70%, 40%)', marginBottom: '0.25rem' }}>
                    {m.count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      background: 'hsl(40, 92%, 48%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  <span style={{ fontSize: '0.6875rem', color: 'hsl(220, 15%, 45%)', marginTop: '0.35rem' }}>
                    {m.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
