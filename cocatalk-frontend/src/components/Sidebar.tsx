import type React from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline"; // Tailwind Heroicons

const Sidebar: React.FC = () => {
    

    return (
        <aside className="w-1/4 border-r bg-white flex flex-col">

            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Chats</h2>
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