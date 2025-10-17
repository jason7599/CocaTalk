import type React from "react";
import { Cog6ToothIcon, UserCircleIcon } from "@heroicons/react/24/outline"; // Tailwind Heroicons
import { useEffect, useRef, useState } from "react";

const Sidebar: React.FC = () => {

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown if clicked outside 
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <aside className="w-1/4 border-r bg-white flex flex-col">
            {/* TOP BAR */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="p-1 rounded-full hover:bg-gray-100 transition"
                        title="Profile"
                    >
                        <UserCircleIcon className="w-10 h-10 text-red-600" />
                    </button>
                </div>

                {/* Dropdown menu */}
                {menuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-md border z-10">
                        <div className="px-4 py-2 border-b">
                            <p className="font-semibold">John Doe</p>
                            <p className="text-sm text-gray-500">john@example.com</p>
                        </div>
                        <button
                            onMouseDown={() => {
                                localStorage.removeItem('token');
                                window.location.href = '/login';
                            }}
                            className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition"
                        >
                            Log out
                        </button>
                    </div>
                )}

                <button
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    title="Settings"
                    onClick={() => console.log("⚙️ Settings clicked")}
                >
                    <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            <div className="p-4">
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full p-2 rounded-full border border-gray-300"
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                {["Swati - THN", "Chintu Voda", "Pinder"].map((chat, idx) => (
                    <div
                        key={idx}
                        className={`px-4 py-3 hover:bg-gray-100 cursor-pointer ${
                            idx === 0 ? "bg-green-50" : ""
                        }`}
                    >
                        <div className="font-medium">{chat}</div>
                        <div className="text-sm text-gray-500">Last message preview...</div>
                    </div>
                ))}

            </div>
        </aside>
    )
}

export default Sidebar;