/**
 * Exercise Illustrations Module
 * Stylized minimal SVG stick figures for Phoenix Protocol exercises.
 * Each illustration is a monochrome orange (#F97316) figure on transparent bg,
 * optimized for display on dark (#0A0A0A) surfaces.
 */

const GLOW_FILTER = `
  <defs>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>`;

const S = '#F97316';   // primary stroke
const S2 = '#FB923C';  // secondary / arrows
const SW = '4';        // stroke width
const SWt = '3';       // thinner stroke
const LC = 'round';    // linecap
const LJ = 'round';   // linejoin

const illustrations = {

  /* ───────────────────── WARM-UP ───────────────────── */

  'neck-rotations': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Body standing -->
    <circle cx="100" cy="55" r="12" fill="${S}" opacity="0.9"/>
    <!-- Neck -->
    <line x1="100" y1="67" x2="100" y2="80" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Torso -->
    <line x1="100" y1="80" x2="100" y2="130" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms hanging -->
    <line x1="100" y1="90" x2="78" y2="118" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="90" x2="122" y2="118" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Legs -->
    <line x1="100" y1="130" x2="84" y2="170" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="130" x2="116" y2="170" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Feet -->
    <circle cx="84" cy="170" r="3" fill="${S}"/>
    <circle cx="116" cy="170" r="3" fill="${S}"/>
    <!-- Tilted head indicator - head shifted slightly -->
    <circle cx="100" cy="55" r="12" fill="none" stroke="${S2}" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.5"/>
    <!-- Rotation arrow around head -->
    <path d="M 82 45 A 22 22 0 1 1 85 70" fill="none" stroke="${S2}" stroke-width="2.5" stroke-linecap="${LC}" class="anim-rotate" opacity="0.8"/>
    <polygon points="83,71 89,68 84,63" fill="${S2}" opacity="0.8"/>
  </g>
</svg>`,

  'arm-circles': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Head -->
    <circle cx="100" cy="48" r="11" fill="${S}" opacity="0.9"/>
    <!-- Torso -->
    <line x1="100" y1="59" x2="100" y2="120" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms extended horizontally -->
    <line x1="100" y1="78" x2="48" y2="78" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="78" x2="152" y2="78" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Hand circles -->
    <circle cx="48" cy="78" r="3" fill="${S}"/>
    <circle cx="152" cy="78" r="3" fill="${S}"/>
    <!-- Legs -->
    <line x1="100" y1="120" x2="84" y2="168" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="120" x2="116" y2="168" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="84" cy="168" r="3" fill="${S}"/>
    <circle cx="116" cy="168" r="3" fill="${S}"/>
    <!-- Left rotation circle -->
    <circle cx="48" cy="78" r="18" fill="none" stroke="${S2}" stroke-width="2" stroke-dasharray="4 3" opacity="0.6" class="anim-rotate"/>
    <polygon points="60,63 55,58 52,65" fill="${S2}" opacity="0.7"/>
    <!-- Right rotation circle -->
    <circle cx="152" cy="78" r="18" fill="none" stroke="${S2}" stroke-width="2" stroke-dasharray="4 3" opacity="0.6" class="anim-rotate"/>
    <polygon points="164,63 159,58 156,65" fill="${S2}" opacity="0.7"/>
  </g>
</svg>`,

  'hip-rotations': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Head -->
    <circle cx="100" cy="42" r="11" fill="${S}" opacity="0.9"/>
    <!-- Torso -->
    <line x1="100" y1="53" x2="100" y2="115" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms on hips -->
    <path d="M 100 80 L 80 90 L 82 110" fill="none" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}" stroke-linejoin="${LJ}"/>
    <path d="M 100 80 L 120 90 L 118 110" fill="none" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}" stroke-linejoin="${LJ}"/>
    <!-- Elbow joints -->
    <circle cx="80" cy="90" r="3" fill="${S}"/>
    <circle cx="120" cy="90" r="3" fill="${S}"/>
    <!-- Hands on hips -->
    <circle cx="82" cy="110" r="3" fill="${S}"/>
    <circle cx="118" cy="110" r="3" fill="${S}"/>
    <!-- Legs -->
    <line x1="100" y1="115" x2="84" y2="168" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="115" x2="116" y2="168" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="84" cy="168" r="3" fill="${S}"/>
    <circle cx="116" cy="168" r="3" fill="${S}"/>
    <!-- Hip rotation circle -->
    <ellipse cx="100" cy="115" rx="26" ry="12" fill="none" stroke="${S2}" stroke-width="2.5" stroke-dasharray="5 3" opacity="0.7" class="anim-rotate"/>
    <polygon points="126,118 130,112 122,113" fill="${S2}" opacity="0.8"/>
  </g>
