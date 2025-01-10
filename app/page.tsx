"use client";
import React from "react";
import { useState } from "react";

// Helper function to render the response
const renderResponse = (response: string) => {
    return (
        <div className="space-y-4 text-gray-800 leading-relaxed">
            {response.split("\n").map((line, index) => {
                // Vérifier si une ligne est un titre principal
                if (line.startsWith("# ")) {
                    const title = line.replace(/^# /, "").trim();
                    return (
                        <h1
                            key={index}
                            className="text-2xl font-bold text-gray-900"
                        >
                            {title}
                        </h1>
                    );
                }

                // Vérifier si une ligne est un sous-titre
                if (line.startsWith("## ")) {
                    const subtitle = line.replace(/^## /, "").trim();
                    return (
                        <h2
                            key={index}
                            className="text-xl font-bold text-gray-800"
                        >
                            {subtitle}
                        </h2>
                    );
                }

                // Vérifier si la ligne commence par une puce ou un numéro
                if (line.startsWith("- ") || line.match(/^\d+\./)) {
                    const content = line.replace(/^(-|\d+\.)\s*/, "").trim();
                    return (
                        <li key={index} className="list-disc list-inside ml-6">
                            {content}
                        </li>
                    );
                }

                // Vérifier si la ligne contient un lien Markdown
                const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                if (linkRegex.test(line)) {
                    // Diviser le texte en parties avec ou sans lien
                    const parts = [];
                    let lastIndex = 0;

                    line.replace(linkRegex, (match, text, url, offset) => {
                        // Ajouter le texte avant le lien
                        if (offset > lastIndex) {
                            parts.push(line.slice(lastIndex, offset));
                        }
                        // Ajouter le lien cliquable
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

                    // Ajouter le texte après le dernier lien
                    if (lastIndex < line.length) {
                        parts.push(line.slice(lastIndex));
                    }

                    // Retourner les parties combinées dans un paragraphe
                    return (
                        <p key={index}>
                            {parts.map((part, i) =>
                                typeof part === "string" ? (
                                    <span key={i}>{part}</span>
                                ) : (
                                    part
                                )
                            )}
                        </p>
                    );
                }

                // Par défaut, rendre la ligne comme un paragraphe
                return <p key={index}>{line.trim()}</p>;
            })}
        </div>
    );
};

// Usage in the UI
export default function ChatbotPage() {
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResponse("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userMessage: message }),
            });

            if (!res.ok) {
                throw new Error("Erreur lors de la communication avec l'API");
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader!.read();
                done = doneReading;
                const chunk = decoder.decode(value, { stream: true });
                setResponse((prev) => prev + chunk); // Ajouter le texte en flux
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">
                    Chatbot de la Mairie d&apos;Antony
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label htmlFor="message" className="block font-medium">
                        Entrez votre question :
                    </label>
                    <input
                        id="message"
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ex: Quels sont les horaires d'ouverture ?"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? "Chargement..." : "Envoyer"}
                    </button>
                </form>

                {error && (
                    <p className="mt-4 text-sm text-red-500">
                        Erreur : {error}
                    </p>
                )}

                {response && (
                    <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow">
                        {renderResponse(response)}
                    </div>
                )}
            </div>
        </div>
    );
}
