'use client'
import Link from "next/link";
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SearchBar from "./searchbar";
import { fetchSearchResults, type SearchResultItem } from "@/lib/searchApi";

export default function Navbar() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profileHref, setProfileHref] = useState("/user_profile")

    useEffect(() => {
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)
        try {
            const raw = localStorage.getItem("user")
            if (raw) {
                const u = JSON.parse(raw) as { username?: string }
                if (u.username) setProfileHref(`/user_profile/${encodeURIComponent(String(u.username))}`)
            }
        } catch {
            setProfileHref("/user_profile")
        }
    }, [])

    const handleSearch = (query?: any, filter?: any) => {
        console.log("Searching:", query, "Filter:", filter)
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsLoggedIn(false)
        setIsOpen(false)
        setProfileHref("/user_profile")
        router.push('/')
    }

    const toggleMenu = () => {
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)
        try {
            const raw = localStorage.getItem("user")
            if (raw) {
                const u = JSON.parse(raw) as { username?: string }
                if (u.username) setProfileHref(`/user_profile/${encodeURIComponent(String(u.username))}`)
            }
        } catch { /* ignore */ }
        setIsOpen(!isOpen)
    }

    return (
        <header style={{
            backgroundColor: '#ffd29e',
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            gap: '16px'
        }}>

            {/* Logo */}
            <div style={{ flex: 1 }}>
                <Link href="/" style={{
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '24px',
                    whiteSpace: 'nowrap'
                }}>
                    ArtPort
                </Link>
            </div>


            {/* Search bar container */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '500px'
                }}>
                    <SearchBar
                        placeholder="Search artwork..."
                        onSearch={handleSearch}
                        loadResults={fetchSearchResults}
                        onSelectResult={(item: SearchResultItem) => {
                            if (item.type === "artist") {
                                const seg = item.username && item.username !== "Unknown"
                                    ? item.username
                                    : item.id
                                router.push(`/user_profile/${encodeURIComponent(seg)}`)
                                return
                            }
                            if (item.type === "artwork") {
                                const seg = item.slug || item.id
                                router.push(`/post/${encodeURIComponent(seg)}`)
                            }
                        }}
                    />
                </div>
            </div>


            {/* Upload Profile and profile button wrapper*/}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>

                {/* Upload button */}
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '2px solid #ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: '300',

                }}>
                    <Link href="/upload">+</Link>
                </div>


                {/* Profile menu */}
                <div
                    onClick={toggleMenu}
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        flexShrink: 0
                    }}
                />

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        right: 0,
                        top: '44px',
                        backgroundColor: '#fff4e4',
                        borderRadius: '8px',
                        padding: '8px',
                        minWidth: '120px',
                        border: '1px solid #cccccc'
                    }}>
                        {isLoggedIn ? (
                            <>
                                <Link
                                    href={profileHref}
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        color: '#f29f41',
                                        fontWeight: 'bold',
                                        textDecoration: 'none',
                                        display: 'block',
                                        padding: '8px'
                                    }}
                                >
                                    Profile
                                </Link>

                                <Link
                                    href={profileHref}
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        color: '#f29f41',
                                        fontWeight: 'bold',
                                        textDecoration: 'none',
                                        display: 'block',
                                        padding: '8px'
                                    }}
                                >
                                    My Works
                                </Link>

                                <Link
                                    href=""
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        color: '#f29f41',
                                        fontWeight: 'bold',
                                        textDecoration: 'none',
                                        display: 'block',
                                        padding: '8px'
                                    }}
                                >
                                    Settings
                                </Link>

                                <div
                                    onClick={handleLogout}
                                    style={{
                                        color: '#f29f41',
                                        fontWeight: 'bold',
                                        textDecoration: 'none',
                                        display: 'block',
                                        padding: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Log out
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/user_profile"
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        color: '#f29f41',
                                        fontWeight: 'bold',
                                        textDecoration: 'none',
                                        display: 'block',
                                        padding: '8px'
                                    }}
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        color: '#f29f41',
                                        fontWeight: 'bold',
                                        textDecoration: 'none',
                                        display: 'block',
                                        padding: '8px'
                                    }}
                                >
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>

        </header>
    )
}