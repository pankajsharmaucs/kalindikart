import CategoryClient from './CategoryClient';

export default async function CategoryPage({ params }) {
  // ✅ UNWRAP params properly
  const { slug } = await params;


  return <CategoryClient slug={slug} />;
}
