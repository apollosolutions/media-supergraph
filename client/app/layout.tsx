import Header from "@/components/Header";
import "./globals.css";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import PollPage from "@/components/Test";

export const metadata = {
  title: "Media Supergraph",
  description: "Demo Application for Media Services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>
          <Header />
          <PollPage></PollPage>
          {children}
        </ApolloWrapper>
      </body>
    </html>
  );
}
