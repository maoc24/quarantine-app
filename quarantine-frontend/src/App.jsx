import { useState, useEffect } from 'react'
import FilterBar from './components/FilterBar'
import QuarantineTable from './components/QuarantineTable'

export default function App() {
  const [filters, setFilters] = useState({
    query: '',
    startDate: null,
    endDate: null
  })
  const [msgs, setMsgs]       = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    // Construye la URL con params:
    const params = new URLSearchParams()
    params.set('domain', 'colombiacloud')
    if (filters.query)      params.set('q', filters.query)
    if (filters.startDate)  params.set('from', filters.startDate.toISOString())
    if (filters.endDate)    params.set('to',   filters.endDate.toISOString())

    const res  = await fetch(`http://localhost:5148/api/quarantine?${params}`)
    const data = await res.json()
    setMsgs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-6xl mx-auto my-6 space-y-6">
      <FilterBar filters={filters} onChange={setFilters} />
      {loading
        ? <p className="p-4">Cargando…</p>
        : <QuarantineTable messages={msgs} />}
    </div>
  )
}
