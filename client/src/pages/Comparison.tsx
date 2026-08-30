import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ComparisonPage from '../components/ComparisonPage';
import { COMPARISONS } from '../data/comparisons';

export default function Comparison() {
  const { slug } = useParams();
  const config = COMPARISONS[slug];
  if (!config) return <Navigate to="/emlak-crm" replace />;
  return <ComparisonPage config={config} slug={slug} />;
}

