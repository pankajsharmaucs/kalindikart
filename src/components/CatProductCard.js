import React from 'react';

export default function CatProductCard({ category }) {
    // Use the first image from images array, or fallback
    const imageSrc =
        category.image && category.image.length > 0
            ? `/${category.image}` // leading slash!
            : 'https://via.placeholder.com/300x200';

    return (
        <div className="col-12">
            <div className="  border-0 hover-shadow">
                <img style={{
                    width: "90%", height: "140px",
                    textAlign: "center"
                }} src={imageSrc} alt={category.category_name} />
            </div>
        </div>
    );
}
