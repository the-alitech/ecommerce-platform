export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title">About H.B Shoes</h1>
      <div className="mt-8 prose prose-brand max-w-none text-brand-700 leading-relaxed space-y-4">
        <p>Welcome to H.B Shoes, your premier destination for premium footwear in Pakistan. We curate quality shoes for everyday wear, style, and comfort from trusted brands.</p>
        <p>Our mission is to make premium footwear accessible to everyone with exceptional customer service, secure payments, and fast nationwide delivery.</p>
        <h2 className="font-display text-2xl font-semibold text-brand-900 mt-8">Why Choose Us?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Premium quality products from trusted brands</li>
          <li>Dynamic category system with smart filtering</li>
          <li>Multiple payment options including COD, JazzCash, and Easypaisa</li>
          <li>Easy order tracking and responsive customer support</li>
        </ul>
      </div>
    </div>
  );
}
