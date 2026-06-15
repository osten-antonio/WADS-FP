import Link from "next/link"

export function Title() {
    return (
        <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity">AIMS</h1>
        </Link>
    )
}