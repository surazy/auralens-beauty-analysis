import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ritual Archive — AuraLens",
  description: "Your scanned beauty formulas, stored on-device.",
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