</svg>`,

  'jumping-jacks': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Head -->
    <circle cx="100" cy="35" r="12" fill="${S}" opacity="0.9"/>
    <!-- Torso -->
    <line x1="100" y1="47" x2="100" y2="110" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms raised in V -->
    <line x1="100" y1="65" x2="55" y2="30" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="65" x2="145" y2="30" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Hands -->
    <circle cx="55" cy="30" r="3" fill="${S}"/>
    <circle cx="145" cy="30" r="3" fill="${S}"/>
    <!-- Legs spread in inverted V -->
    <line x1="100" y1="110" x2="60" y2="175" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="110" x2="140" y2="175" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Feet -->
    <circle cx="60" cy="175" r="3" fill="${S}"/>
    <circle cx="140" cy="175" r="3" fill="${S}"/>
    <!-- Shoulder joints -->
    <circle cx="100" cy="65" r="3" fill="${S}"/>
    <!-- Hip joint -->
    <circle cx="100" cy="110" r="3" fill="${S}"/>
    <!-- Energy lines -->
    <line x1="48" y1="25" x2="42" y2="18" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.5"/>
    <line x1="152" y1="25" x2="158" y2="18" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.5"/>
    <line x1="55" y1="178" x2="48" y2="185" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.5"/>
    <line x1="145" y1="178" x2="152" y2="185" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.5"/>
  </g>
</svg>`,

  'spot-march': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Head -->
    <circle cx="100" cy="38" r="11" fill="${S}" opacity="0.9"/>
    <!-- Torso -->
    <line x1="100" y1="49" x2="100" y2="110" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Left arm swinging back -->
    <line x1="100" y1="68" x2="120" y2="95" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="120" y1="95" x2="125" y2="108" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="120" cy="95" r="3" fill="${S}"/>
    <!-- Right arm swinging forward -->
    <line x1="100" y1="68" x2="75" y2="80" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="75" y1="80" x2="72" y2="68" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="75" cy="80" r="3" fill="${S}"/>
    <!-- Standing leg (right) -->
    <line x1="100" y1="110" x2="110" y2="170" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="110" cy="170" r="3" fill="${S}"/>
    <!-- Raised knee (left) - HIGH -->
    <line x1="100" y1="110" x2="82" y2="110" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="82" y1="110" x2="78" y2="140" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Knee joint -->
    <circle cx="82" cy="110" r="3" fill="${S}"/>
    <!-- Raised foot -->
    <circle cx="78" cy="140" r="3" fill="${S}"/>
    <!-- Upward indicator arrow for knee -->
    <line x1="68" y1="120" x2="68" y2="100" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.6"/>
    <polygon points="68,96 63,104 73,104" fill="${S2}" opacity="0.6"/>
  </g>
</svg>`,

  /* ───────────────────── PHASE 1 ───────────────────── */

  'incline-pushups': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Elevated surface (box) -->
    <rect x="20" y="100" width="40" height="30" rx="4" fill="none" stroke="${S}" stroke-width="2.5" opacity="0.5"/>
    <!-- Head -->
    <circle cx="48" cy="82" r="10" fill="${S}" opacity="0.9"/>
    <!-- Torso at angle from hands on box to feet on ground -->
    <line x1="48" y1="92" x2="42" y2="100" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Body line angled -->
    <line x1="42" y1="100" x2="160" y2="140" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms on box -->
    <line x1="42" y1="100" x2="35" y2="100" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="42" y1="100" x2="50" y2="100" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="35" cy="100" r="3" fill="${S}"/>
    <circle cx="50" cy="100" r="3" fill="${S}"/>
    <!-- Hip joint -->
    <circle cx="110" cy="124" r="3" fill="${S}"/>
    <!-- Legs to ground -->
    <line x1="160" y1="140" x2="170" y2="165" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="170" cy="165" r="3" fill="${S}"/>
    <!-- Foot flat -->
    <line x1="170" y1="165" x2="180" y2="165" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <!-- Ground line -->
    <line x1="15" y1="170" x2="190" y2="170" stroke="${S}" stroke-width="1.5" opacity="0.2"/>
  </g>
</svg>`,

  'dead-hangs': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Pull-up bar -->
    <line x1="50" y1="22" x2="150" y2="22" stroke="${S}" stroke-width="5" stroke-linecap="${LC}" opacity="0.6"/>
    <!-- Bar mounts -->
    <line x1="50" y1="12" x2="50" y2="22" stroke="${S}" stroke-width="3" opacity="0.4"/>
    <line x1="150" y1="12" x2="150" y2="22" stroke="${S}" stroke-width="3" opacity="0.4"/>
    <!-- Hands gripping bar -->
    <circle cx="88" cy="22" r="4" fill="${S}"/>
    <circle cx="112" cy="22" r="4" fill="${S}"/>
    <!-- Arms extended up -->
    <line x1="88" y1="26" x2="92" y2="60" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="112" y1="26" x2="108" y2="60" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Shoulders -->
    <circle cx="92" cy="60" r="3" fill="${S}"/>
    <circle cx="108" cy="60" r="3" fill="${S}"/>
    <!-- Head -->
    <circle cx="100" cy="72" r="11" fill="${S}" opacity="0.9"/>
    <!-- Shoulder line -->
    <line x1="92" y1="60" x2="108" y2="60" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Torso hanging -->
    <line x1="100" y1="60" x2="100" y2="130" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Legs hanging straight -->
    <line x1="100" y1="130" x2="92" y2="180" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="130" x2="108" y2="180" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="92" cy="180" r="3" fill="${S}"/>
    <circle cx="108" cy="180" r="3" fill="${S}"/>
    <!-- Downward arrow showing gravity / hang -->
    <line x1="100" y1="148" x2="100" y2="160" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.4" stroke-dasharray="3 2"/>
  </g>
