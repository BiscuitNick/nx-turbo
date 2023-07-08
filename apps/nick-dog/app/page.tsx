'use client';

import React from 'react';
import { NickDogHomePage } from '@biscuitnick/biscuit-ui';

const navItems = [
  { name: 'Projects', href: '/projects' },
  { name: 'Contact', href: '/contact' },
];

export default function Home() {
  return (
    <NickDogHomePage
      title={'NICK.DOG'}
      description={['Web | Games | Apps', 'Design & Development']}
      navItems={navItems}
      gitHubUrl={'https://github.com/BiscuitNick/nx-biscuit'}
    />
  );
}
