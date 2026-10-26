import logo from "@/assets/logo.png";

export function Logo({
  className = "h-9 sm:h-11",
}: {
  className?: string;
  asImage?: boolean;
}) {
  const hasHeight = className && /\bh-\S+/.test(className);
  const heightClass = hasHeight ? "" : "h-9 sm:h-11";

  return (
    <img
      src={logo}
      alt="Lalitha Deals"
      width={2064}
      height={512}
      className={`${heightClass} ${className || ""} w-auto object-contain select-none`}
    />
  );
}
