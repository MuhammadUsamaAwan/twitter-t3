import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "../styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <main className="grid min-h-screen justify-center bg-gray-900">
        <Component {...pageProps} />
      </main>
      <ReactQueryDevtools />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
