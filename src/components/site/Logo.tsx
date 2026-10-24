import logo from "@/assets/logo.png";

export function Logo({ className = "h-12" }: { className?: string }) {
  return <img src={logo} alt="Lalitha – L Deals" width={2064} height={512} className={`${className} w-auto object-contain`} />;
}
