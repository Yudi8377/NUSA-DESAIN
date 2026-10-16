import { useMemo, useState } from 'react'
import { Layers3, Rotate3D, Eye, EyeOff, Info, MoveUpRight, ShieldCheck } from 'lucide-react'

type LayerId = 'structure' | 'envelope' | 'mep' | 'interior'
type SystemId = 'building' | 'structure' | 'mep' | 'workflow'

const systems: { id: SystemId; label: string; subtitle: string }[] = [
  { id: 'building', label: 'Anatomi gedung', subtitle: 'Lapisan bangunan dan koordinasi disiplin' },
  { id: 'structure', label: 'Struktur', subtitle: 'Elemen struktur konseptual' },
  { id: 'mep', label: 'MEP', subtitle: 'Jalur mekanikal, elektrikal, dan plumbing' },
  { id: 'workflow', label: 'Alur proyek', subtitle: 'Hubungan desain sampai pelaksanaan' },
]
const layerInfo: { id: LayerId; label: string; color: string; description: string }[] = [
  { id: 'structure', label: 'Struktur', color: '#4c8395', description: 'Kolom, balok, dan pelat sebagai skema massa struktur.' },
  { id: 'envelope', label: 'Selubung', color: '#6eaaa0', description: 'Fasad dan bidang pelindung bangunan secara ilustratif.' },
  { id: 'mep', label: 'MEP', color: '#d99b62', description: 'Jalur servis konseptual untuk koordinasi lintas disiplin.' },
  { id: 'interior', label: 'Interior', color: '#a69ac8', description: 'Pembagian ruang dan elemen interior ilustratif.' },
]

function IsoBlock({ x, y, w, d, h, top, left, right, opacity = 1 }: { x:number;y:number;w:number;d:number;h:number;top:string;left:string;right:string;opacity?:number }) {
  const p = (a:number,b:number) => a + ',' + b
  const A = [x, y], B = [x+w, y+Math.round(d*.45)], C = [x, y+d], D = [x-w, y+Math.round(d*.45)]
  return <g opacity={opacity}>
    <polygon points={[p(D[0],D[1]),p(C[0],C[1]),p(C[0],C[1]+h),p(D[0],D[1]+h)].join(' ')} fill={left} stroke="#fff" strokeOpacity=".45" strokeWidth="1"/>
    <polygon points={[p(C[0],C[1]),p(B[0],B[1]),p(B[0],B[1]+h),p(C[0],C[1]+h)].join(' ')} fill={right} stroke="#fff" strokeOpacity=".45" strokeWidth="1"/>
    <polygon points={[p(A[0],A[1]),p(B[0],B[1]),p(C[0],C[1]),p(D[0],D[1])].join(' ')} fill={top} stroke="#fff" strokeOpacity=".65" strokeWidth="1"/>
  </g>
}

