"use client";

import Link from "next/link";

interface Props {
  emoji: string;
  name: string;
  href: string;
  colorClass?: string;
}

export default function InspirationCard({ emoji, name, href }: Props) {
  return (
    <Link href={href} className="inspiration-card">
      <span className="inspiration-card__emoji" aria-hidden="true">{emoji}</span>
      <span className="inspiration-card__name">{name}</span>
    </Link>
  );
}
