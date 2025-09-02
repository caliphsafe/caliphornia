interface SongInfoProps {
  className?: string
}

export function SongInfo({ className }: SongInfoProps) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-black text-[32px] md:text-[48px] font-black tracking-tight ">POLYGAMY (PROD BY. CALIPH)</h2>
      <p className="text-[#A0896B] text-xl md:text-2xl font-medium tracking-wide mb-12">CALIPH</p>
    </div>
  )
}
