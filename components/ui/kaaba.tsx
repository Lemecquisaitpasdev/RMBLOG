"use client"

// AsciiArt — "kaaba", made with the 21st ASCII editor and baked
// to its exact rendered output (looping video + poster). Zero dependencies:
// one <video> that fills its parent. Drop it behind or inside your content:
// <div className="relative h-96"><AsciiArt className="absolute inset-0" /></div>
// Remix the source recipe (styles, animation, palette) in the editor:
// https://21st.dev/community/ascii/editor?from=88174e06-a334-4ee1-84a7-3580bf087e46
export function AsciiArt({ className }: { className?: string }) {
  return (
    <video
      className={className}
      src={"https://assets.21st.dev/ascii-recipes/videos/user_3HWgY0RrtQiIqDokUq9WmLv9fvG/3ff83449-2e0b-4322-ae4e-533e6ae1bd95.mp4"}
      poster={"https://assets.21st.dev/ascii-recipes/thumbnails/user_3HWgY0RrtQiIqDokUq9WmLv9fvG/4e8e1a36-31b8-4920-9bee-2ae6ee285cd0.webp"}
      autoPlay
      loop
      muted
      playsInline
      aria-label={"kaaba — animated ASCII art"}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  )
}
