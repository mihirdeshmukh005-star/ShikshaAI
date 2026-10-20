export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="11" fill="url(#eduLogoGrad)" />
      <path
        d="M20 11L31 15.6L20 20.2L9 15.6L20 11Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M13.5 17.6V23.3C13.5 24.9 16.3 27 20 27C23.7 27 26.5 24.9 26.5 23.3V17.6"
        stroke="white"
        strokeOpacity="0.95"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M30 16.5V22.2"
        stroke="white"
        strokeOpacity="0.75"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="30" cy="24" r="1.3" fill="white" fillOpacity="0.75" />
      <defs>
        <linearGradient id="eduLogoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6D3DF5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
