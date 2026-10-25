import logoIcon from "@/assets/logo-icon.png";
import logo from "@/assets/logo.png";

export function Logo({
  className,
  asImage = false,
}: {
  className?: string;
  asImage?: boolean;
}) {
  if (asImage) {
    return (
      <img
        src={logo}
        alt="Lalitha Deals"
        width={2064}
        height={512}
        className={`${className || "h-12 sm:h-16"} w-auto object-contain`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3.5 select-none ${className || ""}`}>
      <img
        src={logoIcon}
        alt="L&D Monogram"
        width={512}
        height={512}
        className="h-11 w-11 sm:h-14 sm:w-14 shrink-0 rounded-full object-contain shadow-soft transition-transform group-hover:scale-105"
      />
      <div className="flex flex-col justify-center leading-none">
        <span className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          Lalitha <span className="text-primary font-bold">Deals</span>
        </span>
        <span className="mt-1 text-[10px] sm:text-xs font-extrabold tracking-[0.2em] uppercase text-muted-foreground">
          Fancy Costumes • Photo Frames • Gifts
        </span>
      </div>
    </div>
  );
}

export function LogoIcon({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <img
      src={logoIcon}
      alt="Lalitha Deals L&D"
      width={512}
      height={512}
      className={`${className} rounded-full object-contain`}
    />
  );
}
