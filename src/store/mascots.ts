/** A purchasable mascot skin. Rendered as a parametrised inline SVG, so a new
 * skin is just a set of colours (and an optional accessory emoji) — no assets. */
export interface MascotSkin {
  id: string;
  name: string;
  cost: number;
  bodyTop: string;
  bodyBottom: string;
  belly: string;
  ear: string;
  cheek: string;
  badge: string;
  accessory?: string;
}

export const DEFAULT_MASCOT = "umnik";

export const MASCOTS: MascotSkin[] = [
  {
    id: "umnik",
    name: "Умножарик",
    cost: 0,
    bodyTop: "#8e7bff",
    bodyBottom: "#6c5ce7",
    belly: "#fff6e0",
    ear: "#6c5ce7",
    cheek: "#ff8fb3",
    badge: "#ff6b6b",
  },
  {
    id: "fox",
    name: "Лисёнок",
    cost: 120,
    bodyTop: "#ffa94d",
    bodyBottom: "#ff6b35",
    belly: "#fff3e0",
    ear: "#ff6b35",
    cheek: "#ffb3a7",
    badge: "#c0392b",
  },
  {
    id: "cat",
    name: "Котик",
    cost: 180,
    bodyTop: "#ff9ff3",
    bodyBottom: "#ee5ad6",
    belly: "#fff0fb",
    ear: "#ee5ad6",
    cheek: "#ff6fae",
    badge: "#a23bbf",
  },
  {
    id: "dragon",
    name: "Дракоша",
    cost: 250,
    bodyTop: "#55efc4",
    bodyBottom: "#0fb96f",
    belly: "#eafff6",
    ear: "#0fb96f",
    cheek: "#7bed9f",
    badge: "#e67e22",
  },
  {
    id: "robot",
    name: "Робот",
    cost: 320,
    bodyTop: "#74b9ff",
    bodyBottom: "#3b6fd6",
    belly: "#eaf2ff",
    ear: "#3b6fd6",
    cheek: "#a3c9ff",
    badge: "#feca57",
    accessory: "⚙️",
  },
  {
    id: "unicorn",
    name: "Единорог",
    cost: 500,
    bodyTop: "#ffd1ff",
    bodyBottom: "#b57bff",
    belly: "#fff5ff",
    ear: "#b57bff",
    cheek: "#ff8fce",
    badge: "#ff6b6b",
    accessory: "🦄",
  },
  {
    id: "king",
    name: "Король счёта",
    cost: 800,
    bodyTop: "#ffe08a",
    bodyBottom: "#f0b429",
    belly: "#fffaf0",
    ear: "#f0b429",
    cheek: "#ffcf8a",
    badge: "#c0392b",
    accessory: "👑",
  },
];

export function mascotById(id: string): MascotSkin {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
}
