'use client';

import { RestaurantCardsInner } from '@/app/restaurantcardspage/RestaurantCardsInner';

export default function BrowseRestaurantsView() {
  return (
    <div style={{ marginInline: '-1.5rem', marginTop: '-1.5rem' }}>
      <RestaurantCardsInner />
    </div>
  );
}
