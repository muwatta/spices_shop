import type { Metadata } from "next";
import InfoPage, { InfoSection } from "@/components/layout/InfoPage";

export const metadata: Metadata = {
  title: "Privacy Policy — KMA Spices & Herbs",
  description: "Privacy policy for KMA Spices & Herbs online store.",
};

const sections: InfoSection[] = [
  { title: "Information we collect", body: "When you create an account or place an order, we may collect your name, email address, phone number, delivery address, order details, and payment proof where required. We may also receive basic technical information needed to keep the website working." },
  { title: "How we use information", body: "We use your information to authenticate your account, process orders, confirm payments, arrange delivery, provide support, improve the store, and send updates where you have opted in." },
  { title: "What we share", body: "We do not sell or rent personal information. We share only what is needed with trusted service providers, such as delivery partners and secure infrastructure providers, to complete and support your order." },
  { title: "Payments and security", body: "Payment processing is handled through the selected payment method. We do not intentionally store your full financial credentials. We use access controls and secure infrastructure, but no online service can guarantee absolute security." },
  { title: "Cookies and local storage", body: "The store uses browser storage to remember cart contents and preferences. This helps the shopping experience work across pages. You can clear browser storage, although doing so may remove saved cart contents." },
  { title: "Your choices and rights", body: "You can request access to, correction of, or deletion of your personal information. You can also opt out of optional marketing messages. Contact us at kmafoods22@gmail.com to make a request." },
  { title: "Contact and updates", body: "For privacy questions, contact kmafoods22@gmail.com. We may update this policy when our services or legal obligations change; the latest date will be shown at the top of this page." },
];

export default function PrivacyPage() {
  return <InfoPage eyebrow="Your privacy" title="Privacy Policy" intro="A clear explanation of what information KMA uses and how we protect the shopping experience." updated="August 2026" sections={sections} contactLabel="Have a privacy question?" />;
}