</svg>`,

  'squats': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Head -->
    <circle cx="100" cy="52" r="11" fill="${S}" opacity="0.9"/>
    <!-- Torso (slightly forward lean) -->
    <line x1="100" y1="63" x2="95" y2="110" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms forward for balance -->
    <line x1="100" y1="78" x2="130" y2="72" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="130" y1="72" x2="148" y2="70" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="130" cy="72" r="2.5" fill="${S}"/>
    <circle cx="148" cy="70" r="3" fill="${S}"/>
    <!-- Hip joint -->
    <circle cx="95" cy="110" r="3" fill="${S}"/>
    <!-- Thighs parallel-ish (deep squat) -->
    <line x1="95" y1="110" x2="70" y2="120" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="95" y1="110" x2="120" y2="120" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Knees -->
    <circle cx="70" cy="120" r="3" fill="${S}"/>
    <circle cx="120" cy="120" r="3" fill="${S}"/>
    <!-- Shins down to feet -->
    <line x1="70" y1="120" x2="75" y2="165" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="120" y1="120" x2="115" y2="165" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Feet -->
    <line x1="65" y1="165" x2="85" y2="165" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <line x1="105" y1="165" x2="125" y2="165" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <!-- Ground -->
    <line x1="40" y1="170" x2="160" y2="170" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
  </g>
</svg>`,

  'glute-bridges': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Ground line -->
    <line x1="15" y1="155" x2="185" y2="155" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
    <!-- Head on ground -->
    <circle cx="35" cy="140" r="10" fill="${S}" opacity="0.9"/>
    <!-- Upper back/shoulders on ground -->
    <line x1="45" y1="140" x2="60" y2="150" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Torso raised (bridge) -->
    <line x1="60" y1="150" x2="110" y2="105" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Hip at top of bridge -->
    <circle cx="110" cy="105" r="3" fill="${S}"/>
    <!-- Thighs angled down -->
    <line x1="110" y1="105" x2="140" y2="125" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Knees -->
    <circle cx="140" cy="125" r="3" fill="${S}"/>
    <!-- Shins to feet on ground -->
    <line x1="140" y1="125" x2="148" y2="150" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Feet flat -->
    <line x1="140" y1="150" x2="155" y2="150" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <!-- Arms flat on ground -->
    <line x1="55" y1="145" x2="40" y2="155" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <line x1="65" y1="148" x2="75" y2="155" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <!-- Upward arrow at hip showing thrust -->
    <line x1="110" y1="100" x2="110" y2="82" stroke="${S2}" stroke-width="2.5" stroke-linecap="${LC}" opacity="0.7"/>
    <polygon points="110,78 105,86 115,86" fill="${S2}" opacity="0.7"/>
  </g>
