'use client';

import { AppRoute } from '@/app/lib/dining-shell';
import BrowseRestaurantsView from '@/app/views/BrowseRestaurantsView';
import MyPantryView from '@/app/views/MyPantryView';
import CreateMealSchemeView from '@/app/views/CreateMealSchemeView';
import SavedMealsView from '@/app/views/SavedMealsView';
import DineRunwayView from '@/app/views/DineRunwayView';
import AutopilotView from '@/app/views/AutopilotView';
import PublicItemsView from '@/app/views/PublicItemsView';
import SearchMealsView from '@/app/views/SearchMealsView';
import MyPhotosView from '@/app/views/MyPhotosView';
import MaisonView from '@/app/views/MaisonView';
import FutureTopicsView from '@/app/views/FutureTopicsView';
import ProfileView from '@/app/views/ProfileView';

interface ContentRouterProps {
  route: AppRoute;
}

export default function ContentRouter({ route }: ContentRouterProps) {
  switch (route) {
    case 'home':                return <BrowseRestaurantsView />;
    case 'my-pantry':           return <MyPantryView />;
    case 'create-meal-scheme':  return <CreateMealSchemeView />;
    case 'saved-meals':         return <SavedMealsView />;
    case 'feed':                return <DineRunwayView />;
    case 'autopilot':           return <AutopilotView />;
    case 'public-items':        return <PublicItemsView />;
    case 'search-meals':        return <SearchMealsView />;
    case 'my-photos':           return <MyPhotosView />;
    case 'maison':              return <MaisonView />;
    case 'future-topics':       return <FutureTopicsView />;
    case 'profile':
    case 'profile-settings':    return <ProfileView />;
    default:                    return <BrowseRestaurantsView />;
  }
}
