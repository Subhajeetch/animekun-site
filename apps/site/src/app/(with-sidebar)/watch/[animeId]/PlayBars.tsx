'use client'

import React from 'react'

interface MusicBarsProps {
  className?: string
  barClassName?: string
}

export default function MusicBars({
  className = '',
  barClassName = '',
}: MusicBarsProps) {
  return (
    <>
      <style jsx>{`
        @keyframes music-bar {
          0%,
          100% {
            transform: scaleY(0.35);
          }
          25% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.5);
          }
          75% {
            transform: scaleY(0.8);
          }
        }
      `}</style>

      <div
        className={`flex items-end gap-1 h-5 text-primary ${className}`}
        aria-label="Playing"
      >
        <div
          className={`h-full w-1 bg-current origin-bottom animate-[music-bar_0.9s_ease-in-out_infinite] ${barClassName}`}
        />

        <div
          className={`h-full w-1 bg-current origin-bottom animate-[music-bar_1.2s_ease-in-out_infinite] ${barClassName}`}
        />

        <div
          className={`h-full w-1 bg-current origin-bottom animate-[music-bar_0.75s_ease-in-out_infinite] ${barClassName}`}
        />
      </div>
    </>
  )
}