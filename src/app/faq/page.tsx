"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type FAQCategory = "all" | "ordering" | "delivery" | "payment" | "account" | "products";

const CATEGORIES: { key: FAQCategory; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "" },
  { key: "ordering", label: "Ordering", icon: "🛒" },
  { key: "delivery", label: "Delivery", icon: "🚚" },
  { key: "payment", label: "Payment", icon: "💳" },
  { key: "account", label: "Account", icon: "👤" },
  { key: "products", label: "Products", icon: "🌶️" },
];

const FAQS = [
  {
    question: "How do I place an order?",
    answer: "Browse the shop, open a product to review its details, choose your quantity, and add it to your cart. At checkout, enter your delivery details and select cash on delivery or bank transfer.",
    category: "ordering",
  },
  {
    question: "Can I buy more than one product?",
    answer: "Yes. Add different products to the same cart. The cart combines repeated items and keeps each product separate so you can adjust quantities before checkout.",
    category: "ordering",
  },
  {
    question: "How do I know if a product is available?",
    answer: "Product cards and product pages show current stock. Stock is checked again at checkout, so an item cannot be purchased when the available quantity has changed.",
    category: "products",
  },
  {
    question: "How does delivery work?",
    answer: "We deliver across Nigeria. Delivery charges are calculated at checkout, and eligible orders receive free delivery based on the current order threshold.",
    category: "delivery",
  },
  {
    question: "What payment methods are available?",
    answer: "You can pay on delivery or by bank transfer. Bank transfer orders require payment proof to be uploaded during checkout.",
    category: "payment",
  },
  {
    question: "Can I reorder something I bought before?",
    answer: "Yes. Open My Orders in your account and choose Buy again. We check current stock first and add available items to your cart using the current price.",
    category: "account",
  },
  {
    question: "Can I leave a product review?",
    answer: "Yes. Sign in, open the product page, choose a star rating, and share feedback. Reviews help other customers make better decisions.",
    category: "products",
  },
  {
    question: "How can the Spice Guide help me?",
    answer: "Signed-in customers can ask the Spice Guide for suggestions by meal, flavour, ingredient, or cooking style. It recommends products from the available KMA catalog.",
    category: "products",
  },
  {
    question: "What if I need help with my order?",
    answer: "Use the contact details in the footer or reach out through WhatsApp when available. Keep your order number ready so we can assist you faster.",
    category: "ordering",
  },
  {
    question: "Is there free delivery?",
    answer: "Orders above ₦15,000 qualify for free delivery. Standard delivery fees apply below this threshold and are calculated at checkout.",
    category: "delivery",
  },
  {
    question: "How do I track my order?",
    answer: "Go to My Orders in your account to see the current status of each order. You will also receive updates via email for key status changes.",
    category: "delivery",
  },
  {
    question: "Can I cancel my order?",
    answer: "Orders can be cancelled before they are dispatched. Contact us via email or WhatsApp with your order number and we will process the cancellation.",
    category: "ordering",
  },
  {
    question: "How do I create an account?",
    answer: "Click Sign Up in the top navigation, enter your name, email, and password. You will receive a confirmation email to verify your account before shopping.",
    category: "account",
  },
  {
    question: "Are your spices 100% natural?",
    answer: "Yes. All KMA products are 100% natural with no artificial preservatives, colours, or flavours. We source directly from trusted Nigerian farmers and suppliers.",
    category: "products",
  },
];

function FAQAccordionItem({ faq, isOpen, onToggle, index }: {
  faq: typeof FAQS[0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      className={`faq-item ${isOpen ? "faq-item--open" : ""}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <button
        className="faq-item__question"
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{faq.question}</span>
        <motion.span
          className="faq-item__chevron"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="faq-item__answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p>{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = useMemo(() => {
    let result = FAQS;
    if (activeCategory !== "all") {
      result = result.filter((faq) => faq.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (faq) =>
          faq.question.toLowerCase().includes(q) ||
          faq.answer.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, searchQuery]);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <main className="faq-page">
        {/* Hero */}
        <div className="faq-hero">
          <div className="container">
            <span className="faq-hero__eyebrow">Help Center</span>
            <h1 className="faq-hero__title">How can we help?</h1>
            <p className="faq-hero__sub">Find answers about ordering, delivery, payments, and our products.</p>

            {/* Search */}
            <div className="faq-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOpenIndex(null);
                }}
              />
              {searchQuery && (
                <button className="faq-search__clear" onClick={() => setSearchQuery("")} aria-label="Clear search">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="faq-content">
          <div className="container faq-content__inner">
            {/* Category tabs */}
            <div className="faq-tabs" role="tablist">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  className={`faq-tab ${activeCategory === cat.key ? "faq-tab--active" : ""}`}
                  onClick={() => {
                    setActiveCategory(cat.key);
                    setOpenIndex(null);
                  }}
                  role="tab"
                  aria-selected={activeCategory === cat.key}
                >
                  {cat.icon && <span className="faq-tab__icon">{cat.icon}</span>}
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Results count */}
            <div className="faq-results">
              <span>{filteredFaqs.length} {filteredFaqs.length === 1 ? "question" : "questions"}</span>
            </div>

            {/* FAQ list */}
            {filteredFaqs.length > 0 ? (
              <section className="faq-list" aria-label="Frequently asked questions">
                {filteredFaqs.map((faq, index) => (
                  <FAQAccordionItem
                    key={faq.question}
                    faq={faq}
                    isOpen={openIndex === index}
                    onToggle={() => handleToggle(index)}
                    index={index}
                  />
                ))}
              </section>
            ) : (
              <div className="faq-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <p>No questions match &ldquo;{searchQuery}&rdquo;</p>
                <button className="faq-empty__clear" onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>Clear search</button>
              </div>
            )}

            {/* Contact CTA */}
            <div className="faq-contact">
              <div className="faq-contact__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="faq-contact__copy">
                <strong>Still have questions?</strong>
                <span>Our team typically replies within a few hours.</span>
              </div>
              <Link href="mailto:kmafoods22@gmail.com" className="btn btn-primary btn-sm">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
