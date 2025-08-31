interface ArtistMessageProps {
  className?: string
}

export function ArtistMessage({ className }: ArtistMessageProps) {
  return (
    <div className={`flex justify-center ${className} p-5 md:pt-5 md:pr-5 md:pb-14 md:pl-5`}>
      <div className="border border-black bg-white p-4 md:p-6 flex items-center gap-4 md:gap-8 max-w-[640px]">
        <div className="max-w-[88px] max-h-[88px] overflow-hidden flex-shrink-0 border border-black">
          <img src="/caliph-profile.png" alt="Caliph profile" className="w-full h-full object-cover" />
        </div>
        <p className="text-black text-sm md:text-[24px] font-medium text-left flex-1">
          Caliph wants to share an unreleased song with you 👀
        </p>
      </div>
    </div>
  )
}
