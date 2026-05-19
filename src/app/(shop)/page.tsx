import HeroSection from '@/components/home/HeroSection';
import TrendingSection from '@/components/home/TrendingSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import NewDropsSection from '@/components/home/NewDropsSection';
import CollectionBanner from '@/components/home/CollectionBanner';
import BestSellers from '@/components/home/BestSellers';
import AnimeSection from '@/components/home/AnimeSection';
import LimitedEdition from '@/components/home/LimitedEdition';
import CreatorPicks from '@/components/home/CreatorPicks';
import InstagramFeed from '@/components/home/InstagramFeed';
import TrustBadges from '@/components/home/TrustBadges';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <TrendingSection />
      <CategoryGrid />
      <CollectionBanner />
      <NewDropsSection />
      <AnimeSection />
      <BestSellers />
      <LimitedEdition />
      <CreatorPicks />
      <InstagramFeed />
    </>
  );
}
