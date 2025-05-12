import logoImg from '@/assets/images/Logo.png';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <img
          src={logoImg}
          alt="Macadamy Logo"
          className="w-[125px] h-[125px] rounded-full"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-sm rounded-full" />
      </div>
      <span className="text-8xl font-bold text-white">Macadamy</span>
    </div>
  );
}