import React, { useState } from 'react';
import { SubTabs } from '../SubTabs';
import { Archimedes } from '../Archimedes';

export const GeometricCategory: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('archimedes');

  const tabs = [
    { id: 'archimedes', label: 'Archimedes Polygons' },
  ];

  return (
    <div className="flex flex-col h-full">
      <SubTabs tabs={tabs} activeTab={activeSubTab} setActiveTab={setActiveSubTab} />
      <div className="flex-1 overflow-auto">
        {activeSubTab === 'archimedes' && <Archimedes />}
      </div>
    </div>
  );
};
