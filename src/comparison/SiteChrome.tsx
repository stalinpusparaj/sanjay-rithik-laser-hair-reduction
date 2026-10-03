import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import logo from "./a/assets/hospital-logo.png";

const links = [["Home", "a-top"], ["About", "a-clinic"], ["Dermatology", "b-services"], ["Treatments", "b-treatment-options"], ["Doctors", "a-doctor"], ["Resources", "compare-questions"], ["Contact", "b-consultation"]];

export function WhatsAppIcon({ size = 19, className }: { size?: number; className?: string; "aria-label"?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 32 32" width={size} height={size} focusable="false">
      <path
        fill="currentColor"
        d="M16.04 3.2A12.75 12.75 0 0 0 5.02 22.37L3.6 28.8l6.59-1.54A12.74 12.74 0 1 0 16.04 3.2Zm0 22.9a10.05 10.05 0 0 1-5.12-1.4l-.37-.22-3.9.91.84-3.8-.24-.39a10.08 10.08 0 1 1 8.79 4.9Zm5.55-7.54c-.3-.15-1.78-.88-2.06-.98-.28-.1-.49-.15-.7.15-.2.3-.8.98-.98 1.18-.18.2-.36.23-.66.08-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.79-1.67-2.09-.18-.3-.02-.46.13-.61.13-.13.3-.36.45-.54.15-.18.2-.3.3-.51.1-.2.05-.38-.03-.54-.07-.15-.69-1.66-.94-2.27-.25-.6-.5-.51-.69-.52h-.59c-.2 0-.54.08-.82.38-.28.3-1.08 1.05-1.08 2.56 0 1.51 1.1 2.97 1.25 3.17.15.2 2.17 3.31 5.26 4.64.74.32 1.31.51 1.76.65.74.24 1.41.2 1.94.12.59-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z"
      />
    </svg>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("a-top");
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 32);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: "-15% 0px -60% 0px" });
    links.forEach(([, id]) => { const el = document.getElementById(id!); if (el) observer.observe(el); });
    return () => { window.removeEventListener("scroll", scroll); observer.disconnect(); };
  }, []);
  return <header className={`site-header ${scrolled ? "is-scrolled" : ""}`} onKeyDown={(event) => {
    if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
  }}>
    <div className="site-header-inner">
      <a className="site-brand" href="#a-top" onClick={() => setOpen(false)}>
        <img src={logo} alt="" width={48} height={48} />
        <span><strong>Sanjay Rithik Hospital</strong><small>DERMATOLOGY CLINIC &amp; HOSPITAL · KARUR</small></span>
      </a>
      <nav id="primary-navigation" className={`site-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
        {links.map(([label, id]) => <a key={label} href={`#${id}`} aria-current={active === id ? "location" : undefined} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
      <a className="site-button header-book" href="#b-consultation" onClick={() => setOpen(false)}>Book a Consultation <ArrowRight size={16} /></a>
      <button ref={toggle} type="button" className="menu-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
  </header>;
}

