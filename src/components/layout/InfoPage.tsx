import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export interface InfoSection {
  title: string;
  body: string;
  bullets?: string[];
}

interface InfoPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
  sections: InfoSection[];
  contactLabel: string;
}

export default function InfoPage({ eyebrow, title, intro, updated, sections, contactLabel }: InfoPageProps) {
  return (
    <>
      <Navbar />
      <main className="info-page">
        <div className="container info-page__inner">
          <header className="info-page__hero">
            <p className="section-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="info-page__intro">{intro}</p>
            {updated && <p className="info-page__updated">Last updated: {updated}</p>}
            <nav className="info-page__quick-links" aria-label="Helpful links">
              <Link href="/shop">Browse products</Link>
              <Link href="/faq">Read FAQs</Link>
              <Link href="/account/orders">My orders</Link>
            </nav>
          </header>

          <div className="info-page__layout">
            <aside className="info-page__toc" aria-label="On this page">
              <span>On this page</span>
              {sections.map((section, index) => (
                <a key={section.title} href={`#info-section-${index}`}>{section.title}</a>
              ))}
            </aside>

            <article className="info-page__content">
              {sections.map((section, index) => (
                <section key={section.title} id={`info-section-${index}`} className="info-page__section">
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                  {section.bullets && (
                    <ul>
                      {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                  )}
                </section>
              ))}
            </article>
          </div>

          <div className="info-page__contact">
            <div>
              <strong>{contactLabel}</strong>
              <span>We are happy to help with products, orders, and delivery.</span>
            </div>
            <Link href="mailto:kmafoods22@gmail.com" className="btn btn-primary btn-sm">Contact KMA</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
