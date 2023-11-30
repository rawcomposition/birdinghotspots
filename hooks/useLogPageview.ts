import React from "react";
import { auth } from "lib/firebaseAuth";

type Props = {
  locationId?: string;
  stateCode?: string;
  countyCode?: string;
  countryCode?: string;
  entity: string;
  isBot?: boolean;
};

export default function useLogPageview({ isBot, ...props }: Props) {
  const propsRef = React.useRef(props);
  propsRef.current = props;

  React.useEffect(() => {
    const logPageview = async () => {
      const { locationId, stateCode, countyCode, countryCode, entity } = propsRef.current;

      const isDev = process.env.NODE_ENV === "development";
      const loggedIn = auth.currentUser;
      if (isDev || loggedIn || isBot) return;

      try {
        const res = await fetch("/api/log-pageview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locationId,
            stateCode,
            countyCode,
            countryCode,
            entity,
          }),
        });

        await res.json();
      } catch (error: any) {
        console.error("Error logging pageview:", error.message);
      }
    };
    const timeout = setTimeout(logPageview, 2500);
    return () => clearTimeout(timeout);
  }, []);
}
