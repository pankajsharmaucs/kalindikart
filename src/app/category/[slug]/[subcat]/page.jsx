import SubCategoryClient from './SubCategoryClient';

export default async function CategoryPage({ params }) {
  // ✅ UNWRAP params properly
  const { slug } = await params;


  return <SubCategoryClient slug={slug} />;
}
