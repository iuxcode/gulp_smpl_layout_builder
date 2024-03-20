import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const initGSAP = () => {
  gsap.registerPlugin(ScrollTrigger);
};

export { gsap, ScrollTrigger as scrollTrigger };
