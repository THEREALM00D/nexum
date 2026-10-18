export type ConfigSettings = Record<string, string | number | boolean>;

export interface SelectOption {
  value: string;
  labelKey: string;
}

export interface FieldDef {
  key: string;
  type: "text" | "number" | "boolean" | "select";
  options?: SelectOption[];
  /** Champ sans lequel le serveur ne démarre pas : astérisque + erreur si vide. */
  required?: boolean;
}

export interface FieldGroup {
  labelKey: string;
  fields: FieldDef[];
}
