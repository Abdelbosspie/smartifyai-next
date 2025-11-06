export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",     // protect dashboard
    "/voice-agents/:path*",  // add other protected routes here
  ],
};