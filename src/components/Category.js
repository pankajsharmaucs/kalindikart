'use client';

import React, { useEffect, useState } from 'react';
import CatProductCard from './CatProductCard';

export default function Category() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch('/api/category')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        console.log('Updated categories:', categories);
    }, [categories]);

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-xl-6 col-lg-6 col-12">
                    {categories.length === 0 ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="row g-3">
                            {categories.map((p) => (
                                <div key={p.id} className="col-12 col-md-6 col-lg-4 mb-4">
                                    <div className="primaryBgColor w-100 p-3" style={{
                                        width: "150px", height: "170px", borderRadius:"100%",
                                        textAlign: "center"
                                    }}>
                                        <CatProductCard category={p} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
