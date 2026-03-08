'use client'
import Link from "next/link";
import { useState } from 'react'
import SearchBar from "./searchbar";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    const handleSearch = (query: any, filter: any) => {
        console.log("Searching:", query, "Filter:", filter)
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
                    <SearchBar placeholder="Search artwork..." onSearch={handleSearch} />
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
                    onClick={() => setIsOpen(!isOpen)}
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
                            Log out
                        </Link>
                    </div>
                )}
            </div>

        </header>
    )
}