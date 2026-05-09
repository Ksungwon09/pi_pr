import React, { useState } from 'react';
import { SubTabs } from '../SubTabs';
import { MonteCarlo } from '../MonteCarlo';
import { BuffonsNeedle } from '../BuffonsNeedle';

export const MonteCarloCategory: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('area');

  const tabs = [
    { id: 'area', label: 'Area Estimation' },
    { id: 'buffon', label: "Buffon's Needle" },
  ];

  return (
    <div className="flex flex-col h-full">
      <SubTabs tabs={tabs} activeTab={activeSubTab} setActiveTab={setActiveSubTab} />
      <div className="flex-1 overflow-auto">
        {activeSubTab === 'area' && <MonteCarlo />}
        {activeSubTab === 'buffon' && <BuffonsNeedle />}
      </div>
    </div>
  );
};
