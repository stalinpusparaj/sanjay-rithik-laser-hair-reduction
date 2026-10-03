import { createFileRoute } from "@tanstack/react-router";
import { Comparison } from "@/comparison/Comparison";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Laser Hair Reduction in Karur | Sanjay Rithik Hospital" },
    { name: "description", content: "Tired of waxing, shaving or threading again and again? Ask Dr. S. Kiruthika at Sanjay Rithik Hospital, Karur, whether laser hair reduction may suit your skin, how many visits may be needed and what it could cost." },
    { property: "og:title", content: "Laser Hair Reduction in Karur · Sanjay Rithik Hospital" },
    { property: "og:description", content: "Tired of waxing, shaving or threading? Ask a skin doctor in Karur about laser hair reduction before you decide." },
  ] }),
  component: Comparison,
});
