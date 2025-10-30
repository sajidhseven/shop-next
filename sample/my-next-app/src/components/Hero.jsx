import Link from "next/link";


export default function Hero() {
return (
<section className="hero">
<div className="hero-inner">
<h1>Shop simple. Ship fast.</h1>
<p>Quality basics for everyday life. Free shipping over ₹999.</p>
<Link className="btn" href="/products">Start shopping</Link>
</div>
</section>
);
}