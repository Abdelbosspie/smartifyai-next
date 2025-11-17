"use client";
import { useEffect } from "react";

export default function SmartifyAIWidget() {
  useEffect(() => {
    window.smartifyAI = "6914d221b0e2d854e37a9752";
    window.smartifyPos = "bottom-right";

    const s = document.createElement("script");
    s.src =
      "https://ta-01ka8yvgbtfs7mr555y0afhsze-5173.wo-pnl6hpppoe7i6q2q5veshj0zp.w.modal.host/functions/widgetEmbed?agentId=6914d221b0e2d854e37a9752&position=bottom-right";
    s.defer = true;
    document.body.appendChild(s);
  }, []);

  return null;
}