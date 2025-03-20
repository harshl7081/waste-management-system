'use client';

import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="relative w-10 h-10">
        {/* Main recycling symbol */}
        <svg
          className="absolute inset-0 w-full h-full text-green-600"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 19L12 14M12 14L17 19M12 14V22M17 5L12 10M12 10L7 5M12 10V2M5 7L10 12M10 12L5 17M10 12H2M19 17L14 12M14 12L19 7M14 12H22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="text-green-500"
            d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"
            fill="currentColor"
          />
        </svg>
        {/* Leaf accent */}
        <svg
          className="absolute -top-1 -right-1 w-4 h-4 text-green-500"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-green-600 leading-none">
          WasteSmart
        </span>
        <span className="text-xs text-green-500 font-medium">
          Sustainable Solutions
        </span>
      </div>
    </Link>
  );
} 