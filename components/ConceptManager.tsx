
import React, { useState, useRef, MouseEvent, useMemo } from 'react';
import { ConceptLibrary, ConceptDefinition, MotionLibrary, RoutePath, Point, RouteLibrary, Play } from '../types';
import { FORMATIONS } from '../constants';
import { PlayDiagram } from './PlayDiagram';


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

type ViewingItem = {
  type: 'concept' | 'motion' | 'route';
  name: string;
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
  const [viewingItem, setViewingItem] = useState<ViewingItem | null>(null);
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
                onViewConcept={(name) => setViewingItem({ type: 'concept', name })}
            />
           )}
           {activeTab === 'motions' && (
             <MotionEditor 
                motions={motions}
                onAddMotion={onAddMotion}
                onDeleteMotion={onDeleteMotion}
                onViewMotion={(name) => setViewingItem({ type: 'motion', name })}
             />
           )}
           {activeTab === 'routes' && (
                <RouteEditor
                    routes={routes}
                    onAddRoute={onAddRoute}
                    onDeleteRoute={onDeleteRoute}
                    onViewRoute={(name) => setViewingItem({ type: 'route', name })}
                />
           )}
        </div>
      </div>
      {viewingItem && (
        <ItemViewer
            item={viewingItem}
            onClose={() => setViewingItem(null)}
            conceptLibrary={concepts}
            motionLibrary={motions}
            routeLibrary={routes}
        />
      )}
    </div>
  );
};

const getMirroredPath = (path: RoutePath): RoutePath => {
    return path.map(point => ({ x: -point.x, y: point.y }));
};

