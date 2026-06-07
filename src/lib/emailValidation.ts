export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmailAddress(value: string): boolean {
  const email = value.trim();
  if (email.length === 0 || email.length > 254) return false;

  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@") || atIndex === email.length - 1) {
    return false;
  }

  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);

  if (localPart.length > 64 || domainPart.length < 3) return false;
  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    domainPart.startsWith(".") ||
    domainPart.endsWith(".")
  ) {
    return false;
  }
  if (!domainPart.includes(".")) return false;

  const domainLabels = domainPart.split(".");
  if (domainLabels.some((label) => label.length === 0 || label.startsWith("-") || label.endsWith("-"))) {
    return false;
  }

  return true;
}