function BuildingDiagram({ system, visible, exploded }: { system:SystemId; visible:Record<LayerId,boolean>; exploded:boolean }) {
  if (system === 'workflow') return <svg viewBox="0 0 700 420" role="img" aria-label="Diagram alur kerja proyek arsitektur dan konstruksi">
    <defs><linearGradient id="wf" x1="0" x2="1"><stop stopColor="#e3f0ee"/><stop offset="1" stopColor="#f5f8fb"/></linearGradient></defs>
    <path d="M125 200 H570" stroke="#9ab6b8" strokeWidth="3" strokeDasharray="7 7"/>
    {[{x:105,title:'Brief',sub:'Kebutuhan klien',n:'01'},{x:270,title:'Desain',sub:'Konsep & koordinasi',n:'02'},{x:435,title:'RAB',sub:'Volume & biaya',n:'03'},{x:590,title:'Pelaksanaan',sub:'Kontrol lapangan',n:'04'}].map((v,i)=><g key={v.n} transform={'translate('+(v.x-58)+' 143)'}>
      <rect x="0" y="0" width="116" height="112" rx="12" fill="url(#wf)" stroke="#cbdedc"/>
      <circle cx="58" cy="27" r="15" fill={['#4f8985','#638da2','#c39160','#637e72'][i]}/>
      <text x="58" y="31" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">{v.n}</text>
      <text x="58" y="62" textAnchor="middle" fontSize="13" fontWeight="700" fill="#2c4353">{v.title}</text>
      <text x="58" y="81" textAnchor="middle" fontSize="8.5" fill="#718493">{v.sub}</text>
    </g>)}
    <text x="350" y="92" textAnchor="middle" fontSize="16" fontWeight="700" fill="#294354">Siklus koordinasi proyek</text>
    <text x="350" y="315" textAnchor="middle" fontSize="11" fill="#6e8291">Setiap tahap menghasilkan data dan persetujuan yang dapat ditelusuri.</text>
    <text x="350" y="337" textAnchor="middle" fontSize="9" fill="#98a6b1">Diagram proses konseptual · sesuaikan dengan SOP perusahaan</text>
  </svg>

  const lift = exploded ? 22 : 0
  return <svg viewBox="0 0 700 420" role="img" aria-label="Ilustrasi isometrik anatomi bangunan berlapis">
    <defs><linearGradient id="ground" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#edf3f5"/><stop offset="1" stopColor="#e1eaee"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#5c7782" floodOpacity=".12"/></filter></defs>
    <ellipse cx="350" cy="345" rx="230" ry="36" fill="#d8e3e8" opacity=".48"/>
    <g filter="url(#shadow)">
      {visible.structure && <g transform={'translate(0 '+(-lift*1.3)+')'}>
        {[0,1,2,3].map((n)=><g key={n}><IsoBlock x={245+n*70} y={116} w={8} d={4} h={170} top="#85aab6" left="#527e8e" right="#3f6979"/></g>)}
        {[0,1,2].map((n)=><g key={n}><IsoBlock x={350} y={153+n*54} w={122} d={13} h={7} top="#b4cdd4" left="#7297a5" right="#5c8392"/></g>)}
        <IsoBlock x={350} y={282} w={140} d={62} h={12} top="#9dbcc6" left="#608b9b" right="#4c7788"/>
      </g>}
      {visible.envelope && <g transform={'translate(0 '+(-lift*.8)+')'}>
        <IsoBlock x={350} y={111} w={112} d={47} h={150} top="#c2e0d8" left="#75aaa3" right="#4f8c89" opacity={system === 'structure' ? 0.24 : 0.72}/>
        {[0,1,2,3].map((n)=><path key={n} d={'M'+(266+n*21)+' '+(130+n*4)+' l0 130'} stroke="#e7f5f1" strokeWidth="2" opacity=".85"/>)}
      </g>}
      {visible.interior && <g transform={'translate(0 '+(-lift*.45)+')'}>{[0,1,2].map((n)=><g key={n}><IsoBlock x={315+n*20} y={184+n*17} w={26} d={15} h={16} top="#d8d0ed" left="#a99bc9" right="#8b7bb0" opacity=".9"/></g>)}</g>}
      {visible.mep && <g transform={'translate(0 '+(-lift*.6)+')'} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M292 132 L292 280 L330 296 L330 222 L378 198 L378 135" stroke="#d9904e" strokeWidth="7"/><path d="M310 150 L390 185 L390 257" stroke="#4f9db2" strokeWidth="5"/><path d="M292 220 L252 201 L252 158" stroke="#d5ad4e" strokeWidth="4"/><circle cx="292" cy="132" r="5" fill="#d9904e"/><circle cx="390" cy="257" r="5" fill="#4f9db2"/>
      </g>}
    </g>
    <g fill="#6d8492" fontSize="10"><text x="500" y="112">Selubung</text><path d="M489 116 L455 145" stroke="#91aaa9" strokeDasharray="3 3" fill="none"/><text x="155" y="205">Struktur</text><path d="M202 201 L242 220" stroke="#91aaa9" strokeDasharray="3 3" fill="none"/><text x="468" y="281">Jalur MEP</text><path d="M460 275 L395 250" stroke="#91aaa9" strokeDasharray="3 3" fill="none"/></g>
    <text x="350" y="390" textAnchor="middle" fontSize="10" fill="#879aa5">{exploded ? 'Tampilan lapisan terurai (eksplorasi)' : 'Tampilan lapisan terkoordinasi (eksplorasi)'}</text>
  </svg>
}