</svg>`,

  'plank': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Ground line -->
    <line x1="10" y1="155" x2="190" y2="155" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
    <!-- Head -->
    <circle cx="42" cy="100" r="10" fill="${S}" opacity="0.9"/>
    <!-- Forearms on ground -->
    <line x1="52" y1="105" x2="58" y2="130" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="58" y1="130" x2="75" y2="148" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Elbow -->
    <circle cx="58" cy="130" r="3" fill="${S}"/>
    <!-- Forearm flat on ground -->
    <line x1="58" y1="148" x2="35" y2="148" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <!-- Body straight line from shoulders to hips -->
    <line x1="58" y1="130" x2="155" y2="120" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Core/hip -->
    <circle cx="110" cy="124" r="3" fill="${S}"/>
    <!-- Hips to feet -->
    <line x1="155" y1="120" x2="170" y2="150" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Toes on ground -->
    <circle cx="170" cy="150" r="3" fill="${S}"/>
    <!-- Straight line indicator -->
    <line x1="50" y1="118" x2="162" y2="110" stroke="${S2}" stroke-width="1" stroke-dasharray="5 4" opacity="0.35"/>
  </g>
</svg>`,

  'childs-pose': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Ground line -->
    <line x1="10" y1="155" x2="190" y2="155" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
    <!-- Head down near ground -->
    <circle cx="55" cy="130" r="10" fill="${S}" opacity="0.9"/>
    <!-- Arms extended forward on ground -->
    <line x1="55" y1="128" x2="25" y2="140" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="25" y1="140" x2="18" y2="148" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <circle cx="18" cy="148" r="2.5" fill="${S}"/>
    <!-- Back curled over knees -->
    <path d="M 62 125 Q 90 100 120 120" fill="none" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Hips high, knees tucked -->
    <circle cx="120" cy="120" r="3" fill="${S}"/>
    <!-- Thighs folded under -->
    <line x1="120" y1="120" x2="130" y2="145" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Knees on ground -->
    <circle cx="130" cy="145" r="3" fill="${S}"/>
    <!-- Shins on ground -->
    <line x1="130" y1="145" x2="155" y2="150" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Feet -->
    <circle cx="155" cy="150" r="2.5" fill="${S}"/>
    <!-- Relaxation waves -->
    <path d="M 80 90 Q 85 86 90 90" fill="none" stroke="${S2}" stroke-width="1.5" opacity="0.3"/>
    <path d="M 85 82 Q 90 78 95 82" fill="none" stroke="${S2}" stroke-width="1.5" opacity="0.25"/>
  </g>
</svg>`,

  /* ───────────────────── PHASE 2 ───────────────────── */

  'pushups': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Ground line -->
    <line x1="10" y1="155" x2="190" y2="155" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
    <!-- Head low (bottom of pushup) -->
    <circle cx="42" cy="118" r="10" fill="${S}" opacity="0.9"/>
    <!-- Body nearly parallel to ground, low -->
    <line x1="52" y1="120" x2="160" y2="125" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms bent at elbow (low position) -->
    <line x1="60" y1="120" x2="58" y2="140" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="58" y1="140" x2="55" y2="150" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="58" cy="140" r="3" fill="${S}"/>
    <circle cx="55" cy="150" r="2.5" fill="${S}"/>
    <!-- Core -->
    <circle cx="110" cy="122" r="3" fill="${S}"/>
    <!-- Legs -->
    <line x1="160" y1="125" x2="172" y2="148" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="172" cy="148" r="3" fill="${S}"/>
    <!-- Toes -->
    <line x1="172" y1="148" x2="180" y2="150" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <!-- Down arrow showing low position -->
    <line x1="42" y1="100" x2="42" y2="108" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.5"/>
    <polygon points="42,112 38,105 46,105" fill="${S2}" opacity="0.5"/>
  </g>
</svg>`,

  'negative-pullups': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Pull-up bar -->
    <line x1="45" y1="25" x2="155" y2="25" stroke="${S}" stroke-width="5" stroke-linecap="${LC}" opacity="0.6"/>
    <!-- Bar mounts -->
    <line x1="45" y1="15" x2="45" y2="25" stroke="${S}" stroke-width="3" opacity="0.4"/>
    <line x1="155" y1="15" x2="155" y2="25" stroke="${S}" stroke-width="3" opacity="0.4"/>
    <!-- Hands gripping bar -->
    <circle cx="85" cy="25" r="4" fill="${S}"/>
    <circle cx="115" cy="25" r="4" fill="${S}"/>
    <!-- Arms bent (chin above bar) -->
    <line x1="85" y1="29" x2="88" y2="48" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="115" y1="29" x2="112" y2="48" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Elbows -->
    <circle cx="88" cy="48" r="3" fill="${S}"/>
    <circle cx="112" cy="48" r="3" fill="${S}"/>
    <!-- Head (chin above bar level) -->
    <circle cx="100" cy="20" r="10" fill="${S}" opacity="0.9"/>
    <!-- Shoulders -->
    <line x1="88" y1="48" x2="112" y2="48" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Torso -->
    <line x1="100" y1="48" x2="100" y2="115" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Legs -->
    <line x1="100" y1="115" x2="92" y2="168" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="115" x2="108" y2="168" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="92" cy="168" r="3" fill="${S}"/>
    <circle cx="108" cy="168" r="3" fill="${S}"/>
    <!-- Downward arrow showing negative/lowering -->
    <line x1="135" y1="60" x2="135" y2="95" stroke="${S2}" stroke-width="2.5" stroke-linecap="${LC}" opacity="0.7"/>
    <polygon points="135,100 130,90 140,90" fill="${S2}" opacity="0.7"/>
    <!-- Second arrow -->
    <line x1="65" y1="60" x2="65" y2="95" stroke="${S2}" stroke-width="2.5" stroke-linecap="${LC}" opacity="0.7"/>
    <polygon points="65,100 60,90 70,90" fill="${S2}" opacity="0.7"/>
  </g>
