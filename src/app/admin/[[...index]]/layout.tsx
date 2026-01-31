export const metadata = {
  title: 'E-MENU Admin',
  description: 'Administration du menu digital',
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="sanity-studio">
            {children}
        </div>
    )
}
