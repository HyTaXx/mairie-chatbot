import Link from "next/link";

interface SuggestionCardProps {
  title: string;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ title }) => {
  return (
    <Link
      href="/"
      className="relative group border-2 border-[#F3F3F3] rounded-xl p-4 shadow-md shadow-[#00000008] flex flex-col justify-between hover:border-[#293670] transition-colors duration-75"
    >
      <div>
        <button className="flex items-center justify-center w-6 h-6 rounded border border-[#F3F3F3]">
          <span className="text-[#454545] font-medium">?</span>
        </button>
        <p className="mt-4">{title}</p>
      </div>
      <button className="ml-auto mt-4 flex items-center justify-center w-6 h-6 rounded text-[#454545] hover:bg-[#F3F3F3]">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pin rotate-45"><path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" /></svg>
      </button>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="opacity-0 group-hover:opacity-100 size-6 bg-[#293670] text-white p-1 rounded absolute right-0 top-0 m-4 transition-opacity duration-75"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
      </svg>

    </Link>
  )
}