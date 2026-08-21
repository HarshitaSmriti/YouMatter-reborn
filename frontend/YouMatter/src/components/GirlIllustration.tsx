function GirlIllustration() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 520 520"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* BACKGROUND CIRCLE */}
      <circle
        cx="260"
        cy="260"
        r="180"
        fill="#F1EAFE"
      />

      {/* LEFT LEAF */}
      <path
        d="M120 320C150 250 180 220 220 210C205 260 185 320 120 320Z"
        fill="#DCCFFF"
      />

      <path
        d="M150 360C170 300 200 270 240 260C225 320 210 360 150 360Z"
        fill="#E6DBFF"
      />

      {/* RIGHT LEAF */}
      <path
        d="M390 290C430 240 460 220 500 230C470 290 445 330 390 290Z"
        fill="#DDD0FF"
      />

      <path
        d="M360 340C400 290 430 260 470 270C445 340 420 370 360 340Z"
        fill="#E9E0FF"
      />

      {/* HAIR BACK */}
      <path
        d="M220 160C220 110 255 85 300 90C350 95 380 135 378 190C376 250 350 280 310 280C250 280 220 235 220 160Z"
        fill="#3F33A8"
      />

      {/* FACE */}
      <ellipse
        cx="295"
        cy="185"
        rx="42"
        ry="50"
        fill="#FFD8C7"
      />

      {/* NECK */}
      <rect
        x="280"
        y="225"
        width="24"
        height="30"
        rx="10"
        fill="#FFD8C7"
      />

      {/* BODY */}
      <path
        d="M210 290C220 245 250 230 295 230C340 230 365 250 375 290L390 370H190L210 290Z"
        fill="#B7A1FF"
      />

      {/* LEFT ARM */}
      <path
        d="M220 300C195 315 185 345 200 365C220 390 255 385 270 360L250 340C242 352 228 352 220 340C214 332 214 320 224 310L220 300Z"
        fill="#B7A1FF"
      />

      {/* RIGHT ARM */}
      <path
        d="M350 295C375 310 390 335 392 365C394 385 380 400 360 398C338 396 325 380 325 360L335 330C340 342 348 352 360 350C368 348 374 340 372 330C370 320 362 308 350 300V295Z"
        fill="#B7A1FF"
      />

      {/* HANDS */}
      <circle
        cx="258"
        cy="340"
        r="18"
        fill="#FFD8C7"
      />

      <circle
        cx="338"
        cy="350"
        r="18"
        fill="#FFD8C7"
      />

      {/* LEGS */}
      <path
        d="M210 380C150 405 120 440 130 470C140 495 180 500 220 485C265 468 285 435 270 405L210 380Z"
        fill="#453A9C"
      />

      <path
        d="M315 380C380 400 420 435 425 470C430 500 390 505 350 492C300 475 275 440 285 405L315 380Z"
        fill="#3B328F"
      />

      {/* FEET */}
      <ellipse
        cx="190"
        cy="485"
        rx="45"
        ry="16"
        fill="#FFF7EF"
      />

      <ellipse
        cx="350"
        cy="490"
        rx="45"
        ry="16"
        fill="#FFF7EF"
      />

      {/* HAIR FRONT */}
      <path
        d="M250 120C280 90 335 95 360 130C375 150 380 180 370 215C350 180 325 165 295 165C265 165 250 180 240 210C225 180 228 145 250 120Z"
        fill="#2F2780"
      />

      {/* EYES */}
      <path
        d="M275 188C280 193 285 193 290 188"
        stroke="#1F2937"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M305 188C310 193 315 193 320 188"
        stroke="#1F2937"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* SMILE */}
      <path
        d="M285 215C295 225 310 225 320 215"
        stroke="#1F2937"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default GirlIllustration;