</svg>`,

  'reverse-lunges': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Ground line -->
    <line x1="15" y1="175" x2="185" y2="175" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
    <!-- Head -->
    <circle cx="95" cy="35" r="11" fill="${S}" opacity="0.9"/>
    <!-- Torso upright -->
    <line x1="95" y1="46" x2="95" y2="105" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms at sides -->
    <line x1="95" y1="62" x2="80" y2="90" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <line x1="95" y1="62" x2="110" y2="90" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <circle cx="80" cy="90" r="2.5" fill="${S}"/>
    <circle cx="110" cy="90" r="2.5" fill="${S}"/>
    <!-- Hip -->
    <circle cx="95" cy="105" r="3" fill="${S}"/>
    <!-- Front leg bent 90° -->
    <line x1="95" y1="105" x2="80" y2="135" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="80" cy="135" r="3" fill="${S}"/>
    <line x1="80" y1="135" x2="82" y2="170" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="72" y1="170" x2="90" y2="170" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <!-- Back leg extended behind -->
    <line x1="95" y1="105" x2="135" y2="130" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="135" cy="130" r="3" fill="${S}"/>
    <line x1="135" y1="130" x2="155" y2="165" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Back knee near ground -->
    <circle cx="155" cy="165" r="3" fill="${S}"/>
    <!-- Dashed line showing back knee near ground -->
    <line x1="150" y1="170" x2="160" y2="170" stroke="${S2}" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.4"/>
  </g>
</svg>`,

  'plank-shoulder-tap': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Ground line -->
    <line x1="10" y1="155" x2="190" y2="155" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
    <!-- Head -->
    <circle cx="45" cy="88" r="10" fill="${S}" opacity="0.9"/>
    <!-- Body straight (high plank) -->
    <line x1="55" y1="92" x2="162" y2="110" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Supporting arm (left, straight down) -->
    <line x1="62" y1="95" x2="60" y2="148" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="60" cy="148" r="3" fill="${S}"/>
    <!-- Tapping arm (right, crossing to left shoulder) -->
    <line x1="70" y1="95" x2="85" y2="80" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="85" y1="80" x2="58" y2="88" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="85" cy="80" r="3" fill="${S}"/>
    <!-- Hand on opposite shoulder -->
    <circle cx="58" cy="88" r="3.5" fill="${S2}" opacity="0.8"/>
    <!-- Core -->
    <circle cx="115" cy="103" r="3" fill="${S}"/>
    <!-- Legs -->
    <line x1="162" y1="110" x2="172" y2="148" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="172" cy="148" r="3" fill="${S}"/>
    <!-- Tap indicator arc -->
    <path d="M 82 72 Q 70 68 60 80" fill="none" stroke="${S2}" stroke-width="2" stroke-dasharray="3 2" opacity="0.5"/>
  </g>
