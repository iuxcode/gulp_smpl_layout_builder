import $ from "jquery";
import { sayHello } from "./utils";

console.log("You're ready to go...\nSass, Typescript and Tailwind have been set up!\n");

$("#main-button").on("click", () => {
  sayHello("Let's say something...!");
});