export default function AnatomyExplorer() {
  const [system, setSystem] = useState<SystemId>('building')
  const [exploded, setExploded] = useState(false)
  const [visible, setVisible] = useState<Record<LayerId,boolean>>({ structure:true, envelope:true, mep:true, interior:true })
  const [activeLayer, setActiveLayer] = useState<LayerId>('structure')
  const selected = useMemo(() => layerInfo.find((item) => item.id === activeLayer) ?? layerInfo[0], [activeLayer])

  return <div className="anatomy-page">
    <section className="anatomy-hero">
      <div><div className="anatomy-eyebrow"><Rotate3D size={14}/> DESIGN INTELLIGENCE / TECHNICAL VISUALS</div><h1>Anatomi Bangunan</h1><p>Jelaskan sistem arsitektur dan konstruksi melalui ilustrasi isometrik berlapis yang dapat dieksplorasi tim proyek.</p><div className="anatomy-tags"><span><Layers3 size={13}/> Diagram berlapis</span><span><Eye size={13}/> Interaktif</span><span><ShieldCheck size={13}/> Konseptual, bukan gambar kerja</span></div></div>
      <div className="anatomy-hero-art" aria-hidden="true"><div className="anatomy-orbit"/><div className="anatomy-cube"><i/><i/><i/></div><span>BUILDING SYSTEMS / 01</span></div>
    </section>
    <div className="anatomy-tabs" role="tablist" aria-label="Pilih jenis diagram">{systems.map((item)=><button key={item.id} role="tab" aria-selected={system===item.id} className={system===item.id?'active':''} onClick={()=>setSystem(item.id)}><b>{item.label}</b><small>{item.subtitle}</small></button>)}</div>
    <section className="anatomy-workspace">
      <article className="anatomy-visual-panel">
        <div className="anatomy-panel-heading"><div><span className="anatomy-step">01</span><div><h2>{systems.find((s)=>s.id===system)?.label}</h2><p>{systems.find((s)=>s.id===system)?.subtitle}</p></div></div>{system!=='workflow' && <button className={'anatomy-toggle '+(exploded?'on':'')} onClick={()=>setExploded(!exploded)}><MoveUpRight size={14}/>{exploded?'Rapatkan lapisan':'Urai lapisan'}</button>}</div>
        <div className="anatomy-diagram"><BuildingDiagram system={system} visible={visible} exploded={exploded}/></div>
        {system!=='workflow' && <div className="anatomy-legend">{layerInfo.map((layer)=><button key={layer.id} className={visible[layer.id]?'visible':''} onClick={()=>setVisible(prev=>({...prev,[layer.id]:!prev[layer.id]}))}><span style={{background:layer.color}}/>{layer.label}{visible[layer.id]?<Eye size={13}/>:<EyeOff size={13}/>}</button>)}</div>}
      </article>
      <aside className="anatomy-side">
        <article className="anatomy-info-card"><div className="anatomy-panel-heading"><div><span className="anatomy-step">02</span><div><h2>Inspektor lapisan</h2><p>Pilih disiplin untuk membaca perannya.</p></div></div></div>
          <div className="anatomy-layer-list">{layerInfo.map((layer)=><button key={layer.id} className={activeLayer===layer.id?'selected':''} onClick={()=>setActiveLayer(layer.id)}><span style={{background:layer.color}}/><span><b>{layer.label}</b><small>{layer.description}</small></span></button>)}</div>
          <div className="anatomy-selected-detail"><span style={{background:selected.color}}/><div><b>{selected.label}</b><p>{selected.description}</p></div></div>
        </article>
        <article className="anatomy-note-card"><Info size={17}/><div><b>Batas penggunaan</b><p>Visualisasi ini adalah ilustrasi sistem generik. Dimensi, beban, sambungan, jalur servis, spesifikasi material, serta kepatuhan standar harus divalidasi dari model dan dokumen proyek oleh tenaga profesional.</p></div></article>
        <div className="anatomy-credit">Pola visual terinspirasi Anatomy (MIT). Diagram NUSA DESIGN dibuat khusus, bukan menyalin contoh sumber. <a href="https://github.com/wheresryan22/anatomy" target="_blank" rel="noreferrer">Lihat sumber ↗</a></div>
      </aside>
    </section>
  </div>
}
