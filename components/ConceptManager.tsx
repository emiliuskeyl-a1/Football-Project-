import React, { useState, useRef, MouseEvent } from 'react';
import { ConceptLibrary, ConceptDefinition, MotionLibrary, RoutePath, Point, RouteLibrary } from '../types';
import { FORMATIONS } from '../constants';


interface ConceptManagerProps {
  isOpen: boolean;
  onClose: () => void;
  concepts: ConceptLibrary;
  motions: MotionLibrary;
  routes: RouteLibrary;
  onAddConcept: (name: string, concept: ConceptDefinition) => void;
  onDeleteConcept: (name: string) => void;
  onAddMotion: (name: string, path: RoutePath, receiver: string) => void;
  onDeleteMotion: (name: string) => void;
  onAddRoute: (name: string, path: RoutePath) => void;
  onDeleteRoute: (name: string) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ConceptManager: React.FC<ConceptManagerProps> = ({
  isOpen,
  onClose,
  concepts,
  motions,
  routes,
  onAddConcept,
  onDeleteConcept,
  onAddMotion,
  onDeleteMotion,
  onAddRoute,
  onDeleteRoute,
  onExport,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'motions' | 'routes'>('concepts');
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-blue-400">Playbook Manager</h2>
            <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
                <TabButton isActive={activeTab === 'concepts'} onClick={() => setActiveTab('concepts')}>Concepts</TabButton>
                <TabButton isActive={activeTab === 'motions'} onClick={() => setActiveTab('motions')}>Motions</TabButton>
                <TabButton isActive={activeTab === 'routes'} onClick={() => setActiveTab('routes')}>Routes</TabButton>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
                type="file"
                ref={importInputRef}
                onChange={onImport}
                className="hidden"
                accept=".json"
            />
            <button onClick={handleImportClick} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                Import
            </button>
            <button onClick={onExport} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                Export
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none px-2">&times;</button>
          </div>
        </header>

        <div className="p-6 flex-grow overflow-y-auto">
           {activeTab === 'concepts' && (
             <ConceptEditor 
                concepts={concepts} 
                allRoutes={Object.keys(routes)}
                onAddConcept={onAddConcept} 
                onDeleteConcept={onDeleteConcept} 
            />
           )}
           {activeTab === 'motions' && (
             <MotionEditor 
                motions={motions}
                onAddMotion={onAddMotion}
                onDeleteMotion={onDeleteMotion}
             />
           )}
           {activeTab === 'routes' && (
                <RouteEditor
                    routes={routes}
                    onAddRoute={onAddRoute}
                    onDeleteRoute={onDeleteRoute}
                />
           )}
        </div>
      </div>
    </div>
  );
};

// --- Concept Editor Component ---
const ConceptEditor: React.FC<{concepts: ConceptLibrary, allRoutes: string[], onAddConcept: ConceptManagerProps['onAddConcept'], onDeleteConcept: ConceptManagerProps['onDeleteConcept']}> = ({ concepts, allRoutes, onAddConcept, onDeleteConcept }) => {
    const [newConceptName, setNewConceptName] = useState('');
    const [zRoute, setZRoute] = useState(allRoutes[0] || '');
    const [hRoute, setHRoute] = useState(allRoutes[0] || '');
    const [sRoute, setSRoute] = useState(allRoutes[0] || '');
    const [wRoute, setWRoute] = useState(allRoutes[0] || '');
    const [category, setCategory] = useState<ConceptDefinition['category']>('two');

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newRoutes = [zRoute, hRoute, sRoute, wRoute].slice(0, category === 'one' ? 1 : category === 'two' ? 2 : category === 'three' ? 3 : 4);
        onAddConcept(newConceptName.trim(), { routes: newRoutes, category });
        setNewConceptName('');
    };

