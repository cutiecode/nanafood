"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Settings = {
  restaurantName: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  taxRate: number;
  instagram: string;
  facebook: string;
  whatsapp: string;
  tiktok: string;
};

const defaultSettings: Settings = {
  restaurantName: "Nana-AfricanFood",
  email: "hello@nanafood.com",
  phone: "+1 (720) 000-0000",
  address: "Denver, CO 80202",
  hours: "Mon–Sun · 11am – 10pm",
  taxRate: 8.81,
  instagram: "",
  facebook: "",
  whatsapp: "",
  tiktok: "",
};

const SettingsContext = createContext<Settings>(defaultSettings);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(console.error);
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}