'use client';

import { RestaurantCardsInner } from '@/app/restaurantcardspage/RestaurantCardsInner';

export default function BrowseRestaurantsView() {
  return (
    <div>
      <RestaurantCardsInner embedded />
    </div>
  );
}
