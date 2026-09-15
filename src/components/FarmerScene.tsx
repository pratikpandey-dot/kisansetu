import { motion } from "framer-motion";

/**
 * Animated farmer scene — a layered SVG farm diorama:
 * rolling hills, drifting clouds, a rotating sun, swaying wheat,
 * and a farmer who waves at visitors.
 */
export function FarmerScene({ className = "" }: { className?: string }) {
  const stroke = "rgba(255,255,255,0.55)";
  return (
    <div className={`pointer-events-none relative ${className}`}>
      <svg
        viewBox="0 0 420 320"
        className="h-auto w-full drop-shadow-2xl"
        role="img"
        aria-hidden="true"
      >
        {/* ---------- sun ---------- */}
        <motion.g
          style={{ originX: "352px", originY: "56px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <motion.circle
            cx={352}
            cy={56}
            r={26}
            fill="#fbbf24"
            animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={i}
              x1={352}
              y1={16}
              x2={352}
              y2={24}
              stroke="#fcd34d"
              strokeWidth={3.5}
              strokeLinecap="round"
              transform={`rotate(${i * 45} 352 56)`}
            />
          ))}
        </motion.g>

        {/* ---------- clouds ---------- */}
        {(
          [
            { x: 40, y: 44, s: 1, d: 0 },
            { x: 250, y: 28, s: 0.7, d: 1.6 },
          ] as const
        ).map((c, i) => (
          <motion.g
            key={i}
            animate={{ x: [0, 26, 0] }}
            transition={{ duration: 14 + i * 4, repeat: Infinity, ease: "easeInOut", delay: c.d }}
            transform={`translate(${c.x} ${c.y}) scale(${c.s})`}
          >
            <g fill="rgba(255,255,255,0.16)">
              <ellipse cx={36} cy={16} rx={34} ry={14} />
              <ellipse cx={64} cy={22} rx={26} ry={11} />
              <ellipse cx={12} cy={24} rx={18} ry={9} />
            </g>
          </motion.g>
        ))}

        {/* ---------- birds ---------- */}
        <motion.path
          d="M60 84 q6 -7 12 0 q6 -7 12 0"
          stroke={stroke}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          animate={{ x: [0, 210, 0], y: [0, -14, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M96 66 q5 -6 10 0 q5 -6 10 0"
          stroke={stroke}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          animate={{ x: [0, -170, 0], y: [0, 10, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />

        {/* ---------- rolling hills ---------- */}
        <motion.ellipse
          cx={120}
          cy={300}
          rx={230}
          ry={64}
          fill="rgba(52,211,153,0.20)"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.ellipse
          cx={330}
          cy={312}
          rx={220}
          ry={58}
          fill="rgba(45,212,191,0.14)"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.ellipse
          cx={210}
          cy={330}
          rx={300}
          ry={62}
          fill="rgba(16,185,129,0.30)"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* ---------- farmhouse ---------- */}
        <motion.g
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* body */}
          <rect x={58} y={228} width={62} height={44} rx={4} fill="rgba(251,191,36,0.24)" />
          {/* roof */}
          <path d="M52 232 L89 202 L126 232 Z" fill="rgba(251,146,60,0.32)" />
          {/* door */}
          <rect x={82} y={248} width={14} height={24} rx={2} fill="rgba(255,255,255,0.35)" />
          {/* window */}
          <rect x={64} y={240} width={12} height={12} rx={2} fill="rgba(255,255,255,0.30)" />
          <motion.rect
            x={64}
            y={240}
            width={12}
            height={12}
            rx={2}
            fill="#fde68a"
            animate={{ opacity: [0, 0.55, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 2 }}
          />
        </motion.g>

        {/* ---------- wheat stalks ---------- */}
        {[
          { x: 268, h: 54, d: 0 },
          { x: 288, h: 66, d: 0.4 },
          { x: 308, h: 50, d: 0.9 },
          { x: 326, h: 60, d: 1.3 },
          { x: 176, h: 46, d: 0.2 },
          { x: 196, h: 56, d: 0.7 },
        ].map((w, i) => (
          <motion.g
            key={i}
            style={{ originX: `${w.x}px`, originY: "282px" }}
            animate={{ rotate: [-3.5, 3.5, -3.5] }}
            transition={{ duration: 3.4 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: w.d }}
          >
            <path
              d={`M${w.x} 282 C ${w.x - 3} ${282 - w.h * 0.5}, ${w.x + 3} ${282 - w.h * 0.75}, ${w.x} ${282 - w.h}`}
              stroke="rgba(253,230,138,0.85)"
              strokeWidth={2.2}
              fill="none"
              strokeLinecap="round"
            />
            {Array.from({ length: 4 }).map((_, k) => (
              <ellipse
                key={k}
                cx={w.x + (k % 2 === 0 ? 5 : -5)}
                cy={282 - w.h + 8 + k * 7}
                rx={4.6}
                ry={2.2}
                fill="rgba(253,224,71,0.75)"
                transform={`rotate(${k % 2 === 0 ? 38 : -38} ${w.x + (k % 2 === 0 ? 5 : -5)} ${282 - w.h + 8 + k * 7})`}
              />
            ))}
          </motion.g>
        ))}

        {/* ---------- the farmer ---------- */}
        <motion.g
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          transform="translate(232 218)"
        >
          {/* dhoti / legs */}
          <path d="M-11 52 L-6 66 M11 52 L6 66" stroke="rgba(255,255,255,0.75)" strokeWidth={5} strokeLinecap="round" />
          {/* kurta body */}
          <path d="M-14 16 L14 16 L17 54 L-17 54 Z" fill="#f5f5f4" />
          {/* sash */}
          <path d="M-16 24 L16 30" stroke="#fb923c" strokeWidth={5} strokeLinecap="round" />
          {/* arm (left, resting) */}
          <path d="M-14 22 C -22 32, -22 44, -16 52" stroke="#f5f5f4" strokeWidth={5} fill="none" strokeLinecap="round" />
          {/* waving arm */}
          <motion.g
            style={{ originX: "15px", originY: "22px" }}
            animate={{ rotate: [0, -32, 8, -32, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.6 }}
          >
            <path d="M15 22 C 26 16, 32 8, 34 0" stroke="#f5f5f4" strokeWidth={5} fill="none" strokeLinecap="round" />
            <motion.circle
              cx={34}
              cy={-3}
              r={4}
              fill="#fde68a"
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.6 }}
            />
          </motion.g>
          {/* head */}
          <circle cx={0} cy={2} r={10} fill="#fde68a" />
          {/* turban */}
          <path d="M-11 -1 C -11 -13, 11 -13, 11 -1 C 7 -7, -7 -7, -11 -1 Z" fill="#10b981" />
          <path d="M-9 -3 C -5 -12, 7 -12, 9 -4" stroke="#34d399" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          {/* smile */}
          <path d="M-3.5 5 Q 0 8.5, 3.5 5" stroke="#b45309" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          {/* eyes */}
          <circle cx={-3} cy={1.5} r={1.2} fill="#78350f" />
          <circle cx={3} cy={1.5} r={1.2} fill="#78350f" />
        </motion.g>
      </svg>
    </div>
  );
}
