export function formDataToObject(
  formData: FormData,
  omitEmptyFields: boolean = true
): { [key: string]: string } {
  const ret: { [key: string]: string } = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && (!omitEmptyFields || value !== "")) {
      ret[key] = value;
    }
  }
  return ret;
}
