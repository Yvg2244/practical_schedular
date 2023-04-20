import "@/styles/globals.css";

export default function RootLayout({ children }) {
 return (
    <html lang="en">
      <body className="font-mono bg-gray-200">{children}</body>
    </html>
  )
}
