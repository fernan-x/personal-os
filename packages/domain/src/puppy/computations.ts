export function computePetAge(birthDate: Date | string | null): string | null {
  if (!birthDate) return null;

  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) return null;

  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const weeks = Math.floor(days / 7);

  if (years >= 1) {
    return months > 0
      ? `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""}`
      : `${years} year${years !== 1 ? "s" : ""}`;
  }
  if (months >= 1) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  }
  if (weeks >= 1) {
    return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  }
  return `${days} day${days !== 1 ? "s" : ""}`;
}

export function computeGrowthStage(
  birthDate: Date | string | null,
): string {
  if (!birthDate) return "Unknown";

  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const now = new Date();
  const months = Math.floor(
    (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30),
  );

  if (months < 0) return "Unknown";
  if (months < 4) return "Puppy";
  if (months < 12) return "Adolescent";
  return "Adult";
}

export function computeTrainingProgress(
  milestones: { status: string }[],
): { learned: number; total: number; percentage: number } {
  const total = milestones.length;
  const learned = milestones.filter((m) => m.status === "learned").length;
  return {
    learned,
    total,
    percentage: total > 0 ? Math.round((learned / total) * 100) : 0,
  };
}

export function computeTimeSince(
  date: Date | string | null,
): string | null {
  if (!date) return null;

  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();

  if (diffMs < 0) return null;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  return "just now";
}
