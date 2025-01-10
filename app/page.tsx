"use client";

import { SuggestionCard } from "@/components/SuggestionCard";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const suggestions: Record<string, { title: string, suggestions: { title: string, prompt: string }[] }> = {
  "demarches-administratives": {
    title: "Choisissez votre démarche administrative",
    suggestions: [
      {
        title: "Renouveler mon passeport",
        prompt: "je souhaite renouveler mon passeport",
      },
      {
        title: "Faire mon passeport",
        prompt: "je souhaite faire mon passeport pour la première fois",
      },
      {
        title: "Renouveler ma CNI",
        prompt: "je souhaite renouveler ma carte nationale d'identité",
      },
      {
        title: "Faire ma CNI",
        prompt: "je souhaite faire ma carte nationale d'identité pour la première fois",
      },
      {
        title: "Déclarer un enfant",
        prompt: "je souhaite déclarer la naissance de mon enfant",
      },
      {
        title: "Déclarer un mariage",
        prompt: "je souhaite déclarer un mariage",
      },
      {
        title: "Changement d'adresse",
        prompt: "je souhaite déclarer mon changement d'adresse",
      }
    ]
  },
  "passeport": {
    title: "Faire mon passeport",
    suggestions: [
      {
        title: "Faire mon passeport",
        prompt: "je souhaite faire mon passeport pour la première fois",
      },
      {
        title: "Renouveler mon passeport",
        prompt: "je souhaite renouveler mon passeport",
      }
    ]
  },
  "enregistrer-enfant": {
    title: "Enregistrer un enfant",
    suggestions: [
      {
        title: "Enregistrer un enfant",
        prompt: "je souhaite enregistrer un enfant",
      }
    ]
  },
  "permis": {
    title: "Faire mon permis de conduire",
    suggestions: [
      {
        title: "Faire mon permis de conduire",
        prompt: "je souhaite faire mon permis de conduire pour la première fois",
      },
      {
        title: "Renouveler mon permis de conduire",
        prompt: "je souhaite renouveler mon permis de conduire",
      }
    ]
  }
}

const page = () => {
  const [suggestionCategory, setSuggestionCategory] = useState("demarches-administratives");
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  const prompt = useMemo(() => {
    return "Bonjour, voici mes questions : " + selectedSuggestions
      .map((suggestion) => suggestions[suggestionCategory].suggestions.find((s) => s.title === suggestion)?.prompt)
      .join(", ");
  }, [selectedSuggestions, suggestionCategory]);

  useEffect(() => {
    if (!suggestionCategory) {
      setSelectedSuggestions([]);
    }
  }, [suggestionCategory]);

  return (
    <>
      {suggestionCategory ? (
        <div className="relative min-h-svh p-16">
          <button
            onClick={() => setSuggestionCategory("")}
            className="sticky top-16 flex items-center gap-2 text-xl font-medium text-white bg-[#293670] rounded-lg p-3 mb-20 hover:bg-[#293670] hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <p className="font-medium text-5xl leading-tight pb-3">{suggestions[suggestionCategory].title}</p>
          <p className="font-medium text-xl text-neutral-400 pb-12">Aidez nous à personnaliser votre experience</p>

          <div className="flex gap-4 flex-wrap">
            {suggestions[suggestionCategory].suggestions.map((suggestion) => (
              <button
                key={suggestion.title}
                className={clsx(
                  "relative text-xl font-medium border-2 border-[#F3F3F3] rounded-xl px-6 py-5 transition-colors duration-75",
                  selectedSuggestions.includes(suggestion.title) && "border-[#293670] bg-blue-50"
                )}
                onClick={() => {
                  if (selectedSuggestions.includes(suggestion.title)) {
                    setSelectedSuggestions(selectedSuggestions.filter((s) => s !== suggestion.title));
                  } else {
                    setSelectedSuggestions([...selectedSuggestions, suggestion.title]);
                  }
                }}
              >
                {suggestion.title}
                <div className={clsx(
                  "absolute -top-2 -right-2 bg-[#293670] rounded-full p-1 text-white opacity-0 transition-opacity duration-75",
                  selectedSuggestions.includes(suggestion.title) && "opacity-100",
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <Link
            href={{ pathname: "/dashboard", query: { prompt } }}
            className={clsx(
              "absolute bottom-16 right-16 bg-[#293670] text-white text-xl rounded-lg py-3 px-6 transition duration-75",
              selectedSuggestions.length === 0 && "opacity-20 grayscale"
            )}
          >
            Suivant
          </Link>
        </div>
      ) : (
        <div className="min-h-svh flex flex-col items-center justify-center">
          <p className="font-medium text-xl text-yellow-900 bg-yellow-100 px-3 py-0.5 rounded mb-4">Votre aide administrative</p>
          <p className="font-medium text-5xl leading-tight max-w-[24ch] text-center pb-12">Bonjour, de quoi avez-vous besoin aujourd'hui ?</p>

          <div className="pl-3 flex w-full max-w-md mb-3 border-2 border-[#F3F3F3] rounded-md shadow-md shadow-[#00000008] overflow-hidden">
            <input
              type="text"
              placeholder="Posez moi une question"
              className="flex-1 outline-none"
              autoFocus
            />
            <div className="aspect-square flex-none p-1 h-fit flex items-center justify-center text-neutral-600">
              <button className="bg-[#293670] text-white p-1 rounded transition-colors duration-75 hover:bg-[#202a58]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-[#A8AAAC] text-sm">Tendances: <span className="text-[#858585]">permis, passeport, cantine, sport</span></p>

          <div className="grid grid-cols-4 gap-4 pt-24 max-w-5xl">
            <SuggestionCard
              suggestionCategory="passeport"
              title="Faire mon passeport"
              setSuggestionCategory={setSuggestionCategory}
            />
            <SuggestionCard
              suggestionCategory="demarches-administratives"
              title="Liste des démarches administratives"
              setSuggestionCategory={setSuggestionCategory}
            />
            <SuggestionCard
              suggestionCategory="enregistrer-enfant"
              title="Je souhaite enregistrer mon enfant"
              setSuggestionCategory={setSuggestionCategory}
            />
            <SuggestionCard
              suggestionCategory="inscrire-enfant"
              title="Inscrire mon enfant au centre de loisirs"
              setSuggestionCategory={setSuggestionCategory}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default page;
