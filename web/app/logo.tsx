import React from 'react';

export function Logo({ className = "w-8 h-8" }) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="nexusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" className="text-blue-500" />
                    <stop offset="100%" stopColor="currentColor" className="text-indigo-600" />
                </linearGradient>
            </defs>
            <path
                d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z"
                stroke="url(#nexusGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-[spin_10s_linear_infinite]"
            />
            <circle cx="50" cy="50" r="15" fill="url(#nexusGradient)" className="animate-pulse" />
            <path
                d="M50 10 L50 35 M90 30 L65 42 M90 70 L65 58 M50 90 L50 65 M10 70 L35 58 M10 30 L35 42"
                stroke="url(#nexusGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.5"
            />
        </svg>
    );
}
