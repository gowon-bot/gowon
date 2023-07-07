export function getNumberEnumValues(enum_: object): number[] {
  type EnumKey = keyof typeof enum_;

  const keys = Object.keys(enum_).filter(
    (k) => typeof enum_[k as EnumKey] === "number"
  );

  return keys.map((k) => enum_[k as EnumKey] as unknown as number);
}
