import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ComparisonPage from '../components/ComparisonPage';
import { COMPARISONS } from '../data/comparisons';

export default function Comparison({ slug: fixedSlug }) {
  const { slug: routeSlug } = useParams();
  const slug = fixedSlug || routeSlug;
  const config = COMPARISONS[slug];
  if (!config) return <Navigate to="/emlak-crm" replace />;
  return <ComparisonPage config={config} slug={slug} />;
}
