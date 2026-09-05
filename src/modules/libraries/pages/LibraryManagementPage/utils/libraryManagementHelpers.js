export const ROLE_OPTIONS = [
  {
    value: "OWNER",
    label: "Власник",
  },
  {
    value: "ADMIN",
    label: "Адміністратор",
  },
  {
    value: "MEMBER",
    label: "Учасник",
  },
];

export const getRoleLabel = (role) =>
  ROLE_OPTIONS.find((item) => item.value === role)?.label ?? role;

export const getInitials = (member) => {
  const name = member?.user?.name?.trim();

  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }

  const email = member?.user?.email?.trim();

  return email?.[0]?.toUpperCase() ?? "?";
};
