import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";
import { CartProvider } from "@/components/CartProvider";

export const metadata = {
  title: {
    default: "Rimara | Own the Air",
    template: "%s | Rimara"
  },
  description: "Fine fragrance shaped by air, time and memory.",
  icons: {
    icon: "/assets/images/homepage/favicon.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <MotionProvider>
            <Header />
            {children}
            <Footer />
          </MotionProvider>
        </CartProvider>
      </body>
    </html>
  );
}
