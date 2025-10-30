import { byId, products } from "@/lib/data";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";


export async function generateStaticParams() {
return products.map((p) => ({ id: p.id }));
}


export default function ProductDetail({ params }) {
const product = byId(params.id);
if (!product) return notFound();


return (
<>
<article className="product">
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src={product.image} alt={product.name} />
<div>
<h1>{product.name}</h1>
<p className="price">₹{product.price}</p>
<p>Minimalist, comfortable, and durable — perfect for every day.</p>
</div>
</article>


<h3>Related</h3>
<section className="grid">
{products.filter((p) => p.id !== product.id).slice(0, 3).map((p) => (
<ProductCard key={p.id} product={p} />
))}
</section>
</>
);
}