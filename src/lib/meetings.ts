export type MeetingTypeCode = "ON_SITE" | "ONLINE";

export const MEETING_TYPES: { value: MeetingTypeCode; label: string }[] = [
  { value: "ON_SITE", label: "On-site" },
  { value: "ONLINE", label: "Online" },
];

export const ONLINE_PLATFORMS = [
  "Zoom",
  "Google Meet",
  "Microsoft Teams",
  "WhatsApp",
  "Skype",
  "Discord",
  "Other",
] as const;

export type OnlinePlatform = (typeof ONLINE_PLATFORMS)[number];

export function formatMeetingPlace(meeting: {
  type: MeetingTypeCode | string;
  location?: string | null;
  onlinePlatform?: string | null;
  meetingLink?: string | null;
}): string {
  if (meeting.type === "ONLINE") {
    const platform = meeting.onlinePlatform ?? "Online";
    return meeting.meetingLink ? `${platform} · Link` : platform;
  }
  return meeting.location ?? "On-site";
}
