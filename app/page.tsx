import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import MenuSection from "@/app/components/MenuSection";
import CartSidebar from "@/app/components/CartSidebar";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden" style={{ background: "#FAF6F0" }}>
      <Navbar />
      <Hero />
      <MenuSection />
      <CartSidebar />
      <Footer />
    </main>
  );
}