</svg>`,

  'toe-touch': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Ground line -->
    <line x1="30" y1="175" x2="170" y2="175" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
    <!-- Head (low, facing down) -->
    <circle cx="82" cy="110" r="10" fill="${S}" opacity="0.9"/>
    <!-- Torso bending forward from hips -->
    <line x1="88" y1="105" x2="115" y2="70" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Hips -->
    <circle cx="115" cy="70" r="3" fill="${S}"/>
    <!-- Legs straight -->
    <line x1="115" y1="70" x2="105" y2="130" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="115" y1="70" x2="125" y2="130" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Knees -->
    <circle cx="105" cy="130" r="2.5" fill="${S}"/>
    <circle cx="125" cy="130" r="2.5" fill="${S}"/>
    <!-- Shins -->
    <line x1="105" y1="130" x2="100" y2="170" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="125" y1="130" x2="120" y2="170" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Feet -->
    <line x1="90" y1="170" x2="108" y2="170" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <line x1="112" y1="170" x2="130" y2="170" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <!-- Arms reaching down to toes -->
    <line x1="95" y1="95" x2="78" y2="130" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="78" y1="130" x2="100" y2="168" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="78" cy="130" r="2.5" fill="${S}"/>
    <!-- Fingertips near toes -->
    <circle cx="100" cy="168" r="3" fill="${S2}" opacity="0.8"/>
  </g>
</svg>`,

  'cobra-stretch': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Ground line -->
    <line x1="10" y1="165" x2="190" y2="165" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
    <!-- Head looking up -->
    <circle cx="65" cy="72" r="10" fill="${S}" opacity="0.9"/>
    <!-- Neck arching up -->
    <line x1="65" y1="82" x2="68" y2="95" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Upper body pushed up, back arched -->
    <path d="M 68 95 Q 90 105 120 140 Q 140 152 170 158" fill="none" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms pushing up from ground -->
    <line x1="75" y1="100" x2="82" y2="130" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="82" y1="130" x2="80" y2="155" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="82" cy="130" r="3" fill="${S}"/>
    <circle cx="80" cy="155" r="2.5" fill="${S}"/>
    <!-- Second arm -->
    <line x1="72" y1="98" x2="60" y2="128" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="60" y1="128" x2="58" y2="155" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="60" cy="128" r="3" fill="${S}"/>
    <circle cx="58" cy="155" r="2.5" fill="${S}"/>
    <!-- Hips on ground -->
    <circle cx="130" cy="148" r="3" fill="${S}"/>
    <!-- Legs flat on ground -->
    <line x1="170" y1="158" x2="185" y2="160" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="185" cy="160" r="2.5" fill="${S}"/>
    <!-- Upward arch arrows -->
    <path d="M 55 65 Q 50 55 55 48" fill="none" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.5"/>
    <polygon points="55,45 51,52 59,52" fill="${S2}" opacity="0.5"/>
  </g>
</svg>`,

  /* ───────────────────── PHASE 3 ───────────────────── */

  'chin-ups': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Pull-up bar -->
    <line x1="45" y1="22" x2="155" y2="22" stroke="${S}" stroke-width="5" stroke-linecap="${LC}" opacity="0.6"/>
    <line x1="45" y1="12" x2="45" y2="22" stroke="${S}" stroke-width="3" opacity="0.4"/>
    <line x1="155" y1="12" x2="155" y2="22" stroke="${S}" stroke-width="3" opacity="0.4"/>
    <!-- Hands gripping bar - UNDERHAND (palms facing in, closer grip) -->
    <circle cx="90" cy="22" r="4" fill="${S}"/>
    <circle cx="110" cy="22" r="4" fill="${S}"/>
    <!-- Underhand grip indicators -->
    <path d="M 87 20 Q 86 25 90 26" fill="none" stroke="${S2}" stroke-width="1.5" opacity="0.6"/>
    <path d="M 113 20 Q 114 25 110 26" fill="none" stroke="${S2}" stroke-width="1.5" opacity="0.6"/>
    <!-- Arms bent (pulling up) -->
    <line x1="90" y1="26" x2="90" y2="50" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="110" y1="26" x2="110" y2="50" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Elbows -->
    <circle cx="90" cy="50" r="3" fill="${S}"/>
    <circle cx="110" cy="50" r="3" fill="${S}"/>
    <!-- Head at bar level -->
    <circle cx="100" cy="22" r="10" fill="${S}" opacity="0.9"/>
    <!-- Shoulders -->
    <line x1="90" y1="50" x2="110" y2="50" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Torso -->
    <line x1="100" y1="50" x2="100" y2="118" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Legs slightly bent -->
    <line x1="100" y1="118" x2="90" y2="155" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="118" x2="110" y2="155" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="90" cy="155" r="3" fill="${S}"/>
    <circle cx="110" cy="155" r="3" fill="${S}"/>
    <!-- Crossed feet -->
    <line x1="90" y1="155" x2="95" y2="170" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <line x1="110" y1="155" x2="105" y2="170" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <!-- Upward arrows showing pull -->
    <line x1="135" y1="70" x2="135" y2="42" stroke="${S2}" stroke-width="2.5" stroke-linecap="${LC}" opacity="0.6"/>
    <polygon points="135,38 130,46 140,46" fill="${S2}" opacity="0.6"/>
  </g>
</svg>`,

  'squat-jumps': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Head -->
    <circle cx="100" cy="48" r="11" fill="${S}" opacity="0.9"/>
    <!-- Torso slightly forward -->
    <line x1="100" y1="59" x2="96" y2="105" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms swinging down/back for jump -->
    <line x1="100" y1="72" x2="125" y2="95" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="125" y1="95" x2="135" y2="105" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <circle cx="125" cy="95" r="2.5" fill="${S}"/>
    <line x1="100" y1="72" x2="75" y2="95" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="75" y1="95" x2="65" y2="105" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <circle cx="75" cy="95" r="2.5" fill="${S}"/>
    <!-- Hip -->
    <circle cx="96" cy="105" r="3" fill="${S}"/>
    <!-- Squat position - legs bent -->
    <line x1="96" y1="105" x2="75" y2="118" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="96" y1="105" x2="118" y2="118" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="75" cy="118" r="3" fill="${S}"/>
    <circle cx="118" cy="118" r="3" fill="${S}"/>
    <line x1="75" y1="118" x2="78" y2="155" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="118" y1="118" x2="115" y2="155" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Feet -->
    <line x1="68" y1="155" x2="88" y2="155" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <line x1="105" y1="155" x2="125" y2="155" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <!-- Jump arrows going UP -->
    <line x1="100" y1="38" x2="100" y2="18" stroke="${S2}" stroke-width="3" stroke-linecap="${LC}" opacity="0.8"/>
    <polygon points="100,12 94,22 106,22" fill="${S2}" opacity="0.8"/>
    <!-- Side arrows -->
    <line x1="80" y1="42" x2="75" y2="25" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.5"/>
    <polygon points="74,21 70,29 80,28" fill="${S2}" opacity="0.5"/>
    <line x1="120" y1="42" x2="125" y2="25" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.5"/>
    <polygon points="126,21 120,28 130,29" fill="${S2}" opacity="0.5"/>
    <!-- Ground -->
    <line x1="45" y1="160" x2="155" y2="160" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
  </g>
