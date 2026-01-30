import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Eu criei essa função 'cn' (classnames) para resolver conflitos de classes.
// Se eu tiver 'bg-red-500' e depois condicionalmente colocar 'bg-blue-500',
// o twMerge garante que a última vença, limpando o CSS final.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}