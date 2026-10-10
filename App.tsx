import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, BookOpen, BrainCircuit,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Command,
  Compass, Download, ExternalLink, Eye, FileText, Globe2, LayoutDashboard,
  LineChart, ListFilter, LoaderCircle, Menu, MessageCircle, Minus, Plus, Search,
  Send, Settings2, ShieldAlert, Sparkles, Star, TrendingDown, TrendingUp, X,
  GitCompareArrows, Bookmark, Info
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar
} from 'recharts'

type Stock = {
  symbol: string; name: string; exchange: string; country: string; currency: string;
  price: number; change: number; changePct: number; marketCap: string; pe: number | null;
  revenue: string; revenueGrowth: number; netMargin: number; debtEquity: number | null;
  sector: string; description: string; color: string;
  history: { date: string; price: number; volume: number }[];
}
type Message = { role: 'user' | 'assistant'; text: string }

const makeHistory = (base: number, drift: number, seed: number) => {
  let value = base * 0.78
  return Array.from({ length: 38 }, (_, i) => {
    const wave = Math.sin((i + seed) * 0.71) * base * 0.025 + Math.cos((i + seed) * 0.29) * base * 0.016
    value = Math.max(base * 0.35, value + (base * drift / 38) + wave * 0.27)
    return { date: ['May','Jun','Jul','Aug','Sep','Oct'][Math.min(5, Math.floor(i / 6))] + ` ${i % 28 + 1}`, price: Math.round(value * 100) / 100, volume: Math.round(900000 + Math.abs(Math.sin(i * .8 + seed)) * 2200000) }
  })
}
const demoStocks: Stock[] = [
  { symbol:'NVDA', name:'NVIDIA Corporation', exchange:'NASDAQ', country:'United States', currency:'USD', price:142.87, change:2.64, changePct:1.88, marketCap:'3.49T', pe:46.8, revenue:'$130.5B', revenueGrowth:114.2, netMargin:55.8, debtEquity:0.13, sector:'Semiconductors', description:'Designs accelerated computing platforms and graphics processing units used in gaming, data centres, and AI infrastructure.', color:'#8b7cff', history:makeHistory(142.87,.30,2) },
  { symbol:'AAPL', name:'Apple Inc.', exchange:'NASDAQ', country:'United States', currency:'USD', price:227.52, change:-1.12, changePct:-0.49, marketCap:'3.42T', pe:34.2, revenue:'$391.0B', revenueGrowth:2.0, netMargin:24.0, debtEquity:1.87, sector:'Consumer Technology', description:'Designs consumer electronics, software, and services including the iPhone, Mac, iPad, and its services ecosystem.', color:'#d1d5db', history:makeHistory(227.52,.19,4) },
  { symbol:'MSFT', name:'Microsoft Corporation', exchange:'NASDAQ', country:'United States', currency:'USD', price:428.76, change:3.18, changePct:.75, marketCap:'3.19T', pe:35.9, revenue:'$245.1B', revenueGrowth:15.7, netMargin:35.4, debtEquity:.32, sector:'Software', description:'Develops software, cloud infrastructure, productivity products, and AI services for consumers and enterprises.', color:'#51a7f9', history:makeHistory(428.76,.24,7) },
  { symbol:'TSLA', name:'Tesla, Inc.', exchange:'NASDAQ', country:'United States', currency:'USD', price:352.56, change:-6.84, changePct:-1.90, marketCap:'1.13T', pe:178.5, revenue:'$97.7B', revenueGrowth:1.8, netMargin:7.3, debtEquity:.18, sector:'Automotive', description:'Develops electric vehicles, battery energy storage, charging infrastructure, and related software.', color:'#f87171', history:makeHistory(352.56,.11,10) },
  { symbol:'AMZN', name:'Amazon.com, Inc.', exchange:'NASDAQ', country:'United States', currency:'USD', price:219.39, change:1.27, changePct:.58, marketCap:'2.31T', pe:38.1, revenue:'$638.0B', revenueGrowth:11.0, netMargin:9.3, debtEquity:.52, sector:'E-commerce & Cloud', description:'Operates online retail and marketplace services, logistics networks, digital subscriptions, and Amazon Web Services.', color:'#f59e0b', history:makeHistory(219.39,.25,12) },
  { symbol:'RELIANCE', name:'Reliance Industries Limited', exchange:'NSE', country:'India', currency:'INR', price:1284.5, change:8.2, changePct:.64, marketCap:'17.4T', pe:24.1, revenue:'₹9.3T', revenueGrowth:7.1, netMargin:7.6, debtEquity:.42, sector:'Conglomerate', description:'An Indian conglomerate with businesses spanning energy, retail, digital services, and new energy initiatives.', color:'#60a5fa', history:makeHistory(1284.5,.17,15) },
  { symbol:'TCS', name:'Tata Consultancy Services', exchange:'NSE', country:'India', currency:'INR', price:3412.8, change:-14.6, changePct:-.43, marketCap:'12.4T', pe:26.7, revenue:'₹2.55T', revenueGrowth:5.6, netMargin:19.2, debtEquity:.08, sector:'IT Services', description:'Provides IT services, consulting, engineering, and business solutions to global enterprises.', color:'#34d399', history:makeHistory(3412.8,.14,19) },
  { symbol:'INFY', name:'Infosys Limited', exchange:'NSE', country:'India', currency:'INR', price:1542.6, change:11.3, changePct:.74, marketCap:'6.4T', pe:23.5, revenue:'₹1.62T', revenueGrowth:4.8, netMargin:17.1, debtEquity:.05, sector:'IT Services', description:'A global technology services and consulting company headquartered in Bengaluru, India.', color:'#38bdf8', history:makeHistory(1542.6,.16,22) },
  { symbol:'HDFCBANK', name:'HDFC Bank Limited', exchange:'NSE', country:'India', currency:'INR', price:1748.3, change:4.2, changePct:.24, marketCap:'13.3T', pe:19.8, revenue:'₹1.22T', revenueGrowth:8.4, netMargin:18.6, debtEquity:null, sector:'Banking', description:'A major Indian private-sector bank providing retail banking, corporate banking, and financial services.', color:'#a78bfa', history:makeHistory(1748.3,.18,25) },
  { symbol:'SHEL', name:'Shell plc', exchange:'LSE', country:'United Kingdom', currency:'GBP', price:25.64, change:.17, changePct:.67, marketCap:'158B', pe:11.2, revenue:'$284.3B', revenueGrowth:-10.2, netMargin:7.8, debtEquity:.36, sector:'Energy', description:'An international energy company operating across oil, gas, chemicals, trading, and lower-carbon energy solutions.', color:'#fbbf24', history:makeHistory(25.64,.09,28) },
  { symbol:'SONY', name:'Sony Group Corporation', exchange:'NYSE', country:'Japan', currency:'USD', price:25.11, change:.32, changePct:1.29, marketCap:'155B', pe:18.4, revenue:'$89.1B', revenueGrowth:9.3, netMargin:8.1, debtEquity:.24, sector:'Entertainment & Electronics', description:'A Japanese group active in gaming, music, film, electronics, and image sensors.', color:'#fb7185', history:makeHistory(25.11,.2,31) }
]
const navItems = [
  { id:'overview', label:'Overview', icon:LayoutDashboard },
  { id:'explore', label:'Stock explorer', icon:Compass },
  { id:'compare', label:'Compare stocks', icon:GitCompareArrows },
  { id:'assistant', label:'AI research assistant', icon:BrainCircuit },
  { id:'watchlist', label:'Watchlist', icon:Star }
]
const fmt = (n:number, currency='USD') => new Intl.NumberFormat('en-US',{style:'currency',currency,maximumFractionDigits:currency==='INR'?2:2}).format(n)
const signed = (n:number) => `${n>0?'+':''}${n.toFixed(2)}%`

