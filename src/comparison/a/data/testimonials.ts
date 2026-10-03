export type Testimonial = {
  name: string;
  meta: string;
  rating: number;
  timeAgo: string;
  quote: string;
};

/**
 * Real, publicly posted Google reviews from Sanjay Rithik Hospital's Google Business
 * listing (the same listing linked from the "4.5 · 440 Google reviews" credit elsewhere
 * on this page). Quotes preserve the reviewer's own words and meaning exactly — only
 * trailing decorative emoji and obvious spacing/typos were lightly cleaned for display.
 * Never alter what a reviewer actually said.
 */
export const testimonials: Testimonial[] = [
  {
    name: "Stalin Gates",
    meta: "Google review",
    rating: 5,
    timeAgo: "",
    quote:
      "I had a excellent experience at Sanjay Rithik Hospital for Anti-Aging Consultation. I especially appreciated friendly staff, clear explanation, cleanliness, and quick service. எனக்கு இந்த சர்வீஸ் ரொம்ப நல்லா இருக்கு",
  },
  {
    name: "Sathik Basha",
    meta: "Local Guide · 9 reviews · 36 photos",
    rating: 5,
    timeAgo: "2 months ago",
    quote:
      "I recently underwent PRP treatment with my skin doctor and had a very positive experience. Dr.kiruthika mam explained the entire procedure clearly and made me feel comfortable throughout the session. The treatment was performed and with proper hygiene. After a few weeks, I noticed improvements in my skin texture, glow, and overall appearance. The staff was friendly and supportive, and all my questions were answered patiently. I am happy with the results so far and would recommend this clinic to anyone considering PRP treatment.",
  },
  {
    name: "S. Aakash",
    meta: "3 reviews",
    rating: 5,
    timeAgo: "3 months ago",
    quote:
      "I did a chemical peel with Dr. Kiruthika in Karur and the results are amazing! My skin tone is even, acne marks have faded a lot, and my face looks so fresh. Doctor explained the whole procedure clearly and made me feel comfortable. Clinic is very clean and staff are helpful. Easily the best dermatologist in Karur.",
  },
  {
    name: "Sathish Kumar",
    meta: "2 reviews",
    rating: 5,
    timeAgo: "2 months ago",
    quote:
      "Sanjay rithik hospital skin care hospital provides excellent care with a very professional and friendly approach. The doctor are knowledgeable, patient, and take time to clearly explain the treatment process. The staff is supportive, hygiene standard are well maintained, and overall environment feel comfortable and trust worthy. Highly recommend for anyone looking for reliable and effective skin treatment.",
  },
  {
    name: "Karthick C",
    meta: "2 reviews",
    rating: 5,
    timeAgo: "a year ago",
    quote:
      "Dr. S. Kiruthika, a skin doctor, has provided excellent results for my face through her effective treatments.",
  },
  {
    name: "Likitha C",
    meta: "2 reviews",
    rating: 5,
    timeAgo: "2 months ago",
    quote:
      "I visit in dr.kiruthika mam i had great experience at this skin care hospital. Understand my skin concerns in detail, the staff here friendly and always make you feel comfortable.",
  },
];
