import type { EventType, Idea } from "../types";

type Allocation = {
  id: string;
  category: string;
  weight: number;
  aliases: string[];
  partner: string;
};
type TaskTemplate = [title: string, daysBefore: number, category: string];

export const allocations: Record<EventType, Allocation[]> = {
  wedding: [
    {
      id: "venue",
      category: "Venue & setup",
      weight: 25,
      aliases: ["venue", "location", "comfort"],
      partner: "Venue partner",
    },
    {
      id: "food",
      category: "Food & drink",
      weight: 30,
      aliases: ["food", "catering", "drink", "dining"],
      partner: "Catering partner",
    },
    {
      id: "design",
      category: "Design & flowers",
      weight: 15,
      aliases: ["decor", "design", "flower", "atmosphere", "aesthetic"],
      partner: "Design partner",
    },
    {
      id: "photo",
      category: "Photography",
      weight: 12,
      aliases: ["photo", "video", "memories"],
      partner: "Photography partner",
    },
    {
      id: "entertainment",
      category: "Music & moments",
      weight: 10,
      aliases: ["music", "entertainment", "experience"],
      partner: "Music partner",
    },
    {
      id: "hospitality",
      category: "Guest hospitality",
      weight: 8,
      aliases: ["guest", "hospitality", "accessibility", "inclusive"],
      partner: "Hospitality partner",
    },
  ],
  birthday: [
    {
      id: "venue",
      category: "Venue & setup",
      weight: 20,
      aliases: ["venue", "location", "comfort"],
      partner: "Venue partner",
    },
    {
      id: "food",
      category: "Food & cake",
      weight: 30,
      aliases: ["food", "cake", "catering", "drink"],
      partner: "Food & cake partner",
    },
    {
      id: "design",
      category: "Decor & details",
      weight: 18,
      aliases: ["decor", "design", "atmosphere", "theme"],
      partner: "Decor partner",
    },
    {
      id: "entertainment",
      category: "Activities & music",
      weight: 18,
      aliases: ["music", "entertainment", "activities", "fun", "experience"],
      partner: "Activities partner",
    },
    {
      id: "photo",
      category: "Photography",
      weight: 9,
      aliases: ["photo", "video", "memories"],
      partner: "Photography partner",
    },
    {
      id: "invitations",
      category: "Invitations & favors",
      weight: 5,
      aliases: ["invitation", "favor", "guest"],
      partner: "Stationery partner",
    },
  ],
  community: [
    {
      id: "venue",
      category: "Venue & permits",
      weight: 20,
      aliases: ["venue", "location", "permit"],
      partner: "Venue partner",
    },
    {
      id: "food",
      category: "Food & refreshments",
      weight: 25,
      aliases: ["food", "catering", "drink", "refreshment"],
      partner: "Refreshments partner",
    },
    {
      id: "equipment",
      category: "Equipment & sound",
      weight: 20,
      aliases: ["sound", "equipment", "music", "production"],
      partner: "Equipment partner",
    },
    {
      id: "program",
      category: "Program & activities",
      weight: 15,
      aliases: ["program", "activities", "entertainment", "experience"],
      partner: "Program partner",
    },
    {
      id: "outreach",
      category: "Outreach & signage",
      weight: 10,
      aliases: ["outreach", "promotion", "signage", "community"],
      partner: "Print & signage partner",
    },
    {
      id: "access",
      category: "Accessibility & safety",
      weight: 10,
      aliases: ["accessibility", "safety", "inclusive", "comfort", "guest"],
      partner: "Access & safety partner",
    },
  ],
};

export const taskTemplates: Record<EventType, TaskTemplate[]> = {
  wedding: [
    ["Agree the ceremony format and first guest list", 90, "Planning"],
    ["Research venue availability, access and cancellation terms", 75, "Venue"],
    ["Request catering menus and dietary options", 60, "Food & drink"],
    ["Choose photography coverage and key moments", 45, "Photography"],
    ["Plan flowers, ceremony details and music", 30, "Design"],
    ["Send invitations and collect RSVPs", 21, "Guests"],
    ["Confirm headcount, suppliers and weather backup", 7, "Logistics"],
    ["Share the ceremony and reception run of show", 1, "Event day"],
  ],
  birthday: [
    ["Choose the birthday theme and guest list", 45, "Planning"],
    ["Confirm the venue, access and party timings", 35, "Venue"],
    ["Invite guests and collect dietary requirements", 21, "Guests"],
    ["Plan games, music and age-appropriate activities", 14, "Activities"],
    ["Order the birthday cake and confirm food quantities", 10, "Food & cake"],
    ["Prepare decorations and a photo corner", 7, "Decor"],
    ["Confirm RSVPs and the cake-cutting schedule", 3, "Logistics"],
    ["Set up the welcome, activity and cake stations", 0, "Event day"],
  ],
  community: [
    ["Check venue permissions, permits and public capacity", 45, "Venue"],
    ["Map accessible routes, toilets and the site layout", 35, "Accessibility"],
    ["Recruit volunteers and assign clear shift leads", 30, "Volunteers"],
    ["Confirm the community program and activity hosts", 21, "Program"],
    ["Publish invitations and share access information", 14, "Outreach"],
    ["Confirm equipment, sound and refreshment quantities", 7, "Suppliers"],
    ["Review weather cover, first aid and emergency contacts", 3, "Safety"],
    ["Brief volunteers and check the welcome desk", 0, "Event day"],
  ],
};

export const ideaTemplates: Record<
  EventType,
  Array<Omit<Idea, "id" | "saved">>
> = {
  wedding: [
    {
      title: "A table full of stories",
      description:
        "Name tables after places or memories you share. Add one short story to each place card.",
      tag: "Personal touch",
      color: "#EEEAF8",
    },
    {
      title: "A gentle golden-hour pause",
      description:
        "Leave a short unhurried break for portraits and refreshments between the ceremony and the meal.",
      tag: "Guest experience",
      color: "#F7E9DF",
    },
    {
      title: "One beautiful focal point",
      description:
        "Focus flowers and reusable decor around the ceremony, then move them to the reception.",
      tag: "Budget mindful",
      color: "#EAF0EC",
    },
  ],
  birthday: [
    {
      title: "The birthday time capsule",
      description:
        "Invite each guest to leave a favorite memory or a wish to open at the next birthday.",
      tag: "Personal touch",
      color: "#EEEAF8",
    },
    {
      title: "A choose-your-own activity corner",
      description:
        "Offer one lively game and one quieter creative station so guests can join at their own pace.",
      tag: "Guest experience",
      color: "#F7E9DF",
    },
    {
      title: "Cake as the centerpiece",
      description:
        "Build a small, considered display around the cake using a limited color palette and reusable decorations.",
      tag: "Budget mindful",
      color: "#EAF0EC",
    },
  ],
  community: [
    {
      title: "A neighborhood story wall",
      description:
        "Create an accessible shared wall for local memories, ideas and offers of help. Provide pens and a seated option.",
      tag: "Connection",
      color: "#EEEAF8",
    },
    {
      title: "A warm welcome in every direction",
      description:
        "Give volunteers simple name badges and place clear, readable signs at each entrance and key facility.",
      tag: "Accessibility",
      color: "#F7E9DF",
    },
    {
      title: "Bring, share, reuse",
      description:
        "Ask participants to lend reusable equipment or contribute a small activity; confirm responsibilities before the day.",
      tag: "Budget mindful",
      color: "#EAF0EC",
    },
  ],
};
