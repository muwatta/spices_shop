"use client";

export default function NewsletterForm() {
  return (
    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        placeholder="Your email address"
        className="form-input"
        aria-label="Email for newsletter"
        required
      />
      <button type="submit" className="btn btn-primary">
        Subscribe
      </button>
    </form>
  );
}
