import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { calculatePaint, createCopyText, formatNumber, DEFAULT_COVERAGE } from './calculator'
import './styles.css'

const initialForm = { length: '', width: '', wallHeight: '8', doors: '1', windows: '2', coats: '2', coverage: String(DEFAULT_COVERAGE), ceiling: false }

function App() {
  const [form, setForm] = useState(initialForm)
  const [started, setStarted] = useState(false)
  const [copyStatus, setCopyStatus] = useState(null)
  const result = useMemo(() => calculatePaint(form), [form])
  const validResult = started && result.errors.length === 0
  const completionTracked = useRef(false)

  useEffect(() => {
    if (validResult && !completionTracked.current) {
      completionTracked.current = true
      window.gtag?.('event', 'calculator_completed', { calculator: 'paint' })
    }
  }, [validResult])
  const update = (field, value) => { setStarted(true); setCopyStatus(null); setForm(current => ({ ...current, [field]: value })) }
  const onSubmit = event => event.preventDefault()
  const copy = async () => {
    if (!validResult) return
    try { await navigator.clipboard.writeText(createCopyText({ result, coats: form.coats, coverage: form.coverage })); setCopyStatus('success') }
    catch { setCopyStatus('error') }
  }
  const reset = () => { setForm(initialForm); setStarted(false); setCopyStatus(null); completionTracked.current = false }

  return (
    <main className="site-shell">
      <header className="hero">
        <div className="brand"><img className="brand-logo" src="/athena-calculators-logo.jpg" alt="ATHENA Calculators" /></div>
        <p className="eyebrow">PAINT CALCULATOR</p>
        <h1>How Much Paint Do I Need?</h1>
        <p className="intro">Estimate gallons of paint for walls and ceilings using your room dimensions, coats, and paint coverage.</p>
      </header>
      <section className="calculator-card" aria-labelledby="calculator-title">
        <div className="calculator-heading"><h2 id="calculator-title">Get your paint estimate</h2><p>Enter your room measurements and painting details.</p></div>
        <form onSubmit={onSubmit} noValidate>
          <div className="field-grid">
            <label>Room length <span>(feet)</span><input type="number" min="0" step="any" value={form.length} onChange={e => update('length', e.target.value)} /></label>
            <label>Room width <span>(feet)</span><input type="number" min="0" step="any" value={form.width} onChange={e => update('width', e.target.value)} /></label>
            <label>Wall height <span>(feet)</span><input type="number" min="0" step="any" value={form.wallHeight} onChange={e => update('wallHeight', e.target.value)} /></label>
            <label>Doors <span>(count)</span><input type="number" min="0" step="1" value={form.doors} onChange={e => update('doors', e.target.value)} /></label>
            <label>Windows <span>(count)</span><input type="number" min="0" step="1" value={form.windows} onChange={e => update('windows', e.target.value)} /></label>
            <label>Coats <span>(number)</span><input type="number" min="0" step="1" value={form.coats} onChange={e => update('coats', e.target.value)} /></label>
            <label>Paint coverage <span>(sq ft/gallon)</span><input type="number" min="0" step="any" value={form.coverage} onChange={e => update('coverage', e.target.value)} /></label>
          </div>
          <label className="check"><input type="checkbox" checked={form.ceiling} onChange={e => update('ceiling', e.target.checked)} /> Include ceiling</label>
          <p className="hint">Typical coverage is about 350–400 sq ft per gallon. Check your paint label for the manufacturer's coverage.</p>
          {started && result.errors.length > 0 && <div className="errors" role="alert">{result.errors.map(error => <p key={error}>{error}</p>)}</div>}
          <button className="primary-button" type="submit">Calculate Paint</button>
        </form>
        <section className="result" aria-live="polite" aria-label="Paint calculation result">
          {validResult ? <><p className="result-label">Paint needed:</p><output className="gallons">{formatNumber(result.gallonsNeeded)} <span>gallons</span></output><div className="order"><span>Recommended order</span><strong>{formatNumber(result.recommendedGallons)} gallons</strong><small>Includes a 10% planning allowance for touch-ups, waste, and normal variation.</small></div><p className="area">Paintable area: <strong>{formatNumber(result.paintArea)} sq ft</strong></p><div className="actions"><button className="secondary-button" type="button" onClick={copy}>{copyStatus === 'success' ? 'Copied!' : 'Copy Results'}</button><button className="text-button" type="button" onClick={reset}>Reset</button></div>{copyStatus && <p className="copy-status" role="status">{copyStatus === 'success' ? 'Results copied.' : 'Copy unavailable. Please try again.'}</p>}</> : <p className="empty-result">Your estimate will appear here.</p>}
        </section>
        <p className="assumption">Paint coverage varies by product, surface, color, texture, and application method. Use the coverage printed on your paint can when available.</p>
      </section>
      <section className="affiliate-card" aria-label="Recommended paint project supplies">
        <p className="affiliate-label">PAINTING SUPPLIES</p>
        <h2>Ready to paint? Get the rest of the kit.</h2>
        <p>Use your paint estimate, then compare paint and application supplies on Amazon.</p>
        <div className="affiliate-links">
          <a href="https://www.amazon.com/s?k=interior+wall+paint&tag=athena-20" target="_blank" rel="sponsored noopener">Compare interior wall paint <span>(paid link)</span></a>
          <a href="https://www.amazon.com/s?k=paint+rollers+brushes+drop+cloths&tag=athena-20" target="_blank" rel="sponsored noopener">Shop paint rollers, brushes &amp; drop cloths <span>(paid link)</span></a>
        </div>
      </section>
      <article className="content">
        <section><h2>How the calculator works</h2><p>Wall area is calculated from the room perimeter and wall height, then typical door and window areas are subtracted. If selected, the ceiling is added. The total is multiplied by your number of coats and divided by coverage per gallon.</p><div className="method"><strong>Methodology</strong><p>Wall area = 2 × (length + width) × height<br />Paint needed = paintable area × coats ÷ coverage</p></div></section>
        <section><h2>How much paint do I need?</h2><p>For a typical room, measure the length, width, and wall height. Enter the number of doors and windows to remove their approximate area from the total. Use the coverage listed on your paint can for a product-specific estimate.</p></section>
        <section><h2>Should I include the ceiling?</h2><p>Yes, if you plan to paint it with the same product. Turn on the ceiling option and the calculator will add the room's floor-area footprint to the paintable area.</p></section>
        <section><h2>Why order extra paint?</h2><p>A 10% planning allowance is included in the recommended order. Extra paint can help with touch-ups and normal application variation, but your actual needs depend on the surface and product.</p></section>
        <section><h2>Paint calculator for walls and ceilings</h2><p>Use this paint calculator to estimate gallons for room walls and, when selected, the ceiling. The estimate accounts for doors, windows, number of coats, and the coverage rate you enter.</p></section>
        <section><h2>How many gallons of paint do I need?</h2><p>Start with your room dimensions, enter the number of coats, and use the coverage printed on your paint can when available. The calculator converts the paintable area into gallons and shows a recommended order with a 10% planning allowance.</p></section>
        <section><h2>FAQ</h2><details><summary>What coverage should I use?</summary><p>Use the coverage printed on your paint can. A common planning range is roughly 350–400 square feet per gallon, but products vary.</p></details><details><summary>Does this account for doors and windows?</summary><p>Yes. The calculator uses approximate areas of 21 square feet per door and 15 square feet per window.</p></details><details><summary>Does this calculate primer too?</summary><p>No. This calculator estimates paint quantity. If you need primer, calculate it separately based on the primer's coverage and the surface being primed.</p></details></section>
        <section><h2>More paint planning help</h2><p>See the step-by-step guide: <a href="/how-much-paint-do-i-need.html">How Much Paint Do I Need?</a></p><p>Need help choosing the right coverage input? Read the <a href="/paint-coverage-guide.html">paint coverage per gallon guide</a>.</p></section>
      </article>
      <nav aria-label="More ATHENA Calculators">
        <p><strong>More ATHENA Calculators:</strong> <a href="https://athena-public-platform.pages.dev/#tools">ATHENA Tools</a> · <a href="https://flooring-calculator.pages.dev/">Flooring Calculator</a> · <a href="https://contractor-pricing-calculator.pages.dev/">Contractor Pricing Calculator</a> · <a href="https://concrete-calculator-cic.pages.dev/">Concrete Calculator</a></p>
      </nav>

      <footer><span>Free paint calculator for practical project planning.</span>{' '}<span>As an Amazon Associate I earn from qualifying purchases.</span>{' '}<a href="/privacy.html">Privacy Policy</a></footer>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
