import MacadamyLogo from '@/images/Logo.png';

export function Logo() {
  return (
    <div className="flex items-center gap-3 shrink-0">
      {/* circular logo image */}
      <div className="relative w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] md:w-[125px] md:h-[125px] shrink-0">
        <img
          src={MacadamyLogo}
          alt="Macadamy Logo"
          className="w-full h-full rounded-full object-cover"
          width={125}
          height={125}
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/15 to-transparent blur-sm pointer-events-none" />
      </div>

      {/* word-mark */}
      <span
        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight"
        style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        Macadamy
      </span>
    </div>
  );
}
