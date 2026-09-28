import Image from "next/image";
import Link from "next/link";
import { discoveryPack, products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { LineReveal, Reveal, Stagger } from "@/components/Reveal";
import DiscoverySetAddButton from "@/components/DiscoverySetAddButton";

export const metadata = { title: "Discovery Pack", description: "Try the full Rimara collection on skin." };

export default async function DiscoveryPackPage() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}api/allProducts`,
    // "http://localhost/rimara-admin/public/api/allProducts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000",
      },
      body: JSON.stringify({
        limit: "4",
        page: "1",
      }),
      cache: "no-store",
    }
  );

  const apiResponse = await response.json();

  const productSettings = {
    "quiet-blossom": {
      color: "#d4a0a8",
      ctx: "Explore Quiet Blossom",
    },
    "wild-air": {
      color: "#8ab0c8",
      ctx: "Explore Wild Air",
    },
    "last-light": {
      color: "#e0a040",
      ctx: "Explore Last Light",
    },
    "air-that-stays": {
      color: "#b3a469",
      ctx: "Explore Air That Stays",
    },
    "discovery-set": {
      color: "#4a4a46",
      ctx: "Explore Discovery Set",
    },
  };

  const products = (apiResponse?.products?.data || []).map((product) => ({
    ...product,
    ...(productSettings[product.product_name.toLowerCase().trim().replace(/\s+/g, '-')] || {}),
  }));

  async function getProduct() {
    // console.log('Slug =================================================================================',slug);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}api/products`,
      // "http://localhost/rimara-admin/public/api/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          product: 'Discovery Set'.replace(/-/g, " "),
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const apiResponse = await response.json();

    // console.log('Response =================================================================================', apiResponse);

    return apiResponse || null;
  }

  const product = await getProduct("quiet-blossom");

  return (
    <main>
      <section className="catalog-hero">
        <div><h1><LineReveal>Start with all four. Let one stay.</LineReveal></h1></div>
        <Reveal><div className="body-copy muted" dangerouslySetInnerHTML={{ __html: product.description }}></div></Reveal>
      </section>
      <section className="image-text">
        <Image src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(product.images)[0]}`} alt={product.product_name} width={1086} height={1448} />
        <Reveal className="image-text__copy"><p className="eyebrow">{product.occasion}</p><h2><LineReveal>{product.product_name}</LineReveal></h2><div className="body-copy" dangerouslySetInnerHTML={{ __html: product.content }}></div><DiscoverySetAddButton price={product.price} product_id={product.product_id}/></Reveal>
      </section>
      <Stagger className="product-grid">{products.map((product) => <ProductCard key={product.product_id} product={product} />)}</Stagger>
    </main>
  );
}
