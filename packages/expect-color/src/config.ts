export interface ExpectColorOptions {
  precision?: number | "auto";
}

export const config: Required<ExpectColorOptions> = {
  precision: "auto",
};
