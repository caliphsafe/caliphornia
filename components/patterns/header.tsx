import Image from "next/image"

export function Header() {
  return (
    <div className="flex w-full justify-center mb-2 md:mb-4 py-4">
      <Image src="/caliphornia-logo.svg" alt="CALIPHORNIA" width={200} height={60} className="h-12 w-auto md:h-16" />
    </div>
  )
}
