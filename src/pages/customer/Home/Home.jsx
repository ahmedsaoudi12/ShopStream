import HeroSection from '../../../components/customer/HeroSection/HeroSection';
import TopCategories from '../../../components/customer/TopCategories/TopCategories';
import FeaturedProducts from '../../../components/customer/FeaturedProducts/FeaturedProducts';
import Newsletter from '../../../components/customer/Newsletter/Newsletter';

function Home() {
  return (
    <main className="home-page">
      <HeroSection />
      <TopCategories />
      <FeaturedProducts />
      <Newsletter />
    </main>
  );
}

export default Home;