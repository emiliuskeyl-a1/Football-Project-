import React, { useState } from 'react';
import { ConceptLibrary, ConceptDefinition } from '../types';

interface ConceptManagerProps {
  isOpen: boolean;
  onClose: () => void;
  concepts: ConceptLibrary;
  allRoutes: string[];
  onAddConcept: (name: string, concept: ConceptDefinition) => void;
  onDeleteConcept: (name: string) => void;
}

export const ConceptManager: React.FC<ConceptManagerProps> = ({
  isOpen,
  onClose,
  concepts,
  allRoutes,
  onAddConcept,
  onDeleteConcept,
}) => {
  const [newConceptName, setNewConceptName] = useState('');
  const [zRoute, setZRoute] = useState(allRoutes[0] || '');
  const [hRoute, setHRoute] = useState(allRoutes[0] || '');
  const [sRoute, setSRoute] = useState(allRoutes[0] || '');
  const [wRoute, setWRoute] = useState(allRoutes[0] || '');
  const [category, setCategory] = useState<ConceptDefinition['category']>('two');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoutes = [zRoute, hRoute, sRoute, wRoute].slice(0, category === 'one' ? 1 : category === 'two' ? 2 : category === 'three' ? 3 : 4);
    
    onAddConcept(newConceptName.trim(), { routes: newRoutes, category });
    
    // Reset form
    setNewConceptName('');
    setCategory('two');
    setZRoute(allRoutes[0] || '');
    setHRoute(allRoutes[0] || '');
    setSRoute(allRoutes[0] || '');
    setWRoute(allRoutes[0] || '');
  };

  const sortedConcepts = Object.entries(concepts).sort((a, b) => a[0].localeCompare(b[0]));

  const categoryLabels: Record<ConceptDefinition['category'], string> = {
    one: '1 Receiver (ISO)',
    two: '2 Receivers',
    three: '3 Receivers',
    full: 'Full Field (4 Receivers)',
  };

  const getVisibleRouteSelectors = () => {
    switch(category) {
        case 'one': return 1;
        case 'two': return 2;
        case 'three': return 3;
        case 'full': return 4;
        default: return 2;
    }
  }
  const visibleSelectors = getVisibleRouteSelectors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-400">Concept Manager</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </header>

        <div className="p-6 flex-grow overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Add New Concept */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-yellow-300 border-b border-gray-700 pb-2">Add New Concept</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <FormInput id="concept-name" label="Concept Name" value={newConceptName} onChange={setNewConceptName} placeholder="e.g., Dagger" required />
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Concept Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as ConceptDefinition['category'])} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500">
                    {Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </div>

              <p className="text-sm text-gray-400">Define routes from right to left (Spread Form):</p>
              
              {visibleSelectors >= 1 && <RouteSelect label="Far Right (Z)" value={zRoute} onChange={setZRoute} allRoutes={allRoutes} />}
              {visibleSelectors >= 2 && <RouteSelect label="Right Slot (H)" value={hRoute} onChange={setHRoute} allRoutes={allRoutes} />}
              {visibleSelectors >= 3 && <RouteSelect label="Left Slot (S)" value={sRoute} onChange={setSRoute} allRoutes={allRoutes} />}
              {visibleSelectors >= 4 && <RouteSelect label="Far Left (W)" value={wRoute} onChange={setWRoute} allRoutes={allRoutes} />}
              
              <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Add Concept
              </button>
            </form>
          </div>

          {/* Column 2: Existing Concepts */}
          <div className="bg-gray-900 p-4 rounded-lg flex flex-col">
             <h3 className="text-xl font-semibold mb-4 text-yellow-300 border-b border-gray-700 pb-2">Existing Concepts</h3>
             <ul className="space-y-2 flex-grow overflow-y-auto pr-2">
                {/* FIX: Cast sortedConcepts to the correct type to resolve type inference issue. */}
                {(sortedConcepts as [string, ConceptDefinition][]).map(([name, concept]) => (
                    <li key={name} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-bold text-blue-400">{name}</p>
                            <p className="text-xs text-gray-400 capitalize">{concept.category} - {concept.routes.join(', ')}</p>
                        </div>
                        <button onClick={() => onDeleteConcept(name)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded-md transition-colors">
                            Delete
                        </button>
                    </li>
                ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for form inputs
const FormInput: React.FC<{id: string, label: string, value: string, onChange: (val: string) => void, type?: string, placeholder?: string, required?: boolean}> = 
({id, label, value, onChange, type = 'text', placeholder = '', required = false}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);


// Helper component for route selection dropdown
const RouteSelect: React.FC<{label: string, value: string, onChange: (val: string) => void, allRoutes: string[]}> = ({label, value, onChange, allRoutes}) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
        >
            {allRoutes.map(route => (
                <option key={route} value={route}>{route}</option>
            ))}
        </select>
    </div>
);