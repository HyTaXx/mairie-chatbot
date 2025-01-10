import { SuggestionCard } from "@/components/SuggestionCard";
import React from "react";

const page = () => {
  return (
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
        <SuggestionCard title="Faire mon passeport" />
        <SuggestionCard title="Liste des démarches administratives" />
        <SuggestionCard title="Je souhaite enregistrer mon enfant" />
        <SuggestionCard title="Inscrire mon enfant au centre de loisirs" />
      </div>
    </div>
  );
};

export default page;
