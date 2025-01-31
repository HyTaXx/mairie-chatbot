"use client";

import { useState, useEffect, useRef } from "react";
import { Clipboard, Pin, Info, Wrench, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import styles from "./markdown.module.css";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ChatbotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; id: number }[]
  >(() => {
    if (typeof window !== "undefined") {
      const savedMessages = localStorage.getItem("chatMessages");
      return savedMessages ? JSON.parse(savedMessages) : [];
    }
    return [];
  });

  const [pinnedMessages, setPinnedMessages] = useState<
    { id: number; content: string }[]
  >(() => {
    if (typeof window !== "undefined") {
      const savedPinned = localStorage.getItem("pinnedMessages");
      return savedPinned ? JSON.parse(savedPinned) : [];
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const initialPromptProcessed = useRef(false);

  const nextMessageId = useRef(
    messages.length > 0 ? messages[messages.length - 1].id + 1 : 1
  );

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !initialPromptProcessed.current && messages.length === 0) {
      initialPromptProcessed.current = true;
      setMessages([
        { role: "user", content: prompt, id: nextMessageId.current++ },
      ]);
      handleSubmitMessage(prompt);
    }
  }, [searchParams]);

  const handleSubmitMessage = async (message: string) => {
    try {
      setLoading(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input, id: nextMessageId.current++ },
    ]);
    setInput("");
    await handleSubmitMessage(input);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save messages and pinned messages to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pinnedMessages", JSON.stringify(pinnedMessages));
    }
  }, [pinnedMessages]);

  const handleClearSession = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("chatMessages");
      localStorage.removeItem("pinnedMessages");
      router.push("/");
    }
    setMessages([]);
    setPinnedMessages([]);
  };

  const cleanAndTruncateText = (text: string, length: number) => {
    const cleanedText = text
      .replace(/[#*_\-`]/g, "")
      .replace(/\n+/g, " ")
      .trim();
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
      prev.find((msg) => msg.id === id) ? prev : [...prev, { id, content }]
    );
  };

  return (
    <div className="flex h-screen p-4">
      {/* Sidebar */}
      <div className="w-1/4 p-4 overflow-y-auto flex flex-col justify-between">
        <div>
          <div className="">
            <img src="logo-placeholder.png" alt="" width={40} />
          </div>
          <div className="flex gap-2 items-center mt-8">
            <Pin fill="black" />
            <h2 className="text-lg font-bold mb-4 items-center h-[24px]">
              Épinglés
            </h2>
          </div>
          <div className="relative border-l-2 border-slate-200 pl-2 ml-2">
            {pinnedMessages.map((message) => (
              <div
                key={message.id}
                className="relative flex items-center mb-4 hover:bg-slate-200 p-2 rounded-lg"
              >
                <a
                  href={`#${message.id}`}
                  className="pl-4 block text-gray-800 hover:underline"
                >
                  {cleanAndTruncateText(message.content, 50)}
                </a>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <hr />
          <div className="flex flex-row gap-2">
            <Info />
            <a href="/support">Support</a>
          </div>
          <div className="flex flex-row gap-2">
            <Wrench fill="black" />
            <a href="/aide">Aide</a>
          </div>
          <hr />
          <Dialog>
            <DialogTrigger className="bg-[#293670] text-white p-2 rounded-md text-sm">
              Quitter la session
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="flex flex-col gap-2">
                <DialogTitle className="bg-yellow-200 text-center p-[6px] text-xs self-center w-[150px] rounded">
                  Fin de conversation
                </DialogTitle>
                <DialogDescription className="flex flex-col gap-4">
                  <span className="text-2xl text-black text-center w-[250px] self-center">
                    Merci d'avoir utilisé Hill. À bientôt 👋
                  </span>
                  <span className="border-b-2 border-solid border-gray-300"></span>
                  <Button className="w-2/5 self-end bg-[#293670]">
                    <a href="/">Retourner à l'accueil</a>
                  </Button>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <hr className="pb-4" />
          {messages.map((message) => (
            <div
              key={message.id}
              id={String(message.id)}
              className={clsx(
                "flex flex-col mb-4",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={`inline-block max-w-md p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {message.role === "user" ? (
                  message.content
                ) : (
                  <ReactMarkdown className={styles.markdown}>
                    {message.content.replaceAll("```", "")}
                  </ReactMarkdown>
                )}
              </div>
              {message.role === "assistant" && (
                <div className="mt-4 flex justify-start space-x-4">
                  <button
                    onClick={() => handleCopy(message.content)}
                    className="text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <Clipboard size={18} fill="black" />
                    <span className="ml-1 text-sm">Copier</span>
                  </button>
                  <button
                    onClick={() => handlePin(message.id, message.content)}
                    className="text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <Pin size={18} fill="black" />
                    <span className="ml-1 text-sm">Épingler</span>
                  </button>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Entrez votre message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700 disabled:opacity-50"
            >
              <Send color="black" fill="black" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}