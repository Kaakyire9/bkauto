// Node script: compute contrast ratios for palette tokens against white and black
// Usage: node scripts/contrast-check.js

const palette = {
  'brand-deep-navy': '#041123',
  'brand-gold': '#D4AF37',
  'accent-ruby': '#C21E3A',
  'accent-sapphire': '#1257D8',
  'accent-emerald': '#0FA662',
  'metallic-grey-purple': '#6F6B78',
  'cta-cherry': '#E53935',
  'cta-autumn': '#FF7A18',
  'chrome-silver': '#C6CDD1',
}

function hexToRgb(hex) {
  const h = hex.replace('#','')
  const bigint = parseInt(h, 16)
  if (h.length === 6) {
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    }
  }
  throw new Error('unexpected hex: ' + hex)
}

function srgbToLinear(c) {
  c = c / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function luminance(rgb) {
  const r = srgbToLinear(rgb.r)
  const g = srgbToLinear(rgb.g)
  const b = srgbToLinear(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(hex1, hex2) {
  const L1 = luminance(hexToRgb(hex1))
  const L2 = luminance(hexToRgb(hex2))
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  return +( (lighter + 0.05) / (darker + 0.05) ).toFixed(2)
}

function hexToHsl(hex) {
  const {r,g,b} = hexToRgb(hex)
  const r1 = r/255, g1 = g/255, b1 = b/255
  const max = Math.max(r1,g1,b1), min = Math.min(r1,g1,b1)
  let h=0,s=0,l=(max+min)/2
  if (max!==min) {
    const d = max-min
    s = l>0.5? d/(2-max-min): d/(max+min)
    switch(max){
      case r1: h = (g1-b1)/d + (g1<b1?6:0); break;
      case g1: h = (b1-r1)/d + 2; break;
      case b1: h = (r1-g1)/d + 4; break;
    }
    h/=6
  }
  return {h: h*360, s: s*100, l: l*100}
}

function hslToHex(h,s,l){
  s/=100; l/=100
  const a = s*Math.min(l,1-l)
  const f = n => {
    const k = (n + h/30) % 12
    const color = l - a * Math.max(Math.min(k-3,9-k,1),-1)
    return Math.round(255*color).toString(16).padStart(2,'0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function ensureContrast(hexBg, fg = '#FFFFFF', target = 4.5) {
  let ratio = contrastRatio(hexBg, fg)
  if (ratio >= target) return {ok: true, ratio}
  // attempt to darken background (or lighten fg) by adjusting L in HSL
  const hsl = hexToHsl(hexBg)
  let tries = 0
  let l = hsl.l
  while (tries < 30 && ratio < target) {
    l = Math.max(0, l - 2) // darken by 2% each iter
    const candidate = hslToHex(hsl.h, hsl.s, l)
    ratio = contrastRatio(candidate, fg)
    tries++
    if (ratio >= target) return {ok: true, ratio, hex: candidate}
  }
  // if not reached, try lightening background and use dark fg
  l = hsl.l
  ratio = contrastRatio(hexBg, '#000000')
  if (ratio >= target) return {ok: true, ratio, hexFg: '#000000'}
  while (tries < 60 && ratio < target) {
    l = Math.min(100, l + 2)
    const candidate = hslToHex(hsl.h, hsl.s, l)
    ratio = contrastRatio(candidate, '#000000')
    tries++
    if (ratio >= target) return {ok: true, ratio, hex: candidate, hexFg: '#000000'}
  }
  return {ok: false, ratio}
}

console.log('\nBK Auto Palette - Contrast Report\n')
const white = '#FFFFFF'
const black = '#000000'
for (const [name, hex] of Object.entries(palette)){
  const rW = contrastRatio(hex, white)
  const rB = contrastRatio(hex, black)
  const result = ensureContrast(hex, white, 4.5)
  console.log(`${name}: ${hex}`)
  console.log(`  contrast vs white: ${rW}:1   vs black: ${rB}:1`)
  if (result.ok && result.hex && result.hex.toLowerCase() !== hex.toLowerCase()){
    console.log(`  suggestion: use ${result.hex} (darkened) to reach >=4.5:1 with white (ratio ${result.ratio})`)
  } else if (result.ok && result.hexFg){
    console.log(`  suggestion: keep ${hex} but use ${result.hexFg} text (ratio ${result.ratio})`)
  } else if (rW >= 4.5){
    console.log('  ✅ ok with white text')
  } else if (rB >= 4.5){
    console.log('  ✅ ok with black text')
  } else {
    console.log('  ⚠️ could not meet contrast target with simple adjustments')
  }
  console.log('')
}

console.log('Checks done. For CTAs, ensure white-on-cta contrast >= 4.5 if used on dark backgrounds.')
