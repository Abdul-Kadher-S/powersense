"use client"
import { useState } from "react"
import { Upload, FileText, CheckCircle, AlertTriangle, X, Plus, Zap } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import api from "@/lib/api"

type Tab = "bill" | "manual" | "appliance"

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState<Tab>("bill")

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <Upload className="w-6 h-6 inline-block text-purple-400 mr-2 -mt-1" />
            Data Upload
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Upload bills, add readings, or register appliances
          </p>
        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            📋 Demo application — uploaded bills are processed only for extracting consumption information. No data is shared externally.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: "bill" as Tab, label: "Upload Bill", icon: FileText },
            { id: "manual" as Tab, label: "Manual Entry", icon: Zap },
            { id: "appliance" as Tab, label: "Add Appliance", icon: Plus },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: activeTab === tab.id ? '#3b82f6' : 'var(--text-muted)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(59,130,246,0.2)' : 'var(--border-default)'}`,
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "bill" && <BillUploadSection />}
        {activeTab === "manual" && <ManualEntrySection />}
        {activeTab === "appliance" && <ApplianceFormSection />}
      </div>
    </AppLayout>
  )
}

function BillUploadSection() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean; billing_period?: string | null; units_consumed?: number | null;
    bill_amount?: number | null; message: string;
  } | null>(null)
  const [editData, setEditData] = useState({ month: 9, year: 2026, units_consumed: 0, bill_amount: 0 })
  const [saved, setSaved] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setResult(null)
    try {
      const data = await api.uploadBill(file)
      setResult(data)
      if (data.units_consumed) setEditData(prev => ({ ...prev, units_consumed: data.units_consumed || 0 }))
      if (data.bill_amount) setEditData(prev => ({ ...prev, bill_amount: data.bill_amount || 0 }))
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : "Upload failed" })
    } finally {
      setUploading(false)
    }
  }

  const handleConfirm = async () => {
    try {
      await api.confirmBill(editData)
      setSaved(true)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Upload Electricity Bill</h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        Upload a JPG, PNG, or PDF bill. AI will extract consumption data.
      </p>

      {/* Upload area */}
      <div
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-blue-400/30"
        style={{ borderColor: 'var(--border-default)' }}
        onClick={() => document.getElementById('bill-file')?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]) }}
      >
        <input
          id="bill-file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]) }}
        />
        <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{file.name}</span>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null) }}>
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Drop your bill here or click to browse</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PDF, JPG, PNG — Max 10MB</p>
          </>
        )}
      </div>

      {file && !result && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        >
          {uploading ? "Processing document..." : "Upload & Extract"}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 p-4 rounded-xl" style={{
          background: result.success ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
          border: `1px solid ${result.success ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`,
        }}>
          <div className="flex items-center gap-2 mb-2">
            {result.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{result.message}</span>
          </div>
          
          {/* Editable fields */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <FormField label="Month" type="number" value={editData.month} onChange={v => setEditData(p => ({ ...p, month: Number(v) }))} />
            <FormField label="Year" type="number" value={editData.year} onChange={v => setEditData(p => ({ ...p, year: Number(v) }))} />
            <FormField label="Units (kWh)" type="number" value={editData.units_consumed} onChange={v => setEditData(p => ({ ...p, units_consumed: Number(v) }))} />
            <FormField label="Bill Amount (₹)" type="number" value={editData.bill_amount} onChange={v => setEditData(p => ({ ...p, bill_amount: Number(v) }))} />
          </div>
          
          {!saved ? (
            <button onClick={handleConfirm}
              className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
              Confirm & Save
            </button>
          ) : (
            <div className="mt-3 p-2 rounded-lg text-center text-sm font-medium text-emerald-400"
              style={{ background: 'rgba(16,185,129,0.1)' }}>
              ✓ Data saved successfully!
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ManualEntrySection() {
  const [data, setData] = useState({ month: 9, year: 2026, units_consumed: 0, bill_amount: 0 })
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    try {
      await api.addElectricityReading(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { console.error(err) }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Manual Electricity Reading</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Month" type="number" value={data.month} onChange={v => setData(p => ({ ...p, month: Number(v) }))} />
        <FormField label="Year" type="number" value={data.year} onChange={v => setData(p => ({ ...p, year: Number(v) }))} />
        <FormField label="Units Consumed (kWh)" type="number" value={data.units_consumed} onChange={v => setData(p => ({ ...p, units_consumed: Number(v) }))} />
        <FormField label="Bill Amount (₹)" type="number" value={data.bill_amount} onChange={v => setData(p => ({ ...p, bill_amount: Number(v) }))} />
      </div>
      <button onClick={handleSave}
        className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
        Save Reading
      </button>
      {saved && (
        <div className="mt-3 p-2 rounded-lg text-center text-sm font-medium text-emerald-400"
          style={{ background: 'rgba(16,185,129,0.1)' }}>
          ✓ Reading saved!
        </div>
      )}
    </div>
  )
}

function ApplianceFormSection() {
  const [data, setData] = useState({
    name: '', category: 'Kitchen', brand: '', model: '', purchase_year: 2024,
    age_years: 2, usage_hours_daily: 4, usage_days_per_week: 7,
    energy_rating: '3-Star', rated_power_watts: 500, maintenance_frequency_months: 12,
    reported_issues: 0, icon: 'cpu',
  })
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!data.name) return
    try {
      await api.createAppliance(data)
      setSaved(true)
      setData({ ...data, name: '', brand: '', model: '' })
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { console.error(err) }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Add New Appliance</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Appliance Name *" value={data.name} onChange={v => setData(p => ({ ...p, name: v }))} />
        <FormField label="Category" value={data.category} onChange={v => setData(p => ({ ...p, category: v }))} />
        <FormField label="Brand" value={data.brand} onChange={v => setData(p => ({ ...p, brand: v }))} />
        <FormField label="Model" value={data.model} onChange={v => setData(p => ({ ...p, model: v }))} />
        <FormField label="Purchase Year" type="number" value={data.purchase_year} onChange={v => setData(p => ({ ...p, purchase_year: Number(v) }))} />
        <FormField label="Age (Years)" type="number" value={data.age_years} onChange={v => setData(p => ({ ...p, age_years: Number(v) }))} />
        <FormField label="Usage Hours/Day" type="number" value={data.usage_hours_daily} onChange={v => setData(p => ({ ...p, usage_hours_daily: Number(v) }))} />
        <FormField label="Power Rating (Watts)" type="number" value={data.rated_power_watts} onChange={v => setData(p => ({ ...p, rated_power_watts: Number(v) }))} />
      </div>
      <button onClick={handleSave}
        className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        disabled={!data.name}>
        Add Appliance
      </button>
      {saved && (
        <div className="mt-3 p-2 rounded-lg text-center text-sm font-medium text-emerald-400"
          style={{ background: 'rgba(16,185,129,0.1)' }}>
          ✓ Appliance added!
        </div>
      )}
    </div>
  )
}

function FormField({ label, value, onChange, type = "text" }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        onFocus={(e) => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
      />
    </div>
  )
}