    const sortedConcepts = Object.entries(concepts).sort((a, b) => a[0].localeCompare(b[0]));
    const categoryLabels: Record<ConceptDefinition['category'], string> = { one: '1 Receiver (ISO)', two: '2 Receivers', three: '3 Receivers', full: 'Full Field (4 Receivers)' };
    const visibleSelectors = category === 'one' ? 1 : category === 'two' ? 2 : category === 'three' ? 3 : 4;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-yellow-300 border-b border-gray-700 pb-2">Add New Concept</h3>
                <form onSubmit={handleAddSubmit} className="space-y-4">
                <FormInput id="concept-name" label="Concept Name" value={newConceptName} onChange={setNewConceptName} placeholder="e.g., Dagger" required />
                <FormSelect id="category-select" label="Concept Category" value={category} onChange={(val) => setCategory(val as any)}>
                    {Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </FormSelect>
                <p className="text-sm text-gray-400">Define routes from right to left (Spread Form):</p>
                {visibleSelectors >= 1 && <RouteSelect label="Far Right (Z)" value={zRoute} onChange={setZRoute} allRoutes={allRoutes} />}
                {visibleSelectors >= 2 && <RouteSelect label="Right Slot (H)" value={hRoute} onChange={setHRoute} allRoutes={allRoutes} />}
                {visibleSelectors >= 3 && <RouteSelect label="Left Slot (S)" value={sRoute} onChange={setSRoute} allRoutes={allRoutes} />}
                {visibleSelectors >= 4 && <RouteSelect label="Far Left (W)" value={wRoute} onChange={setWRoute} allRoutes={allRoutes} />}
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Add Concept</button>
                </form>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-yellow-300 border-b border-gray-700 pb-2">Existing Concepts</h3>
                <ul className="space-y-2 flex-grow overflow-y-auto pr-2 max-h-[55vh]">
                {(sortedConcepts as [string, ConceptDefinition][]).map(([name, concept]) => (
                    <li key={name} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                    <div>
                        <p className="font-bold text-blue-400">{name}</p>
                        <p className="text-xs text-gray-400 capitalize">{concept.category} - {concept.routes.join(', ')}</p>
                    </div>
                    <button onClick={() => onDeleteConcept(name)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded-md transition-colors">Delete</button>
                    </li>
                ))}
                </ul>
            </div>
        </div>
    );
};

// --- Motion Editor Component ---
const MotionEditor: React.FC<Pick<ConceptManagerProps, 'motions' | 'onAddMotion' | 'onDeleteMotion'>> = ({ motions, onAddMotion, onDeleteMotion }) => {
    const [newMotionName, setNewMotionName] = useState('');
    const [selectedReceiver, setSelectedReceiver] = useState<string | null>(null);
    const [currentPath, setCurrentPath] = useState<RoutePath>([]);
    const svgRef = useRef<SVGSVGElement>(null);

    const baseFormation = FORMATIONS['Spread']; // Use spread for the editor
    const sortedMotions = Object.entries(motions).sort((a,b) => a[0].localeCompare(b[0]));
    
    const handleFieldClick = (e: MouseEvent<SVGSVGElement>) => {
        if (!selectedReceiver || !svgRef.current) return;

        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;

        const transformedPoint = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
        const YARD_SCALE = 10; // Simplified scale for editor
        const startPos = baseFormation[selectedReceiver];

        const relativeX = (transformedPoint.x - (startPos.x * 5)) / YARD_SCALE;
        const relativeY = ((startPos.y * 5) - transformedPoint.y) / YARD_SCALE;

        setCurrentPath(prev => [...prev, { x: relativeX, y: relativeY }]);
    };
    
    const handleSaveMotion = () => {
        if (!newMotionName.trim() || !selectedReceiver || currentPath.length === 0) {
            alert('Please provide a name, select a receiver, and draw a path.');
            return;
        }
        onAddMotion(newMotionName.trim(), [{x: 0, y: 0}, ...currentPath], selectedReceiver);
        // Reset form
        setNewMotionName('');
        setSelectedReceiver(null);
        setCurrentPath([]);
    };
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Add New Motion */}
        <div className="bg-gray-900 p-4 rounded-lg space-y-4">
          <h3 className="text-xl font-semibold text-yellow-300 border-b border-gray-700 pb-2">Add New Motion</h3>
          <FormInput id="motion-name" label="Motion Name" value={newMotionName} onChange={setNewMotionName} placeholder="e.g., Zap" required />
          <div>
            <p className="block text-sm font-medium text-gray-300 mb-2">1. Select a Receiver to Motion</p>
            <div className="text-xs text-gray-400 mb-2">
                Selected: <span className="font-bold text-yellow-300">{selectedReceiver || 'None'}</span>
            </div>
            <p className="block text-sm font-medium text-gray-300 mb-2">2. Click on the field to draw the path</p>
          </div>
          <div className="w-full aspect-video bg-blue-900/50 border-2 border-dashed border-gray-600 rounded-lg">
            <svg ref={svgRef} className="w-full h-full" viewBox="0 0 500 500" onClick={handleFieldClick}>
                {Object.entries(baseFormation).map(([rec, pos]) => (
                    <circle key={rec} cx={pos.x * 5} cy={pos.y * 5} r="12" 
                        className={`cursor-pointer transition-all ${selectedReceiver === rec ? 'fill-yellow-300 stroke-white' : 'fill-blue-400 stroke-gray-900'}`}
                        strokeWidth="2" onClick={(e) => { e.stopPropagation(); setSelectedReceiver(rec); setCurrentPath([]); }} />
                ))}
                {selectedReceiver && currentPath.length > 0 && (
                    <polyline points={`
                        ${baseFormation[selectedReceiver].x * 5},${baseFormation[selectedReceiver].y * 5} 
                        ${currentPath.map(p => `${(baseFormation[selectedReceiver].x * 5) + p.x * 10},${(baseFormation[selectedReceiver].y * 5) - p.y * 10}`).join(' ')}
                    `} className="fill-none stroke-yellow-300" strokeWidth="2" strokeDasharray="4 4" />
                )}
            </svg>
          </div>
           <div className="flex space-x-2">
                <button onClick={handleSaveMotion} className="flex-grow bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Save Motion</button>
                <button onClick={() => { setNewMotionName(''); setSelectedReceiver(null); setCurrentPath([]); }} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Clear</button>
            </div>
        </div>
        {/* Column 2: Existing Motions */}
        <div className="bg-gray-900 p-4 rounded-lg flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-yellow-300 border-b border-gray-700 pb-2">Existing Motions</h3>
          <ul className="space-y-2 flex-grow overflow-y-auto pr-2 max-h-[55vh]">
            {(sortedMotions as [string, { path: RoutePath, receiver: string }][]).map(([name, motionData]) => (
              <li key={name} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                <div>
                    <p className="font-bold text-blue-400">{name}</p>
                    <p className="text-xs text-gray-400">For Receiver: <span className="font-semibold text-yellow-300">{motionData.receiver}</span></p>
                </div>
                <button onClick={() => onDeleteMotion(name)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded-md transition-colors">Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
};


// --- Route Editor Component ---
const RouteEditor: React.FC<Pick<ConceptManagerProps, 'routes' | 'onAddRoute' | 'onDeleteRoute'>> = ({ routes, onAddRoute, onDeleteRoute }) => {
    const [newRouteName, setNewRouteName] = useState('');
    const [currentPath, setCurrentPath] = useState<Point[]>([]);
    const svgRef = useRef<SVGSVGElement>(null);
    const sortedRoutes = Object.entries(routes).sort((a, b) => a[0].localeCompare(b[0]));
    const YARD_SCALE = 8;
    const VIEWBOX = { x: -25, y: -5, width: 50, height: 45 };

    const handleFieldClick = (e: MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;

        const transformedPoint = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
        const relativeX = transformedPoint.x;
        const relativeY = transformedPoint.y;
        setCurrentPath(prev => [...prev, { x: relativeX, y: relativeY }]);
    };
    
    const handleSaveRoute = () => {
        if (!newRouteName.trim() || currentPath.length === 0) {
            alert('Please provide a name and draw a path for the route.');
            return;
        }
        const finalPath = [{ x: 0, y: 0 }, ...currentPath];
        onAddRoute(newRouteName.trim(), finalPath);
        setNewRouteName('');
        setCurrentPath([]);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-4 rounded-lg space-y-4">
                <h3 className="text-xl font-semibold text-yellow-300 border-b border-gray-700 pb-2">Add New Route</h3>
                <FormInput id="route-name" label="Route Name" value={newRouteName} onChange={setNewRouteName} placeholder="e.g., Deep Corner" required />
                <p className="block text-sm font-medium text-gray-300">Click on the field to draw the path (starts from line of scrimmage).</p>
                <div className="w-full aspect-square bg-blue-900/50 border-2 border-dashed border-gray-600 rounded-lg cursor-crosshair">
                    <svg ref={svgRef} className="w-full h-full" viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.width} ${VIEWBOX.height}`} onClick={handleFieldClick}>
                        {/* Field Markings */}
                        <line x1="0" y1={VIEWBOX.y} x2="0" y2={VIEWBOX.height} stroke="#4b5563" strokeWidth="0.5" />
                        {Array.from({ length: 9 }).map((_, i) => (
                            <line key={i} x1={VIEWBOX.x} y1={i * 5} x2={VIEWBOX.width} y2={i * 5} stroke="#4b5563" strokeWidth="0.5" strokeDasharray="1 2" />
                        ))}
                        <circle cx="0" cy="0" r="1.5" className="fill-yellow-300" />
                        {currentPath.length > 0 && (
                            <polyline points={`0,0 ${currentPath.map(p => `${p.x},${p.y}`).join(' ')}`} className="fill-none stroke-yellow-300" strokeWidth="1" />
                        )}
                    </svg>
                </div>
                <div className="flex space-x-2">
                    <button onClick={handleSaveRoute} className="flex-grow bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Save Route</button>
                    <button onClick={() => setCurrentPath([])} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Clear Path</button>
                </div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-yellow-300 border-b border-gray-700 pb-2">Existing Routes</h3>
                <ul className="space-y-2 flex-grow overflow-y-auto pr-2 max-h-[55vh]">
                    {sortedRoutes.map(([name, _]) => (
                        <li key={name} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                            <p className="font-bold text-blue-400">{name}</p>
                            <button onClick={() => onDeleteRoute(name)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded-md transition-colors">Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};



// --- Shared Helper Components ---
const TabButton: React.FC<{isActive: boolean, onClick: () => void, children: React.ReactNode}> = ({ isActive, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-1 rounded-md text-sm font-bold transition-colors ${isActive ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
        {children}
    </button>
);

const FormInput: React.FC<{id: string, label: string, value: string, onChange: (val: string) => void, type?: string, placeholder?: string, required?: boolean}> = 
({id, label, value, onChange, type = 'text', placeholder = '', required = false}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const FormSelect: React.FC<{id: string, label: string, value: string, onChange: (val: string) => void, children: React.ReactNode}> = ({ id, label, value, onChange, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500">
            {children}
        </select>
    </div>
);

const RouteSelect: React.FC<{label: string, value: string, onChange: (val: string) => void, allRoutes: string[]}> = ({label, value, onChange, allRoutes}) => (
    <FormSelect id={`route-${label}`} label={label} value={value} onChange={onChange}>
        {allRoutes.map(route => <option key={route} value={route}>{route}</option>)}
    </FormSelect>
);
