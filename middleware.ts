// middleware.ts
import { NextResponse, type NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only run on the root path
  if (pathname !== "/") return NextResponse.next()

  // Consider the user "known" if they have any of these cookies
  const cookieNames = ["supporter", "email", "has_email", "caliph_email"]
  const isKnown = cookieNames.some((n) => {
    const v = req.cookies.get(n)?.value
    return v && v !== "0"
  })

  if (isKnown) {
    const url = req.nextUrl.clone()
    url.pathname = "/home"
    return NextResponse.redirect(url)
  }

  // Otherwise, let your current root page render (email gate, etc.)
  return NextResponse.next()
}

export const config = {
  matcher: ["/"],
}
