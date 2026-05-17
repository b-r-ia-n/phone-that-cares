import { Wifi, Signal } from 'lucide-react';

export default function AndroidStatusBar() {
  return (
    <div className="absolute top-0 left-0 right-0 z-[60] px-6 py-3 flex items-center justify-between pointer-events-none" style={{ color: 'rgba(255,255,255,0.95)' }}>
      {/* Left side - Time */}
      <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-body)' }}>
        11:11
      </div>

      {/* Right side - Status icons */}
      <div className="flex items-center gap-1.5">
        {/* Signal strength */}
        <Signal size={14} strokeWidth={2} />

        {/* Network type */}
        <span className="text-[10px] font-medium">4G</span>

        {/* WiFi */}
        <Wifi size={14} strokeWidth={2} />

        {/* Battery - mostly filled */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="18" height="11" rx="2" ry="2" />
          <rect x="4" y="9" width="13" height="7" fill="currentColor" opacity="0.7" />
          <line x1="22" y1="11" x2="22" y2="14" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
