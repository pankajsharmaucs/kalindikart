export const products = [
  {
    id: 10,
    name: "Brass Ganesha Idol",
    price: 1999,
    originalPrice: 2500,
    images: ["main/Home/ganesh idol.png"], // relative to /public
    isNew: true,
    rating: 4.8,
    reviewCount: 120,
  },
  {
    id: 11,
    name: "Dancing Shiva Murti",
    price: 4200,
    originalPrice: 5250,
    images: ["main/Home/dancing-shiva.jpg"],
    discount: 20,
    rating: 5.0,
    reviewCount: 55,
  },
  {
    id: 12,
    name: "Brass Buddha Statue",
    price: 7800,
    originalPrice: 7800,
    images: ["main/Home/brass-buddha.jpg"], // updated path
    isNew: false,
    rating: 4.7,
    reviewCount: 230,
  },
  {
    id: 13,
    name: "Brass Diya Set",
    price: 1150,
    originalPrice: 1150,
    images: ["main/Home/brass-diya.jpg"],
    rating: 4.9,
    reviewCount: 45,
  },
].map((p) => ({
  ...p,
  slug: p.name.toLowerCase().replace(/\s+/g, "-"),
  category: p.name.split(" ")[0].toLowerCase(),
}));