</svg>`,

  'mountain-climbers': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Ground line -->
    <line x1="10" y1="162" x2="190" y2="162" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
    <!-- Head -->
    <circle cx="42" cy="80" r="10" fill="${S}" opacity="0.9"/>
    <!-- Arms straight down (high plank) -->
    <line x1="52" y1="85" x2="55" y2="95" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="55" y1="95" x2="52" y2="150" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="52" cy="150" r="3" fill="${S}"/>
    <!-- Body angled -->
    <line x1="55" y1="95" x2="145" y2="118" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Hip -->
    <circle cx="120" cy="112" r="3" fill="${S}"/>
    <!-- Driving knee forward toward chest -->
    <line x1="120" y1="112" x2="82" y2="115" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="82" cy="115" r="3" fill="${S}"/>
    <line x1="82" y1="115" x2="78" y2="135" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="78" cy="135" r="2.5" fill="${S}"/>
    <!-- Extended back leg -->
    <line x1="145" y1="118" x2="170" y2="150" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="170" cy="150" r="3" fill="${S}"/>
    <!-- Forward arrow for driving knee -->
    <line x1="90" y1="108" x2="70" y2="105" stroke="${S2}" stroke-width="2.5" stroke-linecap="${LC}" opacity="0.7"/>
    <polygon points="66,105 74,100 74,110" fill="${S2}" opacity="0.7"/>
  </g>
</svg>`,

  'leg-raises': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Ground line -->
    <line x1="10" y1="150" x2="190" y2="150" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
    <!-- Head on ground -->
    <circle cx="35" cy="135" r="10" fill="${S}" opacity="0.9"/>
    <!-- Torso flat on ground -->
    <line x1="45" y1="138" x2="115" y2="142" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms at sides flat on ground -->
    <line x1="55" y1="138" x2="45" y2="148" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <line x1="70" y1="139" x2="65" y2="148" stroke="${S}" stroke-width="${SWt}" stroke-linecap="${LC}"/>
    <circle cx="45" cy="148" r="2" fill="${S}"/>
    <circle cx="65" cy="148" r="2" fill="${S}"/>
    <!-- Hip -->
    <circle cx="115" cy="142" r="3" fill="${S}"/>
    <!-- Legs raised at ~45 degrees -->
    <line x1="115" y1="142" x2="155" y2="88" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="115" y1="142" x2="160" y2="95" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Feet together pointing up -->
    <circle cx="155" cy="88" r="3" fill="${S}"/>
    <circle cx="160" cy="95" r="3" fill="${S}"/>
    <!-- Upward arc arrow showing lift -->
    <path d="M 170 140 A 40 40 0 0 1 165 80" fill="none" stroke="${S2}" stroke-width="2.5" stroke-linecap="${LC}" opacity="0.6"/>
    <polygon points="163,76 159,84 169,83" fill="${S2}" opacity="0.6"/>
    <!-- Angle indicator -->
    <line x1="115" y1="142" x2="145" y2="142" stroke="${S2}" stroke-width="1" stroke-dasharray="3 3" opacity="0.3"/>
  </g>
