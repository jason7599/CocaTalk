import type React from "react";

const ChatWindow: React.FC = () => {
    
    return (
        <main className="flex-1 flex flex-col">
            {/* HEADER */}
            <header className="px-6 py-6 bg-gray-200 border-b">
                <h2 className="text-lg font-semibold">Swati - THN</h2>
                <p className="text-sm text-gray-600">typing...</p>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-chat-bg">
            </div>
            
            {/* Input */}
            <form
                className="flex items-center gap-2 p-4 border-t bg-gray-50"
            >
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                >
                    Send
                </button>
            </form>
        </main>
    )
}

export default ChatWindow;