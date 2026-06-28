import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import MobileTabBar from './MobileTabBar';

const GlobalMobileNav = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return <MobileTabBar />;
};

export default GlobalMobileNav;
