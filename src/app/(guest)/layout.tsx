import "../../styles/app.css";
import "../../styles/globals.css";
export const metadata = {
  title: "SGWatch Admin",
  description: "SGWatch Admin",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          margin: 0,
        }}
      >
        {children}
      </div>
    </>
  );
}
