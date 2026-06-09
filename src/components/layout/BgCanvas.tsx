import { useThemeStore } from '@/stores/themeStore'

// CSS-only animated backgrounds — no Canvas, no memory leak
export default function BgCanvas() {
  const theme = useThemeStore((s) => s.theme)

  return (
    <>
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: 'var(--bg)',
          transition: 'background 0.8s ease',
        }}
      />
      {/* CSS particle overlay per theme */}
      <style>{getThemeCSS(theme)}</style>
    </>
  )
}

function getThemeCSS(theme: string): string {
  switch (theme) {
    case 'starry':
      return `body::before{content:'';position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-5;
        background-image:radial-gradient(1px 1px at 20% 30%,rgba(255,255,255,0.4),transparent),
                          radial-gradient(1px 1px at 40% 70%,rgba(255,255,255,0.3),transparent),
                          radial-gradient(1px 1px at 60% 20%,rgba(255,255,255,0.5),transparent),
                          radial-gradient(1px 1px at 80% 50%,rgba(255,255,255,0.3),transparent),
                          radial-gradient(1.5px 1.5px at 10% 60%,rgba(255,255,255,0.4),transparent),
                          radial-gradient(1px 1px at 70% 80%,rgba(255,255,255,0.3),transparent),
                          radial-gradient(1.5px 1.5px at 30% 10%,rgba(255,255,255,0.5),transparent),
                          radial-gradient(1px 1px at 90% 40%,rgba(255,255,255,0.4),transparent);
        animation:twinkle 8s ease-in-out infinite alternate;}`
    case 'spring':
      return `body::before{content:'';position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-5;
        background-image:radial-gradient(ellipse at 20% 80%,rgba(255,182,193,0.15),transparent 50%),
                          radial-gradient(ellipse at 80% 20%,rgba(255,218,185,0.12),transparent 50%),
                          radial-gradient(ellipse at 50% 50%,rgba(255,228,225,0.1),transparent 50%);}`
    case 'ocean':
      return `body::before{content:'';position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-5;
        background-image:radial-gradient(ellipse at 30% 70%,rgba(100,200,220,0.1),transparent 60%),
                          radial-gradient(ellipse at 70% 30%,rgba(80,180,200,0.08),transparent 60%);
        animation:float 20s ease-in-out infinite;}`
    case 'forest':
      return `body::before{content:'';position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-5;
        background-image:radial-gradient(ellipse at 40% 60%,rgba(100,160,80,0.08),transparent 60%),
                          radial-gradient(ellipse at 60% 40%,rgba(80,140,60,0.06),transparent 60%);}`
    default:
      return `@keyframes twinkle{0%,100%{opacity:0.6}50%{opacity:1}}
              @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`
  }
}
