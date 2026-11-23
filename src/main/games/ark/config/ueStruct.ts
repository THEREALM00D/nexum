// Valeurs « structure » d'Unreal dans Game.ini :
// `(ItemClassString="X",Quantity=(MaxItemQuantity=500,bIgnoreMultiplier=True))`
// ou un tableau `("a","b")` / `((A=1),(A=2))`. Lues en arbre puis réécrites
// sur une seule ligne, sans espaces (forme attendue par le serveur).

export type UeValue = UeScalar | UeStruct | UeValue[];

export interface UeScalar {
  kind: "scalar";
  text: string;
  /** Écrit entre guillemets (nom de classe, chaîne). */
  quoted: boolean;
}

export interface UeStruct {
  kind: "struct";
  fields: { name: string; value: UeValue }[];
}

class Reader {
  private position = 0;
  private readonly text: string;

  constructor(text: string) {
    this.text = text;
  }

  private skipSpaces(): void {
    while (/\s/.test(this.text[this.position] ?? "")) this.position += 1;
  }

  private peek(): string {
    this.skipSpaces();
    return this.text[this.position] ?? "";
  }

  private expect(character: string): void {
    if (this.peek() !== character) {
      throw new Error(`expected ${character} at ${this.position}`);
    }
    this.position += 1;
  }

  value(): UeValue {
    const next = this.peek();
    if (next === "(") return this.group();
    if (next === '"') return this.quoted();
    return this.bare();
  }

  private quoted(): UeScalar {
    this.expect('"');
    const end = this.text.indexOf('"', this.position);
    if (end === -1) throw new Error("unterminated string");
    const text = this.text.slice(this.position, end);
    this.position = end + 1;
    return { kind: "scalar", text, quoted: true };
  }

  private bare(): UeScalar {
    const start = this.position;
    while (
      this.position < this.text.length &&
      !",()=".includes(this.text[this.position])
    ) {
      this.position += 1;
    }
    return {
      kind: "scalar",
      text: this.text.slice(start, this.position).trim(),
      quoted: false,
    };
  }

  /** `(Name=…,…)` est une structure, `(…,…)` sans `=` un tableau. */
  private group(): UeStruct | UeValue[] {
    this.expect("(");
    if (this.peek() === ")") {
      this.position += 1;
      return [];
    }
    if (this.startsWithField()) {
      const fields: UeStruct["fields"] = [];
      do {
        const name = this.bare().text;
        this.expect("=");
        fields.push({ name, value: this.value() });
      } while (this.consumeComma());
      this.expect(")");
      return { kind: "struct", fields };
    }
    const items: UeValue[] = [];
    do {
      items.push(this.value());
    } while (this.consumeComma());
    this.expect(")");
    return items;
  }

  private startsWithField(): boolean {
    const rest = this.text.slice(this.position);
    return /^\s*[A-Za-z_][\w[\]]*\s*=/.test(rest);
  }

  private consumeComma(): boolean {
    if (this.peek() === ",") {
      this.position += 1;
      return true;
    }
    return false;
  }

  end(): void {
    if (this.peek() !== "")
      throw new Error(`trailing text at ${this.position}`);
  }
}

/** Arbre d'une valeur `(…)`, null si elle est illisible (gardée telle quelle). */
export function parseUeValue(text: string): UeValue | null {
  try {
    const reader = new Reader(text);
    const value = reader.value();
    reader.end();
    return value;
  } catch {
    return null;
  }
}

export function formatUeValue(value: UeValue): string {
  if (Array.isArray(value)) return `(${value.map(formatUeValue).join(",")})`;
  if (value.kind === "scalar") {
    return value.quoted ? `"${value.text}"` : value.text;
  }
  return `(${value.fields
    .map((field) => `${field.name}=${formatUeValue(field.value)}`)
    .join(",")})`;
}

// --- Aides pour lire / construire des structures ---

export const ueText = (text: string, quoted = false): UeScalar => ({
  kind: "scalar",
  text,
  quoted,
});

export const ueStruct = (
  fields: [string, UeValue | undefined][],
): UeStruct => ({
  kind: "struct",
  fields: fields.flatMap(([name, value]) =>
    value === undefined ? [] : [{ name, value }],
  ),
});

/** Champ d'une structure, sans tenir compte de la casse. */
export function ueField(
  value: UeValue | null,
  name: string,
): UeValue | undefined {
  if (!value || Array.isArray(value) || value.kind !== "struct")
    return undefined;
  const wanted = name.toLowerCase();
  return value.fields.find((field) => field.name.toLowerCase() === wanted)
    ?.value;
}

export function ueFieldText(
  value: UeValue | null,
  name: string,
): string | undefined {
  const field = ueField(value, name);
  return field && !Array.isArray(field) && field.kind === "scalar"
    ? field.text
    : undefined;
}

export function ueList(value: UeValue | undefined): UeValue[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
