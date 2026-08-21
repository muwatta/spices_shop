"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "kma-install-prompt-dismissed";
const INSTALLED_KEY = "kma-install-completed";

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));

    if (
      isStandalone ||
      localStorage.getItem(DISMISS_KEY) === "true"
    ) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "true");
      setVisible(false);
      setInstallEvent(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!visible || !installEvent) return null;

  async function install() {
    await installEvent?.prompt();
    const choice = await installEvent?.userChoice;
    if (choice?.outcome === "accepted") {
      localStorage.setItem(INSTALLED_KEY, "true");
      setVisible(false);
    }
    setInstallEvent(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setVisible(false);
    setInstallEvent(null);
  }

  return (
    <aside className="install-prompt" role="dialog" aria-label="Install KMA Spices">
      <div className="install-prompt__copy">
        <strong>Install KMA Spices</strong>
        <span>Shop faster from your home screen.</span>
      </div>
      <button className="install-prompt__action" type="button" onClick={install}>Install</button>
      <button className="install-prompt__close" type="button" onClick={dismiss} aria-label="Dismiss install prompt">&times;</button>
    </aside>
  );
}