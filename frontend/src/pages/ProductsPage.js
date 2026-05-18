import { useParams, useSearchParams } from 'react-router-dom';
import ProductList from '../components/ProductList';

function ProductsPage() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const search = searchParams.get('search') || searchParams.get('q') || params.categoryName || '';
  const category = searchParams.get('category') || params.categoryName || 'all';

  return <ProductList initialSearch={search} initialCategory={category} headline="Search Live Tech Products" />;
}

export default ProductsPage;
