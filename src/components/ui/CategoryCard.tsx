import Link from "next/link";

interface Props {
  emoji: string;
  name: string;
  count?: string;
  href: string;
  colorClass?: string;
}

export default function CategoryCard({ emoji, name, count, href, colorClass }: Props) {
  return (
    <Link href={href} className="category-card">
      <div className={`category-card__icon ${colorClass || "category-card__icon--spices"}`}>
        <span aria-hidden="true">{emoji}</span>
      </div>
      <span className="category-card__name">{name}</span>
      {count && <span className="category-card__count">{count}</span>}
    </Link>
  );
}
