import { Role } from "@prisma/client";

const rank: Record<Role, number> = {
  VIEWER: 1,
  TAILOR: 2,
  DESIGNER: 3,
  ADMIN: 4,
  OWNER: 5,
};

export function canManageInvites(role: Role) {
  return role === "OWNER" || role === "ADMIN";
}

export function canEditCore(role: Role) {
  return rank[role] >= rank.DESIGNER;
}

export function canDownloadPattern(role: Role) {
  return rank[role] >= rank.TAILOR;
}
