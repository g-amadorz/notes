import './globals.css'

export const metadata = {
  title: 'Notes App',
  description: 'A modern note-taking application built with Next.js and MongoDB',
}
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body> 
    </html>
  )
}