// --- Item Viewer Modal ---
const ItemViewer: React.FC<{item: ViewingItem, onClose: () => void, conceptLibrary: ConceptLibrary, motionLibrary: MotionLibrary, routeLibrary: RouteLibrary}> = 
({ item, onClose, conceptLibrary, motionLibrary, routeLibrary }) => {
    
    const studyPlay: Play | null = useMemo(() => {
        if (!item.name) return null;

        switch (item.type) {
            case 'route': {
                const path = routeLibrary[item.name];
                if (!path) return null;
                return {
                    playcall: `Route: ${item.name}`,
                    formationName: 'Spread',
                    routes: { 'Z': { routeName: item.name, path: path } },
                    motions: [],
                };
            }
            case 'concept': {
                const concept = conceptLibrary[item.name];
                if (!concept) return null;
                // Use the first compatible formation if available, otherwise default to Spread
                const defaultFormation = (concept.compatibleFormations && concept.compatibleFormations.length > 0) 
                    ? concept.compatibleFormations[0] 
                    : 'Spread';

                const receivers = ['Z', 'H', 'S', 'W'];
                const assignments: Play['routes'] = {};
                const numRoutes = concept.routes.length;

                for (let i = 0; i < numRoutes; i++) {
                    const receiver = receivers[i];
                    const routeName = concept.routes[i];
                    if (receiver && routeName && routeLibrary[routeName]) {
                        let path = routeLibrary[routeName];
                        // Mirror for left-side receivers (S and W are indices 2 and 3)
                        if (i >= 2) {
                            path = getMirroredPath(path);
                        }
                        assignments[receiver] = { routeName, path };
                    }
                }
                return {
                    playcall: `Concept: ${item.name}`,
                    formationName: defaultFormation,
                    routes: assignments,
                    motions: [],
                };
            }
            case 'motion': {
                const motion = motionLibrary[item.name];
                if (!motion) return null;
                return {
                    playcall: `Motion: ${item.name}`,
                    formationName: 'Spread',
                    routes: {},
                    motions: [{ receiver: motion.receiver, motionName: item.name, path: motion.path }]
                };
            }
            default:
                return null;
        }
    }, [item, routeLibrary, conceptLibrary, motionLibrary]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col p-4 border border-blue-500" onClick={(e) => e.stopPropagation()}>
                 <header className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-yellow-300 capitalize">
                        Preview: {item.type} - {item.name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none px-2">&times;</button>
                </header>
                <div className="w-full aspect-[16/10] bg-gray-900 rounded-md">
                    {studyPlay ? <PlayDiagram play={studyPlay} /> : <div className="flex items-center justify-center h-full">Could not display item.</div>}
                </div>
            </div>
        </div>
    )
}


// --- Concept Editor Component ---
interface ConceptEditorProps {
    concepts: ConceptLibrary;
    allRoutes: string[];
    onAddConcept: ConceptManagerProps['onAddConcept'];
    onDeleteConcept: (name: string) => void;
    onViewConcept: (name: string) => void;
}
const ConceptEditor: React.FC<ConceptEditorProps> = ({ concepts, allRoutes, onAddConcept, onDeleteConcept, onViewConcept }) => {
    const [newConceptName, setNewConceptName] = useState('');
    const [zRoute, setZRoute] = useState(allRoutes[0] || '');
    const [hRoute, setHRoute] = useState(allRoutes[0] || '');
    const [sRoute, setSRoute] = useState(allRoutes[0] || '');
    const [wRoute, setWRoute] = useState(allRoutes[0] || '');
    const [category, setCategory] = useState<ConceptDefinition['category']>('two');
    const [compatibleFormations, setCompatibleFormations] = useState<string[]>([]);

    const allFormations = Object.keys(FORMATIONS);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newRoutes = [zRoute, hRoute, sRoute, wRoute].slice(0, category === 'one' ? 1 : category === 'two' ? 2 : category === 'three' ? 3 : 4);
        onAddConcept(newConceptName.trim(), { 
            routes: newRoutes, 
            category,
            compatibleFormations: compatibleFormations.length > 0 ? compatibleFormations : undefined
        });
        setNewConceptName('');
        setCompatibleFormations([]);
    };
    
    const toggleFormation = (fmt: string) => {
        setCompatibleFormations(prev => 
            prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
        );
    }

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
                
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Compatible Formations (Optional):</label>
                    <p className="text-xs text-gray-500">If none selected, works with all.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-700 p-2 rounded-md max-h-32 overflow-y-auto">
                        {allFormations.map(fmt => (
                            <label key={fmt} className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={compatibleFormations.includes(fmt)} 
                                    onChange={() => toggleFormation(fmt)}
                                    className="rounded border-gray-500 text-blue-500 focus:ring-blue-500 bg-gray-800"
                                />
                                <span className="text-xs text-white">{fmt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Save Concept</button>
                </form>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-yellow-300 border-b border-gray-700 pb-2">Existing Concepts</h3>
                <ul className="space-y-2 flex-grow overflow-y-auto pr-2 max-h-[55vh]">
                {(sortedConcepts as [string, ConceptDefinition][]).map(([name, concept]) => (
                    <li key={name} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                    <div className="flex-grow pr-2">
                        <p className="font-bold text-blue-400">{name}</p>
                        <p className="text-xs text-gray-400 capitalize">{concept.category} - {concept.routes.join(', ')}</p>
                         {concept.compatibleFormations && concept.compatibleFormations.length > 0 && (
                            <p className="text-[10px] text-gray-500 mt-1">
                                Formations: {concept.compatibleFormations.join(', ')}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center space-x-6 flex-shrink-0">
                        <IconButton onClick={() => onViewConcept(name)} title="View Concept">
                            <EyeIcon />
                        </IconButton>
                        <button onClick={() => onDeleteConcept(name)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded-md transition-colors">Delete</button>
                    </div>
                    </li>
                ))}
                </ul>
            </div>
        </div>
    );
};

// --- Motion Editor Component ---
interface MotionEditorProps extends Pick<ConceptManagerProps, 'motions' | 'onAddMotion' > {
    onDeleteMotion: (name: string) => void;
    onViewMotion: (name: string) => void;
}
const MotionEditor: React.FC<MotionEditorProps> = ({ motions, onAddMotion, onDeleteMotion, onViewMotion }) => {
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
                 <div className="flex items-center space-x-6">
                    <IconButton onClick={() => onViewMotion(name)} title="View Motion">
                        <EyeIcon />
                    </IconButton>
                    <button onClick={() => onDeleteMotion(name)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded-md transition-colors">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
};


// --- Route Editor Component ---
interface RouteEditorProps extends Pick<ConceptManagerProps, 'routes' | 'onAddRoute'> {
    onDeleteRoute: (name: string) => void;
    onViewRoute: (name: string) => void;
}
const RouteEditor: React.FC<RouteEditorProps> = ({ routes, onAddRoute, onDeleteRoute, onViewRoute }) => {
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
        const relativeY = -transformedPoint.y; // Invert Y-axis for drawing
        setCurrentPath(prev => [...prev, { x: relativeX, y: relativeY }]);
    };
    
    const handleSaveRoute = () => {
        if (!newRouteName.trim() || currentPath.length === 0) {
            alert('Please provide a name and draw a path for the route.');
            return;
        }
        // Always starts at 0,0 (LOS)
        const finalPath = [{ x: 0, y: 0 }, ...currentPath];
        onAddRoute(newRouteName.trim(), finalPath);
        setNewRouteName('');
        setCurrentPath([]);
    };

    const handleEditRoute = (name: string) => {
        const path = routes[name];
        if (path) {
            setNewRouteName(name);
            // Remove the first point (0,0) as the editor implies it, and the drawer adds relative points
            setCurrentPath(path.slice(1)); 
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-4 rounded-lg space-y-4">
                <h3 className="text-xl font-semibold text-yellow-300 border-b border-gray-700 pb-2">Add / Edit Route</h3>
                <FormInput id="route-name" label="Route Name" value={newRouteName} onChange={setNewRouteName} placeholder="e.g., Deep Corner" required />
                <p className="block text-sm font-medium text-gray-300">Click on the field to draw the path (starts from line of scrimmage).</p>
                <div className="w-full aspect-square bg-blue-900/50 border-2 border-dashed border-gray-600 rounded-lg cursor-crosshair">
                    <svg ref={svgRef} className="w-full h-full" viewBox={`${VIEWBOX.x} ${-VIEWBOX.height + VIEWBOX.y} ${VIEWBOX.width} ${VIEWBOX.height}`} onClick={handleFieldClick}>
                        {/* Field Markings */}
                        <line x1="0" y1={-VIEWBOX.height} x2="0" y2={VIEWBOX.y} stroke="#4b5563" strokeWidth="0.5" />
                        {Array.from({ length: 9 }).map((_, i) => (
                            <line key={i} x1={VIEWBOX.x} y1={-i * 5} x2={VIEWBOX.x + VIEWBOX.width} y2={-i * 5} stroke="#4b5563" strokeWidth="0.5" strokeDasharray="1 2" />
                        ))}
                        <circle cx="0" cy="0" r="1.5" className="fill-yellow-300" />
                        {currentPath.length > 0 && (
                            <polyline points={`0,0 ${currentPath.map(p => `${p.x},${-p.y}`).join(' ')}`} className="fill-none stroke-yellow-300" strokeWidth="1" />
                        )}
                    </svg>
                </div>
                <div className="flex space-x-2">
                    <button onClick={handleSaveRoute} className="flex-grow bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        {routes[newRouteName] ? 'Update Route' : 'Save Route'}
                    </button>
                    <button onClick={() => { setCurrentPath([]); setNewRouteName(''); }} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Clear</button>
                </div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-yellow-300 border-b border-gray-700 pb-2">Existing Routes</h3>
                <ul className="space-y-2 flex-grow overflow-y-auto pr-2 max-h-[55vh]">
                    {sortedRoutes.map(([name, _]) => (
                        <li key={name} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                            <p className="font-bold text-blue-400">{name}</p>
                            <div className="flex items-center space-x-6">
                                <IconButton onClick={() => onViewRoute(name)} title="View Route">
                                    <EyeIcon />
                                </IconButton>
                                <IconButton onClick={() => handleEditRoute(name)} title="Edit Route">
                                    <PencilIcon />
                                </IconButton>
                                <button onClick={() => onDeleteRoute(name)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded-md transition-colors">Delete</button>
                            </div>
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

const IconButton: React.FC<{onClick: () => void, title: string, children: React.ReactNode}> = ({ onClick, title, children }) => (
    <button onClick={onClick} title={title} className="p-1.5 rounded-md text-gray-400 bg-gray-700 hover:bg-gray-600 hover:text-white transition-colors">
        {children}
    </button>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);
