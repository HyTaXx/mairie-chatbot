"use client";

import { useState, useEffect, useRef } from "react";
import { Clipboard, Pin } from "lucide-react";

const renderResponse = (response: string) => {
    return (
        <div className="space-y-4 text-gray-800 leading-relaxed">
            {response.split("\n").map((line, index) => {
                if (line.startsWith("# ")) {
                    return (
                        <h1
                            key={`${index}-header`}
                            className="text-xl font-bold text-gray-900 mb-2"
                        >
                            {line.replace("# ", "").trim()}
                        </h1>
                    );
                }
                if (line.startsWith("## ")) {
                    return (
                        <h2
                            key={`${index}-subheader`}
                            className="text-lg font-semibold text-gray-800 mb-1"
                        >
                            {line.replace("## ", "").trim()}
                        </h2>
                    );
                }
                if (line.startsWith("### ")) {
                    return (
                        <h3
                            key={`${index}-subsubheader`}
                            className="text-md font-semibold text-gray-800 mb-1"
                        >
                            {line.replace("### ", "").trim()}
                        </h3>
                    );
                }
                if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                        <p key={`${index}-bold`} className="font-bold">
                            {line.replace(/\*\*/g, "").trim()}
                        </p>
                    );
                }
                if (line.startsWith("- ") || line.match(/^\d+\./)) {
                    return (
                        <li
                            key={`${index}-list`}
                            className="list-disc list-inside ml-6"
                        >
                            {line.replace(/^(-|\d+\.)\s*/, "").trim()}
                        </li>
                    );
                }
                const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                if (linkRegex.test(line)) {
                    const parts = [];
                    let lastIndex = 0;
                    line.replace(linkRegex, (match, text, url, offset) => {
                        if (offset > lastIndex) {
                            parts.push(line.slice(lastIndex, offset));
                        }
                        parts.push(
                            <a
                                key={`${index}-${offset}`}
                                href={url}
                                className="text-blue-600 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {text}
                            </a>
                        );
                        lastIndex = offset + match.length;
                        return match;
                    });
                    if (lastIndex < line.length) {
                        parts.push(line.slice(lastIndex));
                    }
                    return (
                        <p key={`${index}-paragraph`}>
                            {parts.map((part, i) =>
                                typeof part === "string" ? (
                                    <span key={`${index}-${i}`}>{part}</span>
                                ) : (
                                    part
                                )
                            )}
                        </p>
                    );
                }
                const urlRegex = /(http[s]?:\/\/[^\s]+)/g;
                if (urlRegex.test(line)) {
                    return (
                        <p key={`${index}-url`}>
                            {line.split(urlRegex).map((part, i) =>
                                urlRegex.test(part) ? (
                                    <a
                                        key={`${index}-${i}`}
                                        href={part}
                                        className="text-blue-600 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {part}
                                    </a>
                                ) : (
                                    part
                                )
                            )}
                        </p>
                    );
                }
                return (
                    <p key={`${index}-text`} className="text-gray-700">
                        {line.trim()}
                    </p>
                );
            })}
        </div>
    );
};

export default function ChatbotPage() {
    const [messages, setMessages] = useState<
        { role: "user" | "assistant"; content: string; id: number }[]
    >([]);
    const [pinnedMessages, setPinnedMessages] = useState<
        { id: number; content: string }[]
    >([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const nextMessageId = useRef(1);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setMessages((prev) => [
            ...prev,
            { role: "user", content: input, id: nextMessageId.current++ },
        ]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userMessage: input }),
            });

            if (!res.ok) {
                throw new Error("Erreur lors de la communication avec l'API");
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let assistantResponse = "";

            while (!done) {
                const { value, done: doneReading } = await reader!.read();
                done = doneReading;
                const chunk = decoder.decode(value, { stream: true });
                assistantResponse += chunk;

                setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage?.role === "assistant") {
                        return [
                            ...prev.slice(0, -1),
                            {
                                role: "assistant",
                                content: assistantResponse,
                                id: lastMessage.id,
                            },
                        ];
                    }
                    return [
                        ...prev,
                        {
                            role: "assistant",
                            content: assistantResponse,
                            id: nextMessageId.current++,
                        },
                    ];
                });
            }
        } catch (err: any) {
            setError(err.message);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Erreur lors de la réponse.",
                    id: nextMessageId.current++,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const cleanAndTruncateText = (text: string, length: number) => {
        // Remove Markdown-specific characters
        const cleanedText = text
            .replace(/[#*_\-`]/g, "") // Remove Markdown symbols
            .replace(/\n+/g, " ") // Replace newlines with spaces
            .trim();
        // Truncate the text to the specified length
        return cleanedText.length > length
            ? `${cleanedText.slice(0, length)}...`
            : cleanedText;
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
        alert("Texte copié !");
    };

    const handlePin = (id: number, content: string) => {
        setPinnedMessages((prev) =>
            prev.find((msg) => msg.id === id)
                ? prev
                : [...prev, { id, content }]
        );
    };

    return (
        <div className="flex h-screen">
            {/* Pinned Messages */}
            <div className="w-1/4 p-4 overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">Messages Épinglés</h2>
                {pinnedMessages.map((message) => (
                    <a
                        key={message.id}
                        href={`#${message.id}`}
                        className="block hover:underline mb-2 hover:bg-slate-200 p-2 rounded-lg"
                    >
                        {cleanAndTruncateText(message.content, 50)}
                    </a>
                ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                    <hr />

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            id={message.id.toString()}
                            className={`mb-4 ${
                                message.role === "user"
                                    ? "text-right"
                                    : "text-left"
                            }`}
                        >
                            {/* Chat Message Bubble */}
                            <div
                                className={`inline-block max-w-md p-3 rounded-lg ${
                                    message.role === "user"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-900"
                                }`}
                            >
                                {message.role === "assistant"
                                    ? renderResponse(message.content)
                                    : message.content}
                            </div>

                            {/* Action Buttons */}
                            {message.role === "assistant" && (
                                <div className="mt-2 flex justify-start space-x-4">
                                    <button
                                        onClick={() =>
                                            handleCopy(message.content)
                                        }
                                        className="text-gray-500 hover:text-gray-700 flex items-center"
                                    >
                                        <Clipboard size={18} />
                                        <span className="ml-1 text-sm">
                                            Copier
                                        </span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            handlePin(
                                                message.id,
                                                message.content
                                            )
                                        }
                                        className="text-gray-500 hover:text-gray-700 flex items-center"
                                    >
                                        <Pin size={18} />
                                        <span className="ml-1 text-sm">
                                            Épingler
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Box */}
                <div className="bg-white p-4 border-t border-gray-300">
                    <form onSubmit={handleSubmit} className="flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Entrez votre message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? "Chargement..." : "Envoyer"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