</svg>`,

  'full-body-stretch': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Ground line -->
    <line x1="30" y1="180" x2="170" y2="180" stroke="${S}" stroke-width="1.5" opacity="0.15"/>
    <!-- Head -->
    <circle cx="100" cy="28" r="11" fill="${S}" opacity="0.9"/>
    <!-- Torso -->
    <line x1="100" y1="39" x2="100" y2="108" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms raised high overhead, slightly spread -->
    <line x1="100" y1="55" x2="72" y2="22" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="55" x2="128" y2="22" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Fingertips -->
    <circle cx="72" cy="22" r="3" fill="${S}"/>
    <circle cx="128" cy="22" r="3" fill="${S}"/>
    <!-- Shoulder joints -->
    <circle cx="100" cy="55" r="3" fill="${S}"/>
    <!-- Hip -->
    <circle cx="100" cy="108" r="3" fill="${S}"/>
    <!-- Legs wide stance -->
    <line x1="100" y1="108" x2="65" y2="175" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="108" x2="135" y2="175" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Feet -->
    <circle cx="65" cy="175" r="3" fill="${S}"/>
    <circle cx="135" cy="175" r="3" fill="${S}"/>
    <!-- Stretch lines radiating outward -->
    <line x1="66" y1="18" x2="60" y2="10" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.4"/>
    <line x1="134" y1="18" x2="140" y2="10" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.4"/>
    <line x1="100" y1="16" x2="100" y2="8" stroke="${S2}" stroke-width="2" stroke-linecap="${LC}" opacity="0.4"/>
    <!-- Side stretch indicators -->
    <line x1="57" y1="178" x2="50" y2="182" stroke="${S2}" stroke-width="1.5" stroke-linecap="${LC}" opacity="0.35"/>
    <line x1="143" y1="178" x2="150" y2="182" stroke="${S2}" stroke-width="1.5" stroke-linecap="${LC}" opacity="0.35"/>
  </g>
</svg>`,

  /* ───────────────────── DEFAULT FALLBACK ───────────────────── */

  'default': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  ${GLOW_FILTER}
  <g filter="url(#glow)">
    <!-- Head -->
    <circle cx="100" cy="42" r="12" fill="${S}" opacity="0.9"/>
    <!-- Torso -->
    <line x1="100" y1="54" x2="100" y2="115" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Arms slightly out, relaxed -->
    <line x1="100" y1="72" x2="68" y2="100" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="72" x2="132" y2="100" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <circle cx="68" cy="100" r="3" fill="${S}"/>
    <circle cx="132" cy="100" r="3" fill="${S}"/>
    <!-- Hip -->
    <circle cx="100" cy="115" r="3" fill="${S}"/>
    <!-- Legs -->
    <line x1="100" y1="115" x2="82" y2="170" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <line x1="100" y1="115" x2="118" y2="170" stroke="${S}" stroke-width="${SW}" stroke-linecap="${LC}"/>
    <!-- Feet -->
    <circle cx="82" cy="170" r="3" fill="${S}"/>
    <circle cx="118" cy="170" r="3" fill="${S}"/>
    <!-- Subtle energy ring -->
    <circle cx="100" cy="105" r="45" fill="none" stroke="${S2}" stroke-width="1" stroke-dasharray="6 4" opacity="0.2" class="anim-rotate"/>
  </g>
</svg>`
};

/**
 * Get SVG illustration string for an exercise by key.
 * Falls back to the default generic figure if key is not found.
 * @param {string} key - Exercise identifier (e.g. 'pushups', 'squats')
 * @returns {string} SVG markup string
 */
export function getExerciseIllustration(key) {
  return illustrations[key] || illustrations['default'];
}

/**
 * Get all available illustration keys.
 * @returns {string[]}
 */
export function getAvailableIllustrations() {
  return Object.keys(illustrations).filter(k => k !== 'default');
}

export default illustrations;