export default function App() {
  const [active, setActive] = useState('overview')
  const [selectedSymbol, setSelectedSymbol] = useState('NVDA')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [period, setPeriod] = useState('6M')
  const [watchlist, setWatchlist] = useState<string[]>(['NVDA','AAPL','RELIANCE','MSFT'])
  const [compare, setCompare] = useState<string[]>(['NVDA','MSFT','AAPL'])
  const [mobileNav, setMobileNav] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{role:'assistant',text:'Hi! I’m your QuantPulse research assistant. Ask me to explain a metric, compare companies, or identify questions worth investigating. In demo mode, I can only use the sample data shown in this prototype.'}])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [realMode, setRealMode] = useState(false)
  const [apiStatus, setApiStatus] = useState<'idle'|'loading'|'connected'|'error'>('idle')
  const [liveStock, setLiveStock] = useState<any>(null)
  const [liveSearch, setLiveSearch] = useState<any[]>([])
  const [lastUpdated, setLastUpdated] = useState('Demo data · illustrative only')
  const selected = demoStocks.find(s=>s.symbol===selectedSymbol) || demoStocks[0]
  const filtered = useMemo(()=> {
    const q = query.trim().toLowerCase()
    if (!q) return demoStocks.slice(0,6)
    return demoStocks.filter(s=>s.symbol.toLowerCase().includes(q)||s.name.toLowerCase().includes(q)||s.country.toLowerCase().includes(q)||s.sector.toLowerCase().includes(q))
  },[query])
  const shownStock = realMode && liveStock && liveStock.symbol === selectedSymbol ? { ...selected, ...liveStock } : selected
  const chartData = useMemo(()=>{
    const hist = shownStock.history || selected.history
    const stride = period==='1M'?1:period==='3M'?2:period==='6M'?1:period==='1Y'?1:1
    const points = hist.filter((_:any,i:number)=> period==='1M'?i>=hist.length-8:period==='3M'?i%2===0:period==='1Y'?i%1===0:i%stride===0)
    return points.length ? points : hist
  },[period,selected,shownStock])
  const changeSign = shownStock.changePct >= 0
  useEffect(()=> {
    if (!toast) return
    const t = window.setTimeout(()=>setToast(''),2800)
    return ()=>window.clearTimeout(t)
  },[toast])
  useEffect(()=>{
    const t = window.setTimeout(async()=>{
      if(!realMode || query.trim().length<2) { setLiveSearch([]); return }
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        const data = await r.json()
        if(r.ok && Array.isArray(data.results)) setLiveSearch(data.results)
      } catch { setLiveSearch([]) }
    },350)
    return ()=>window.clearTimeout(t)
  },[query,realMode])
  const chooseStock = async (s:Stock|any) => {
    setSelectedSymbol(s.symbol); setQuery(''); setSearchOpen(false); setActive('explore'); setLiveStock(null)
    if(realMode) {
      setApiStatus('loading')
      try {
        const r=await fetch(`/api/quote?symbol=${encodeURIComponent(s.symbol)}`)
        const data=await r.json()
        if(!r.ok) throw new Error(data.error||'Unable to retrieve quote')
        setLiveStock({...data,history:undefined})
        setLastUpdated(`Provider response · ${new Date().toLocaleTimeString()}`)
        setApiStatus('connected')
      } catch(e:any) {
        setApiStatus('error'); setToast(e.message || 'Could not load live quote')
      }
    }
  }
  const toggleWatch = (symbol:string) => {
    setWatchlist(old=>old.includes(symbol)?old.filter(s=>s!==symbol):[...old,symbol])
    setToast(watchlist.includes(symbol)?'Removed from watchlist':'Added to watchlist')
  }
  const addCompare = (symbol:string) => {
    setCompare(old=>old.includes(symbol)?old.filter(s=>s!==symbol):old.length<4?[...old,symbol]:old)
  }
  const askAI = async (question?:string) => {
    const q=(question??chatInput).trim()
    if(!q||chatLoading) return
    const next=[...messages,{role:'user' as const,text:q}]
    setMessages(next); setChatInput(''); setChatLoading(true)
    if(realMode) {
      try {
        const r=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,stock:{symbol:selected.symbol,name:selected.name,sector:selected.sector,price:selected.price,currency:selected.currency,pe:selected.pe,revenueGrowth:selected.revenueGrowth,netMargin:selected.netMargin,debtEquity:selected.debtEquity,description:selected.description}})})
        const data=await r.json()
        if(!r.ok) throw new Error(data.error||'AI service unavailable')
        setMessages([...next,{role:'assistant',text:data.answer}])
      } catch(e:any) { setMessages([...next,{role:'assistant',text:`I couldn't reach the configured AI service. ${e.message||'Check the backend setup.'} You can still explore the demo data and formulas.`}]) }
    } else {
      await new Promise(r=>setTimeout(r,500))
      setMessages([...next,{role:'assistant',text:demoAnswer(q,selected)}])
    }
    setChatLoading(false)
  }
  const toggleRealMode = async () => {
    if(!realMode) {
      setRealMode(true); setApiStatus('loading')
      try {
        const r=await fetch('/api/status')
        const data=await r.json()
        if(data.marketData || data.ai) { setApiStatus('connected'); setToast('API mode enabled. Live data depends on configured keys and provider limits.') }
        else { setApiStatus('idle'); setToast('API mode enabled, but backend API keys are not configured yet.') }
      } catch { setApiStatus('error'); setToast('API backend not detected. Demo mode remains available.') }
    } else {
      setRealMode(false); setLiveStock(null); setLiveSearch([]); setApiStatus('idle'); setLastUpdated('Demo data · illustrative only')
      setToast('Returned to demo mode')
    }
  }
  const activeLabel = navItems.find(n=>n.id===active)?.label || 'Overview'

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'mobile-open':''}`}>
      <div className="brand">
        <div className="brand-mark"><Activity size={22}/></div>
        <div><div className="brand-name">QuantPulse</div><div className="brand-sub">RESEARCH TERMINAL</div></div>
        <button className="icon-button mobile-close" onClick={()=>setMobileNav(false)} aria-label="Close menu"><X size={18}/></button>
      </div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>
        {navItems.map(item=><button key={item.id} className={`nav-item ${active===item.id?'active':''}`} onClick={()=>{setActive(item.id);setMobileNav(false)}}><item.icon size={18}/><span>{item.label}</span>{item.id==='watchlist'&&<span className="nav-count">{watchlist.length}</span>}</button>)}
      </nav>
      <div className="sidebar-divider"/>
      <div className="workspace-label">YOUR RESEARCH</div>
      <div className="mini-list">
        {watchlist.slice(0,4).map(sym=>{const s=demoStocks.find(x=>x.symbol===sym);if(!s)return null;return <button key={sym} className="mini-stock" onClick={()=>chooseStock(s)}><span className="ticker-dot" style={{background:s.color}}/ ><span className="mini-stock-name">{sym}</span><span className={s.changePct>=0?'positive':'negative'}>{signed(s.changePct)}</span></button>})}
        <button className="add-research" onClick={()=>setActive('explore')}><Plus size={15}/> Explore a stock</button>
      </div>
      <div className="sidebar-spacer"/>
      <div className="sidebar-note"><div className="note-icon"><ShieldAlert size={16}/></div><div><strong>Research, not promises.</strong><p>Understand the numbers before making decisions.</p></div></div>
      <button className="nav-item muted-nav" onClick={()=>setToast('Data sources and methodology are explained in the footer and About section.')}><BookOpen size={18}/><span>Methodology & sources</span></button>
      <div className="profile"><div className="avatar">QP</div><div className="profile-text"><strong>Research workspace</strong><span>Free prototype</span></div><button className="icon-button" onClick={()=>setToast('Settings will be added in a future version.')} aria-label="Settings"><Settings2 size={17}/></button></div>
    </aside>
    {mobileNav&&<div className="mobile-backdrop" onClick={()=>setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-button mobile-menu" onClick={()=>setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <span>{activeLabel}</span></div></div>
        <div className="topbar-actions">
          <div className="mode-switch"><span className={`mode-dot ${realMode?'live':''}`}/><span>{realMode?'API mode':'Demo mode'}</span><button onClick={toggleRealMode}>{realMode?'Switch to demo':'Connect APIs'}</button></div>
          <button className="icon-button notification" onClick={()=>setToast('You are all caught up.')} aria-label="Notifications"><Bell size={18}/></button>
        </div>
      </header>
      <div className="page-content">
        <div className="welcome-row">
          <div><div className="eyebrow"><span className="eyebrow-line"/> GLOBAL MARKET INTELLIGENCE</div><h1>{active==='overview'?'See beyond the ticker.':active==='explore'?'Explore a company.':active==='compare'?'Compare with context.':active==='assistant'?'Ask better questions.':'Your watchlist.'}</h1><p className="page-subtitle">{active==='overview'?'Data-driven research for more thoughtful investing.':active==='explore'?'Look under the hood: fundamentals, performance, and risk.':active==='compare'?'Put financial metrics side by side—not just share prices.':active==='assistant'?'Turn financial jargon into clear, grounded explanations.':'Keep the companies you care about in one place.'}</p></div>
          <div className="welcome-actions"><span className="updated-label"><Clock3 size={14}/>{lastUpdated}</span><button className="button-secondary" onClick={()=>{setActive('explore');setQuery('');setSearchOpen(true)}}><Search size={16}/> Find a stock</button></div>
        </div>
        <div className="search-panel">
          <div className="search-icon"><Search size={20}/></div>
          <div className="search-field"><input value={query} onChange={e=>{setQuery(e.target.value);setSearchOpen(true)}} onFocus={()=>setSearchOpen(true)} onKeyDown={e=>{if(e.key==='Escape')setSearchOpen(false);if(e.key==='Enter'&&filtered[0])chooseStock(filtered[0])}} placeholder="Search a company or ticker — e.g. NVDA, Reliance, TCS..." aria-label="Search stocks"/><div className="search-hint"><kbd>⌘</kbd><kbd>K</kbd></div></div>
          <button className="search-submit" onClick={()=>{if(filtered[0])chooseStock(filtered[0]);else setToast('No matching demo symbol. Enable API mode for provider search.')}}>Search <ChevronRight size={16}/></button>
          {searchOpen&&<><button className="click-away" onClick={()=>setSearchOpen(false)} aria-label="Close search suggestions"/><div className="suggestions"><div className="suggestion-heading">{realMode?'PROVIDER SEARCH':'SUGGESTED COMPANIES'} <span>{realMode?'API mode':'DEMO UNIVERSE'}</span></div>{(realMode&&liveSearch.length?liveSearch:filtered).slice(0,7).map((s:any)=><button key={`${s.symbol}-${s.exchange||''}`} className="suggestion" onClick={()=>chooseStock(s)}><div className="suggestion-logo">{s.symbol.slice(0,1)}</div><div className="suggestion-info"><strong>{s.name}</strong><span>{s.symbol} · {s.exchange||'Exchange varies'} · {s.country||'Global'}</span></div><span className="suggestion-sector">{s.sector||'Equity'}</span><ChevronRight size={15}/></button>)}{filtered.length===0&&<div className="no-results">No demo match. Enable API mode for provider search.</div>}</div></>}
        </div>
        {active==='overview'&&<Overview selected={shownStock} stocks={demoStocks} onSelect={chooseStock} onExplore={()=>setActive('explore')} onCompare={()=>setActive('compare')} onAI={()=>setActive('assistant')} onToggleWatch={toggleWatch} watchlist={watchlist} />}
        {active==='explore'&&<Explore stock={shownStock} chartData={chartData} period={period} setPeriod={setPeriod} onToggleWatch={toggleWatch} isWatched={watchlist.includes(selected.symbol)} onAsk={()=>setActive('assistant')} onCompare={()=>{addCompare(selected.symbol);setActive('compare')}} realMode={realMode} apiStatus={apiStatus} />}
        {active==='compare'&&<Compare stocks={demoStocks} compare={compare} addCompare={addCompare} onSelect={chooseStock}/>}
        {active==='assistant'&&<Assistant stock={selected} messages={messages} input={chatInput} setInput={setChatInput} loading={chatLoading} onAsk={askAI} onSelectPrompt={(q: string)=>askAI(q)} />}
        {active==='watchlist'&&<Watchlist stocks={demoStocks} watchlist={watchlist} onToggle={toggleWatch} onSelect={chooseStock} onExplore={()=>setActive('explore')}/>}
        <footer className="footer"><div><span className="footer-logo"><Activity size={15}/> QuantPulse</span><span>Research with clarity.</span></div><div className="footer-links"><button onClick={()=>setToast('Demo numbers are illustrative and not current market quotes.')}>Data disclaimer</button><button onClick={()=>setToast('Metrics may differ by provider, currency, and reporting period.')}>Methodology</button><span>© 2026 QuantPulse concept</span></div></footer>
      </div>
    </main>
    {toast&&<div className="toast"><Check size={16}/>{toast}<button onClick={()=>setToast('')} aria-label="Dismiss"><X size={14}/></button></div>}
  </div>
}

function Overview({selected,stocks,onSelect,onExplore,onCompare,onAI,onToggleWatch,watchlist}:any) {
  const positive=stocks.filter((s:Stock)=>s.changePct>=0).length
  return <div className="content-stack">
    <div className="market-strip"><div className="market-strip-label"><Globe2 size={16}/><span>MARKET SNAPSHOT</span><span className="demo-pill">ILLUSTRATIVE DEMO</span></div><div className="market-strip-stats"><div><span>Tracked companies</span><strong>{stocks.length.toLocaleString()}</strong></div><div><span>Markets represented</span><strong>3+</strong></div><div><span>Positive in sample</span><strong className="positive">{positive}/{stocks.length}</strong></div><div><span>Coverage</span><strong>Sample only</strong></div></div></div>
    <div className="section-heading"><div><h2>Research overview</h2><p>A starting point for deeper company analysis.</p></div><button className="text-button" onClick={onExplore}>Explore stocks <ArrowUpRight size={15}/></button></div>
    <div className="metric-grid">
      <MetricCard label="Selected company" value={selected.symbol} note={selected.name} icon={Activity} tone="violet"/>
      <MetricCard label="Sample market cap" value={selected.marketCap} note="Illustrative value · not live" icon={Globe2} tone="blue"/>
      <MetricCard label="Revenue growth" value={`${selected.revenueGrowth>0?'+':''}${selected.revenueGrowth.toFixed(1)}%`} note="Sample metric · period varies" icon={TrendingUp} tone="green"/>
      <MetricCard label="P/E ratio" value={selected.pe===null?'N/A':selected.pe.toFixed(1)+'×'} note="Sample metric · verify source" icon={BarChart3} tone="amber"/>
    </div>
    <div className="dashboard-grid">
      <div className="panel chart-panel">
        <div className="panel-header"><div><div className="panel-kicker">COMPANY SPOTLIGHT</div><h3>{selected.name}</h3><div className="muted-line">{selected.symbol} · {selected.exchange} · {selected.currency}</div></div><button className={`icon-button ${watchlist.includes(selected.symbol)?'starred':''}`} onClick={()=>onToggleWatch(selected.symbol)} aria-label="Toggle watchlist"><Star size={18} fill={watchlist.includes(selected.symbol)?'currentColor':'none'}/></button></div>
        <div className="spotlight-price"><strong>{fmt(selected.price,selected.currency)}</strong><span className={selected.changePct>=0?'positive':'negative'}>{selected.changePct>=0?<ArrowUpRight size={16}/>:<ArrowDownRight size={16}/>} {signed(selected.changePct)}</span><span className="muted-line">Sample quote</span></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={selected.history} margin={{top:8,right:5,left:0,bottom:0}}><defs><linearGradient id="spotFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={selected.color} stopOpacity={.25}/><stop offset="95%" stopColor={selected.color} stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#263044" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="date" tick={{fill:'#78849b',fontSize:10}} axisLine={false} tickLine={false} interval={6}/><YAxis orientation="right" tick={{fill:'#78849b',fontSize:10}} axisLine={false} tickLine={false} width={52} domain={['dataMin','dataMax']} tickFormatter={v=>Number(v).toLocaleString('en-US',{maximumFractionDigits:0})}/><Tooltip contentStyle={{background:'#101827',border:'1px solid #29354a',borderRadius:10,color:'#fff'}} formatter={(v:any)=>[fmt(Number(v),selected.currency),'Sample price']}/><Area type="monotone" dataKey="price" stroke={selected.color} strokeWidth={2} fill="url(#spotFill)" activeDot={{r:4,strokeWidth:0}}/></AreaChart></ResponsiveContainer></div>
        <div className="chart-footer"><span><span className="legend-dot" style={{background:selected.color}}/> Illustrative price history</span><button className="text-button" onClick={onExplore}>Full analysis <ArrowUpRight size={14}/></button></div>
      </div>
      <div className="panel quick-panel"><div className="panel-header"><div><div className="panel-kicker">YOUR NEXT MOVE</div><h3>Research tools</h3></div><Sparkles size={18} className="accent-icon"/></div><button className="tool-row" onClick={onExplore}><div className="tool-icon violet"><LineChart size={18}/></div><div><strong>Explore a stock</strong><span>Fundamentals, valuation and trends</span></div><ChevronRight size={17}/></button><button className="tool-row" onClick={onCompare}><div className="tool-icon blue"><GitCompareArrows size={18}/></div><div><strong>Compare companies</strong><span>See metrics side by side</span></div><ChevronRight size={17}/></button><button className="tool-row" onClick={onAI}><div className="tool-icon amber"><BrainCircuit size={18}/></div><div><strong>Ask AI research</strong><span>Understand what the numbers mean</span></div><ChevronRight size={17}/></button><div className="research-note"><Info size={15}/><span>Every company has a different risk profile. Use multiple metrics and verify the underlying source data.</span></div></div>
    </div>
    <div className="section-heading"><div><h2>Explore companies</h2><p>A small sample universe to demonstrate the experience.</p></div><button className="button-secondary" onClick={onExplore}>View all <ChevronRight size={15}/></button></div>
    <div className="stock-grid">{stocks.slice(0,6).map((s:Stock)=><StockCard key={s.symbol} stock={s} onClick={()=>onSelect(s)} watched={watchlist.includes(s.symbol)} onWatch={()=>onToggleWatch(s.symbol)}/>)}</div>
    <div className="notice"><ShieldAlert size={18}/><div><strong>Important: demo data, not investment research.</strong><p>All prices, chart points, and financial metrics in this prototype are illustrative sample values, not current market data. Connect a licensed provider before relying on any figures.</p></div></div>
  </div>
}
function MetricCard({label,value,note,icon:Icon,tone}:any){return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={18}/></div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-note">{note}</span></div>}
function StockCard({stock,onClick,watched,onWatch}:any){return <div className="stock-card"><button className="stock-card-main" onClick={onClick}><div className="stock-card-top"><div className="company-symbol" style={{'--symbol-color':stock.color} as any}>{stock.symbol.slice(0,1)}</div><div className="stock-card-identity"><strong>{stock.symbol}</strong><span>{stock.name}</span></div><span className={`change-chip ${stock.changePct>=0?'up':'down'}`}>{signed(stock.changePct)}</span></div><div className="stock-card-price">{fmt(stock.price,stock.currency)}</div><div className="stock-card-bottom"><span>{stock.exchange} · {stock.sector}</span><ArrowUpRight size={15}/></div></button><button className={`stock-star ${watched?'starred':''}`} onClick={onWatch} aria-label="Toggle watchlist"><Star size={15} fill={watched?'currentColor':'none'}/></button></div>}
function Explore({stock,chartData,period,setPeriod,onToggleWatch,isWatched,onAsk,onCompare,realMode,apiStatus}:any){
  const [tab,setTab]=useState('fundamentals')
  const [showMethod,setShowMethod]=useState(false)
  const periodOptions=['1M','3M','6M','1Y','5Y']
  const risk = stock.pe===null?'Not enough data':stock.pe>60?'Valuation sensitivity':stock.debtEquity!==null&&stock.debtEquity>1?'Leverage to examine':'Review business-specific risks'
  const margin=stock.netMargin
  return <div className="content-stack">
    <div className="stock-profile panel"><div className="profile-main"><div className="big-company-logo" style={{'--symbol-color':stock.color} as any}>{stock.symbol.slice(0,1)}</div><div><div className="company-overline">{stock.exchange} · {stock.country} · {stock.sector}</div><h2>{stock.name}</h2><div className="muted-line">{stock.symbol} · {stock.currency}</div></div></div><div className="profile-actions"><button className={`button-secondary ${isWatched?'selected':''}`} onClick={onToggleWatch}><Star size={15} fill={isWatched?'currentColor':'none'}/>{isWatched?'Saved':'Watchlist'}</button><button className="button-primary" onClick={onCompare}><GitCompareArrows size={15}/> Compare</button></div></div>
    <div className="stock-price-grid"><div className="panel main-price-card"><div className="panel-kicker">LATEST DISPLAYED PRICE</div><div className="big-price">{fmt(stock.price,stock.currency)}</div><div className={stock.changePct>=0?'positive':'negative'}>{stock.change>=0?'+':''}{stock.change.toFixed(2)} ({signed(stock.changePct)}) <span className="muted-line">· illustrative sample</span></div><div className="price-context"><span><Clock3 size={14}/> {realMode&&apiStatus==='connected'?'Provider response':'Demo sample'}</span><span><Info size={14}/> Verify before use</span></div></div><div className="panel key-stat"><span>Market capitalization</span><strong>{stock.marketCap}</strong><small>Sample value</small></div><div className="panel key-stat"><span>P/E ratio</span><strong>{stock.pe===null?'N/A':stock.pe.toFixed(1)+'×'}</strong><small>Check earnings period</small></div><div className="panel key-stat"><span>Revenue growth</span><strong className={stock.revenueGrowth>=0?'positive':'negative'}>{signed(stock.revenueGrowth)}</strong><small>Sample metric</small></div></div>
    <div className="panel detail-chart"><div className="panel-header"><div><h3>Price performance</h3><p>Historical sample series · not a live quote</p></div><div className="period-switch">{periodOptions.map(p=><button className={period===p?'selected':''} key={p} onClick={()=>setPeriod(p)}>{p}</button>)}</div></div><div className="large-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:10,right:12,left:0,bottom:0}}><defs><linearGradient id="detailFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={stock.color} stopOpacity={.23}/><stop offset="100%" stopColor={stock.color} stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#263044" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="date" tick={{fill:'#78849b',fontSize:11}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis orientation="right" tick={{fill:'#78849b',fontSize:11}} axisLine={false} tickLine={false} width={64} domain={['dataMin','dataMax']}/><Tooltip contentStyle={{background:'#101827',border:'1px solid #29354a',borderRadius:10,color:'#fff'}} formatter={(v:any)=>[fmt(Number(v),stock.currency),'Sample price']}/><Area type="monotone" dataKey="price" stroke={stock.color} strokeWidth={2.5} fill="url(#detailFill)" activeDot={{r:4,strokeWidth:0}}/></AreaChart></ResponsiveContainer></div><div className="chart-footer"><span><span className="legend-dot" style={{background:stock.color}}/> Illustrative historical path</span><span>Currency: {stock.currency}</span></div></div>
    <div className="tabs"><button className={tab==='fundamentals'?'active':''} onClick={()=>setTab('fundamentals')}>Fundamentals</button><button className={tab==='technical'?'active':''} onClick={()=>setTab('technical')}>Technical signals</button><button className={tab==='about'?'active':''} onClick={()=>setTab('about')}>Company overview</button></div>
    {tab==='fundamentals'&&<div className="fundamentals-layout"><div className="panel fundamentals-panel"><div className="panel-header"><div><h3>Financial snapshot</h3><p>Illustrative values for interface preview</p></div><button className="icon-button" onClick={()=>setShowMethod(!showMethod)} aria-label="Show methodology"><CircleHelp size={17}/></button></div><div className="fundamentals-grid"><Fundamental label="Revenue" value={stock.revenue} desc="Reported revenue sample"/><Fundamental label="Revenue growth" value={signed(stock.revenueGrowth)} desc="Sample growth rate"/><Fundamental label="Net profit margin" value={`${stock.netMargin.toFixed(1)}%`} desc="Net income ÷ revenue"/><Fundamental label="Debt / equity" value={stock.debtEquity===null?'N/A':stock.debtEquity.toFixed(2)+'×'} desc="Capital structure sample"/><Fundamental label="P/E ratio" value={stock.pe===null?'N/A':stock.pe.toFixed(1)+'×'} desc="Price ÷ earnings per share"/><Fundamental label="Market cap" value={stock.marketCap} desc="Sample market value"/></div>{showMethod&&<div className="method-box"><strong>Methodology note</strong><p>Ratios can be misleading when periods, accounting standards, currencies, or definitions differ. These demo figures have not been verified against a live provider.</p></div>}</div><div className="panel insight-panel"><div className="panel-kicker">RESEARCH CHECKLIST</div><h3>Questions worth asking</h3><div className="insight-item"><span className="insight-number">01</span><div><strong>Growth quality</strong><p>Is revenue growth translating into durable free cash flow?</p></div></div><div className="insight-item"><span className="insight-number">02</span><div><strong>Valuation context</strong><p>How does the multiple compare with peers and its own history?</p></div></div><div className="insight-item"><span className="insight-number">03</span><div><strong>Balance-sheet risk</strong><p>Can cash generation support debt and future investment?</p></div></div><button className="button-primary full-width" onClick={onAsk}><BrainCircuit size={16}/> Ask AI about this stock</button></div></div>}
    {tab==='technical'&&<div className="fundamentals-layout"><div className="panel fundamentals-panel"><h3>Technical indicators</h3><p className="muted-line">Indicators require sufficient, verified historical prices. These sample values are not calculated from market data.</p><div className="fundamentals-grid"><Fundamental label="RSI (14)" value="Not connected" desc="Momentum indicator"/><Fundamental label="50-day average" value="Not connected" desc="Trend context"/><Fundamental label="200-day average" value="Not connected" desc="Long-term trend context"/><Fundamental label="Volatility" value="Not connected" desc="Historical price variation"/></div></div><div className="panel insight-panel"><div className="panel-kicker">REMEMBER</div><h3>Signals are not certainty</h3><p>Technical indicators summarize past price behavior. They do not guarantee future returns and should be considered alongside fundamentals and risk.</p><button className="button-secondary full-width" onClick={()=>setShowMethod(!showMethod)}><BookOpen size={15}/> {showMethod?'Hide':'Read'} indicator notes</button>{showMethod&&<p className="method-box">RSI is a momentum measure commonly scaled from 0 to 100. Its interpretation depends on trend, timeframe, and context.</p>}</div></div>}
    {tab==='about'&&<div className="panel about-panel"><h3>About {stock.name}</h3><p>{stock.description}</p><div className="about-tags"><span>{stock.sector}</span><span>{stock.country}</span><span>{stock.exchange}</span></div><div className="notice compact"><Info size={17}/><div><strong>Verify the facts</strong><p>This company description is part of the demo dataset. Connect a data provider for source-backed profiles and financial reports.</p></div></div></div>}
    <div className="notice"><ShieldAlert size={18}/><div><strong>Not a buy/sell recommendation.</strong><p>Financial data can be delayed, incomplete, or inaccurate. Verify the provider and reporting period before making any financial decision.</p></div></div>
  </div>
}
function Fundamental({label,value,desc}:any){return <div className="fundamental"><span>{label}</span><strong>{value}</strong><small>{desc}</small></div>}
function Compare({stocks,compare,addCompare,onSelect}:any){
  const chosen=compare.map((s:string)=>stocks.find((x:Stock)=>x.symbol===s)).filter(Boolean)
  return <div className="content-stack"><div className="panel compare-picker"><div><h3>Build your comparison</h3><p>Select up to four companies to compare fundamentals and business context.</p></div><div className="compare-chips">{stocks.map((s:Stock)=><button key={s.symbol} className={`compare-chip ${compare.includes(s.symbol)?'selected':''}`} onClick={()=>addCompare(s.symbol)}>{compare.includes(s.symbol)?<Check size={13}/>:<Plus size={13}/>} {s.symbol}</button>)}</div></div><div className="panel comparison-panel"><div className="panel-header"><div><div className="panel-kicker">SIDE-BY-SIDE ANALYSIS</div><h3>Company comparison</h3><p>Demo values · reporting periods are not verified</p></div><button className="button-secondary" onClick={()=>{if(chosen[0])onSelect(chosen[0])}}><ExternalLink size={15}/> Open first stock</button></div>{chosen.length<2?<div className="empty-state"><GitCompareArrows size={28}/><h3>Choose at least two companies</h3><p>Add another company above to compare.</p></div>:<div className="table-scroll"><table className="compare-table"><thead><tr><th>Metric</th>{chosen.map((s:Stock)=><th key={s.symbol}><span className="compare-symbol">{s.symbol.slice(0,1)}</span><strong>{s.symbol}</strong><small>{s.exchange} · {s.currency}</small></th>)}</tr></thead><tbody>{[
['Share price',(s:Stock)=>fmt(s.price,s.currency)],
['Market cap',(s:Stock)=>s.marketCap],
['P/E ratio',(s:Stock)=>s.pe===null?'N/A':`${s.pe.toFixed(1)}×`],
['Revenue',(s:Stock)=>s.revenue],
['Revenue growth',(s:Stock)=>signed(s.revenueGrowth)],
['Net margin',(s:Stock)=>`${s.netMargin.toFixed(1)}%`],
['Debt / equity',(s:Stock)=>s.debtEquity===null?'N/A':s.debtEquity.toFixed(2)+'×'],
['Sector',(s:Stock)=>s.sector],
['Country',(s:Stock)=>s.country]
].map(([label,get]:any)=><tr key={label}><td>{label}</td>{chosen.map((s:Stock)=><td key={s.symbol}>{get(s)}</td>)}</tr>)}</tbody></table></div>}<div className="notice compact"><Info size={16}/><div><strong>Compare like with like.</strong><p>Market caps may use different display currencies, and reporting periods or accounting conventions can differ. A lower P/E alone does not mean a stock is better value.</p></div></div></div><div className="panel comparison-guide"><div className="tool-icon violet"><BrainCircuit size={18}/></div><div><h3>What should you compare?</h3><p>Compare growth with profitability, valuation with business quality, and debt with cash generation. Sector context matters: banks, software firms, and manufacturers have different financial structures.</p></div></div></div>
}
function Assistant({stock,messages,input,setInput,loading,onAsk,onSelectPrompt}:any){
  const prompts=['Explain this company’s valuation','What are the biggest risks to research?','Explain P/E ratio in simple terms','Compare growth and profitability']
  return <div className="assistant-layout"><div className="panel assistant-main"><div className="assistant-header"><div className="assistant-avatar"><BrainCircuit size={22}/></div><div><h3>QuantPulse AI Analyst</h3><p><span className="status-dot"/> Research assistant · {stock.symbol} context</p></div><span className="demo-pill">DEMO AI</span></div><div className="context-banner"><span className="context-stock-icon">{stock.symbol.slice(0,1)}</span><div><strong>Current context: {stock.name}</strong><span>{stock.symbol} · {stock.sector} · illustrative data</span></div><button onClick={()=>onAsk('Give me a structured research overview of this company.')}>Analyze <ArrowUpRight size={14}/></button></div><div className="chat-messages">{messages.map((m:Message,i:number)=><div className={`message ${m.role}`} key={i}><div className={`message-avatar ${m.role}`}>{m.role==='assistant'?<Sparkles size={15}/>:<span>YOU</span>}</div><div className="message-body"><div className="message-name">{m.role==='assistant'?'QuantPulse AI':'You'}</div><p>{m.text}</p>{m.role==='assistant'&&i>0&&<span className="message-foot"><Info size={12}/> Demo answer · verify financial data</span>}</div></div>)}{loading&&<div className="message assistant"><div className="message-avatar assistant"><LoaderCircle size={15} className="spin"/></div><div className="message-body"><div className="message-name">QuantPulse AI</div><p className="typing">Reviewing the question…</p></div></div>}</div><div className="prompt-suggestions"><span>TRY ASKING</span><div>{prompts.map(p=><button key={p} onClick={()=>onSelectPrompt(p)}>{p}<ArrowUpRight size={12}/></button>)}</div></div><form className="chat-input-wrap" onSubmit={e=>{e.preventDefault();onAsk()}}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask a question about this company..." aria-label="Ask the AI analyst"/><button type="submit" disabled={!input.trim()||loading} aria-label="Send message"><Send size={17}/></button></form><div className="chat-disclaimer">AI responses can be wrong. This demo assistant uses sample data and is not financial advice.</div></div><div className="assistant-sidebar"><div className="panel"><div className="panel-kicker">HOW TO USE AI WELL</div><h3>Ask specific questions</h3>{['Ask what a metric means','Specify a reporting period','Request assumptions and risks','Verify claims against filings'].map((x,i)=><div className="ai-tip" key={x}><span>{String(i+1).padStart(2,'0')}</span><p>{x}</p></div>)}</div><div className="panel"><div className="panel-kicker">CURRENT COMPANY</div><h3>{stock.name}</h3><div className="mini-fact"><span>Revenue growth</span><strong className={stock.revenueGrowth>=0?'positive':'negative'}>{signed(stock.revenueGrowth)}</strong></div><div className="mini-fact"><span>Net margin</span><strong>{stock.netMargin.toFixed(1)}%</strong></div><div className="mini-fact"><span>P/E ratio</span><strong>{stock.pe===null?'N/A':stock.pe.toFixed(1)+'×'}</strong></div><span className="data-footnote">Illustrative demo values only</span></div></div></div>
}
function Watchlist({stocks,watchlist,onToggle,onSelect,onExplore}:any){
  const list=stocks.filter((s:Stock)=>watchlist.includes(s.symbol))
  return <div className="content-stack"><div className="section-heading"><div><h2>Saved companies</h2><p>Track the stocks you want to research further.</p></div><button className="button-primary" onClick={onExplore}><Plus size={15}/> Add a stock</button></div>{list.length===0?<div className="panel empty-state"><Star size={28}/><h3>Your watchlist is empty</h3><p>Search for a company and save it to see it here.</p><button className="button-primary" onClick={onExplore}>Explore stocks</button></div>:<div className="panel watchlist-panel"><div className="table-scroll"><table className="watch-table"><thead><tr><th>Company</th><th>Price</th><th>Change</th><th>Market cap</th><th>P/E</th><th>Action</th></tr></thead><tbody>{list.map((s:Stock)=><tr key={s.symbol}><td><button className="table-company" onClick={()=>onSelect(s)}><span className="company-symbol small" style={{'--symbol-color':s.color} as any}>{s.symbol.slice(0,1)}</span><span><strong>{s.name}</strong><small>{s.symbol} · {s.exchange}</small></span></button></td><td>{fmt(s.price,s.currency)}</td><td className={s.changePct>=0?'positive':'negative'}>{signed(s.changePct)}</td><td>{s.marketCap}</td><td>{s.pe===null?'N/A':s.pe.toFixed(1)+'×'}</td><td><button className="icon-button remove-button" onClick={()=>onToggle(s.symbol)} aria-label="Remove from watchlist"><X size={16}/></button></td></tr>)}</tbody></table></div><div className="watchlist-foot"><Info size={14}/> Watchlist values are illustrative and stored locally in the current session.</div></div>}<div className="notice"><ShieldAlert size={18}/><div><strong>Keep a research mindset.</strong><p>A watchlist helps organize research; it does not tell you when to buy or sell.</p></div></div></div>
}
function demoAnswer(q:string,s:Stock){
 const lower=q.toLowerCase()
 if(lower.includes('p/e')||lower.includes('valuation')||lower.includes('expensive')||lower.includes('cheap')) return `For ${s.name} (${s.symbol}), the demo P/E ratio is ${s.pe===null?'not available':s.pe.toFixed(1)+'×'}. P/E compares a company's share price with earnings per share. A higher multiple can reflect expected growth, strong business economics, or excessive optimism; a lower multiple can reflect risk or slower growth. Compare the company with relevant peers and its own history, and verify the earnings period and data source. This prototype's number is illustrative, not a current quote or investment conclusion.`
 if(lower.includes('risk')||lower.includes('debt')) return `For ${s.name}, begin by investigating competitive pressure, the durability of demand, cash-flow conversion, balance-sheet obligations, and whether the current valuation already assumes strong future performance. The demo debt/equity figure is ${s.debtEquity===null?'not meaningful for this company in this simplified view':s.debtEquity.toFixed(2)+'×'}, but accounting and sector differences matter. Review the latest annual and quarterly filings before drawing conclusions.`
 if(lower.includes('growth')||lower.includes('profit')||lower.includes('margin')) return `The demo dataset shows revenue growth of ${signed(s.revenueGrowth)} and net profit margin of ${s.netMargin.toFixed(1)}% for ${s.name}. Revenue growth tells you how quickly sales are changing; net margin indicates how much reported revenue remains as net income. Check that both figures cover the same reporting period, then investigate operating cash flow, one-off items, and whether the trend is improving. These figures are illustrative and have not been verified against filings.`
 if(lower.includes('compare')) return `For a useful comparison, align reporting periods and currencies first. Then examine revenue growth, operating and net margins, cash flow, balance-sheet risk, and valuation together. ${s.name} operates in ${s.sector}, so compare it with companies that have similar business models rather than choosing a universal winner from a single ratio. The current prototype uses illustrative values; connect a real provider before using the figures.`
 return `For ${s.name} (${s.symbol}), a careful starting point is to separate what is known from what needs verification. The current demo shows a sample P/E of ${s.pe===null?'N/A':s.pe.toFixed(1)+'×'}, revenue growth of ${signed(s.revenueGrowth)}, and net margin of ${s.netMargin.toFixed(1)}%. These values are illustrative only. To research the company, verify its latest reported results, compare its valuation with relevant peers, review cash generation and debt, and identify what could undermine its business outlook. I can't determine future returns or guarantee a profit.`
}