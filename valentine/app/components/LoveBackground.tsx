export default function LoveBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-red-300 to-purple-300"></div>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="heart-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <path
              d="M25 39.7l-.6-.5C11.5 28.7 8 25 8 19c0-5 4-9 9-9 4.1 0 6.4 2.3 8 4.1 1.6-1.8 3.9-4.1 8-4.1 5 0 9 4 9 9 0 6-3.5 9.7-16.4 20.2l-.6.5z"
              fill="rgba(255,255,255,0.1)"
            />
          </pattern>
        </defs>
        <rect fill="url(#heart-pattern)" width="100%" height="100%" />
      </svg>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 2 + 1}rem`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  )
}

