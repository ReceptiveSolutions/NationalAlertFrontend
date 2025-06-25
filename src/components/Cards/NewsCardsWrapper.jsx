import React from 'react';
import FeaturedCard from './FeaturedCard';
import TrendingCard from './TrendingCard';
import LatestCard from './LatestCard';

const NewsCard = ({ type = 'normal', ...props }) => {
  switch (type) {
    case 'sidebar':
      return <TrendingCard {...props} />;
    case 'long':
      return <FeaturedCard {...props} />;
    default:
      return <LatestCard {...props} />;
  }
};

export default NewsCard;
