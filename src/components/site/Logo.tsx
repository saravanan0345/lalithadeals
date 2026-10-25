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
        className={`${className || "h-10 sm:h-12"} w-auto object-contain`}
      />
    );
  }

  return (
    <div className={`flex flex-col justify-center leading-none select-none ${className || ""}`}>
      <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
        Lalitha <span className="text-primary font-bold">Deals</span>
      </span>
      <span className="mt-1 text-[10px] sm:text-xs font-extrabold tracking-[0.2em] uppercase text-muted-foreground">
        Fancy Costumes • Photo Frames • Gifts
      </span>
    </div>
  );
}
