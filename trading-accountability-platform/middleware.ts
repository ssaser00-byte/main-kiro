export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/plan/:path*",
    "/journal/:path*",
    "/analytics/:path*",
  ]
}
