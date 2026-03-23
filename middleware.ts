import { getToken } from "@/api/ServerActions";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken();

  const { pathname } = request.nextUrl;
  if (!token && pathname !== "/auth/signin") {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  if (token && pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth/signin"],
};
