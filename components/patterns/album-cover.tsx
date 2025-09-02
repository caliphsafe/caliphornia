interface AlbumCoverProps {
  className?: string
}

export function AlbumCover({ className }: AlbumCoverProps) {
  return (
    <div className={`relative pt-5 px-5 pb-4 md:pt-0 md:px-5 md:pb-14 ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/caliphornia-logo.svg"
          alt="CALIPHORNIA Background"
          className="w-[376px] md:w-[768px] h-auto opacity-15"
        />
      </div>

      <div className="relative z-10 flex justify-center">
        <div className="border-4 border-[#B8A082]">
          <div className="bg-black overflow-hidden relative w-[280px] h-[280px] md:w-[480px] md:h-[480px]">
            <img
              src="/polygamy-cover.png"
              alt="Polygamy Album Cover"
              className="w-full h-full object-cover relative z-10"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
