import Link from "next/link";
import Image from "next/image";

interface Props {
  name: string;
  description: string;
  image: string;
  href: string;
}

export default function CategoryCard({ name, description, image, href }: Props) {
  return (
    <Link href={href} className="category-card">
      <div className="category-card__image">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 960px) 33vw, 20vw"
          style={{ objectFit: "cover" }}
        />
        <div className="category-card__overlay" />
      </div>
      <div className="category-card__content">
        <span className="category-card__name">{name}</span>
        <span className="category-card__description">{description}</span>
      </div>
    </Link>
  );
}
