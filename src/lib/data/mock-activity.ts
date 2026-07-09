import type { CollectorActivityEvent } from "@/lib/types";
import { MOCK_CATALOG } from "@/lib/data/mock-renaiss";

function c(id: string) {
  const card = MOCK_CATALOG.find((x) => x.id === id)!;
  return {
    cardTitle: card.title,
    imageUrl: card.imageUrl,
    tokenId: card.tokenId,
    fmv: card.fmv,
  };
}

export const MAYA_ACTIVITY: CollectorActivityEvent[] = [
  {
    id: "maya-1",
    type: "listed",
    ...c("rn-005"),
    timestamp: "2026-07-01T09:00:00Z",
    price: 310,
    note: "Listed for trade on Renaiss",
  },
  {
    id: "maya-2",
    type: "holding",
    ...c("rn-001"),
    timestamp: "2026-05-12T10:00:00Z",
    note: "Holding — not listed",
  },
  {
    id: "maya-3",
    type: "acquired",
    ...c("rn-004"),
    timestamp: "2026-04-20T09:15:00Z",
    price: 890,
    note: "Acquired from marketplace",
  },
  {
    id: "maya-4",
    type: "sold",
    cardTitle: "Neon Pilgrim",
    tokenId: "1003",
    imageUrl: "/cards/neon-pilgrim.svg",
    fmv: 110,
    timestamp: "2026-03-08T14:00:00Z",
    price: 95,
    counterparty: "0xabc…def1",
    note: "Sold on Renaiss",
  },
  {
    id: "maya-5",
    type: "transferred_in",
    ...c("rn-001"),
    timestamp: "2026-02-15T11:30:00Z",
    counterparty: "0x742…0beb",
    note: "Transfer in on BNB Chain",
  },
];

export const LUCA_ACTIVITY: CollectorActivityEvent[] = [
  {
    id: "luca-1",
    type: "holding",
    ...c("rn-002"),
    timestamp: "2026-03-10T10:00:00Z",
    note: "Grail hold — vault",
  },
  {
    id: "luca-2",
    type: "acquired",
    ...c("rn-007"),
    timestamp: "2026-04-15T14:30:00Z",
    price: 420,
    note: "Private acquisition",
  },
  {
    id: "luca-3",
    type: "bid",
    cardTitle: "Celestial Moth",
    tokenId: "1008",
    imageUrl: "/cards/celestial-moth.svg",
    fmv: 195,
    timestamp: "2026-06-20T18:00:00Z",
    price: 180,
    note: "Active bid — awaiting seller",
  },
  {
    id: "luca-4",
    type: "sold",
    ...c("rn-001"),
    timestamp: "2026-01-10T12:00:00Z",
    price: 220,
    note: "Rotated out of collection",
  },
];

export const JORDAN_ACTIVITY: CollectorActivityEvent[] = [
  {
    id: "jordan-1",
    type: "listed",
    ...c("rn-010"),
    timestamp: "2026-07-02T08:00:00Z",
    price: 520,
    note: "Listed — open to trades",
  },
  {
    id: "jordan-2",
    type: "holding",
    ...c("rn-003"),
    timestamp: "2026-02-10T10:00:00Z",
    note: "PC grail",
  },
  {
    id: "jordan-3",
    type: "transferred_in",
    ...c("rn-006"),
    timestamp: "2026-03-15T14:30:00Z",
    counterparty: "0x91f…22aa",
    note: "Trade completed on-chain",
  },
  {
    id: "jordan-4",
    type: "acquired",
    ...c("rn-006"),
    timestamp: "2026-03-14T16:00:00Z",
    price: 78,
    note: "Sniped below FMV",
  },
];

const DEMO_ACTIVITY: Record<string, CollectorActivityEvent[]> = {
  "collector-demo-01": MAYA_ACTIVITY,
  "collector-demo-02": LUCA_ACTIVITY,
  "collector-demo-03": JORDAN_ACTIVITY,
};

export function getDemoActivity(collectorId: string): CollectorActivityEvent[] {
  return DEMO_ACTIVITY[collectorId] ?? [];
}