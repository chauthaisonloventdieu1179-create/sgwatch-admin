import type { Metadata } from "next";
import ReduxProvider from "@/lib/store/redux-provider";
import AuthProvider from "@/lib/store/features/auth/authProvider";

export const metadata: Metadata = {
  title: "SGWatch Admin",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ReduxProvider>
        <AuthProvider>
          <body>{children}</body>
        </AuthProvider>
      </ReduxProvider>
    </html>
  );
}
