import { Link } from 'react-router-dom';

export default function ProductCard({ product, index = 0 }) {
  const stockColor = product.stock > 10 ? 'text-green-600 bg-green-50' : product.stock > 0 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
  const stockLabel = product.stock > 10 ? 'Tersedia' : product.stock > 0 ? `Sisa ${product.stock}` : 'Habis';

  return (
    <Link
      to={`/products/${product.id_product}`}
      className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 card-hover animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center overflow-hidden relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <span className="text-5xl group-hover:animate-float transition-transform">🥬</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-red-500 px-3 py-1 rounded-full">Habis</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors duration-200 line-clamp-1">{product.name}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${stockColor} transition-colors`}>{stockLabel}</span>
        </div>
        {product.category && <p className="text-xs text-gray-400 mb-2">{product.category.name}</p>}
        <div className="flex items-center justify-between">
          <p className="text-primary-700 font-bold text-lg">Rp {product.price?.toLocaleString('id-ID')}</p>
          <span className="text-xs text-gray-300 group-hover:text-primary-400 transition-colors duration-300">Lihat →</span>
        </div>
      </div>
    </Link>
  );
}
