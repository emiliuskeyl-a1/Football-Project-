import { Play, Formation, RoutePath, ConceptLibrary, ConceptDefinition, MotionLibrary, PlayerPosition, RouteLibrary } from '../types';
import { 
    FORMATIONS,
    PLAYS_ONE_REC,
} from '../constants';

const FORMATION_NAMES = Object.keys(FORMATIONS);
const DIRECTIONS = { 1: "31", 2: "35", 3: "49", 4: "61", 5: "51", 6: "32", 7: "36", 8: "48", 9: "62" };
const PLAY_MOTIONS = { 1: "Sugar", 2: "S Jet", 3: "W Jet", 4: "Wunder", 5: "Hexit", 6: "" };
const PLAY_MOTION_WEIGHTS = [1, 1, 1, 1, 1, 10];


// --- Helper Functions ---
function getRandomElement<T,>(arr: T[]): T | null {
    if (arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomKey(obj: object): string {
    const keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
}

function getRandomWeightedElement<T>(items: T[], weights: number[]): T {
  let i;
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let random = Math.random() * totalWeight;

  for (i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random < 0) {
      return items[i];
    }
  }
  return items[items.length - 1];
}

function getMirroredPath(path: RoutePath): RoutePath {
    return path.map(point => ({ x: -point.x, y: point.y }));
}

function applyMotions(
    baseFormation: Formation,
    calledMotions: { receiver: string, motionName: string }[],
    motionLibrary: MotionLibrary
): { finalFormation: Formation, appliedMotions: Play['motions']} {
    const finalFormation = JSON.parse(JSON.stringify(baseFormation)); // Deep copy
    const appliedMotions: Play['motions'] = [];

    // NOTE: This assumes motion paths are relative to the player's starting position.
    // X is in yards, Y is in yards. The position is in %.
    // We need a scale factor. Field width is ~53.3 yards.
    const YARDS_TO_PERCENT_X = 100 / 53.3; 

    for (const { receiver, motionName } of calledMotions) {
        const motionData = motionLibrary[motionName];
        if (motionData && finalFormation[receiver]) {
            const motionPath = motionData.path;
            const startPos = baseFormation[receiver];
            const endPoint = motionPath[motionPath.length - 1];
            
            // Adjust final position based on the motion
            finalFormation[receiver].x = startPos.x + (endPoint.x * YARDS_TO_PERCENT_X);
            finalFormation[receiver].y = startPos.y - endPoint.y; // Y is inverted in diagram logic

            appliedMotions.push({ receiver, motionName, path: motionPath });
        }
    }
    return { finalFormation, appliedMotions };
}


function assignRoutesToReceivers(
    conceptName: string, 
    receivers: string[],
    isRightSide: boolean,
    conceptLibrary: ConceptLibrary,
    routeLibrary: RouteLibrary
): { [receiver: string]: { routeName: string; path: RoutePath } } {
    let conceptDef = conceptLibrary[conceptName];
    
    // Handle single-route concepts passed by name (e.g., "Hook", "Fade")
    if (!conceptDef && routeLibrary[conceptName]) {
        conceptDef = { routes: [conceptName], category: 'one' };
    }
    
    if (!conceptDef) {
        // Fallback if concept is somehow invalid
        conceptDef = { routes: ['Verts'], category: 'one' };
    }

    let conceptRoutes = conceptDef.routes;

    // For 'Whip' and 'Whack', reverse routes to create a crossing effect
    if (conceptName === 'Whip' || conceptName === 'Whack') {
        conceptRoutes = [...conceptRoutes].reverse();
    }

    const assignments: { [receiver: string]: { routeName: string; path: RoutePath } } = {};
    
    for (let i = 0; i < receivers.length; i++) {
        const receiver = receivers[i];
        const routeName = conceptRoutes[i % conceptRoutes.length];
        
        if (routeName && routeLibrary[routeName]) {
            let path = routeLibrary[routeName];
            if (!isRightSide) {
                path = getMirroredPath(path);
            }
            assignments[receiver] = { routeName, path };
        } else {
             // Fallback to Verts if route not found
            let path = routeLibrary["Verts"];
            if (!path) {
                // Absolute fallback if even Verts is deleted.
                assignments[receiver] = { routeName: "N/A", path: [{x:0, y:0}] };
                continue;
            }
            if (!isRightSide) {
                path = getMirroredPath(path);
            }
            assignments[receiver] = { routeName: "Verts", path };
        }
    }
    return assignments;
}

export const generatePlay = (conceptLibrary: ConceptLibrary, motionLibrary: MotionLibrary, routeLibrary: RouteLibrary): Play => {
    // 1. BASE FORMATION
    const formationName = getRandomElement(FORMATION_NAMES);
    const baseFormation: Formation = FORMATIONS[formationName];
    const baseReceivers = Object.keys(baseFormation);

    // 2. MOTIONS
    const receiverMotions: { [receiver: string]: string[] } = {};
    for (const motionName in motionLibrary) {
        const motionData = motionLibrary[motionName];
        if (!receiverMotions[motionData.receiver]) {
            receiverMotions[motionData.receiver] = [];
        }
        receiverMotions[motionData.receiver].push(motionName);
    }

    const calledMotions: { receiver: string, motionName: string }[] = [];
    const motionCalls: string[] = [];

    // Decide which receivers will motion (low probability)
    for(const receiver of baseReceivers) {
        if (receiverMotions[receiver] && Math.random() < 0.25) {
            const motionName = getRandomElement(receiverMotions[receiver]);
            if (motionName) {
                calledMotions.push({ receiver, motionName });
                motionCalls.push(motionName);
            }
        }
    }
    const playMotion = getRandomWeightedElement(Object.values(PLAY_MOTIONS), PLAY_MOTION_WEIGHTS);

    // 3. APPLY MOTIONS TO GET FINAL FORMATION
    const { finalFormation, appliedMotions } = applyMotions(baseFormation, calledMotions, motionLibrary);

    // 4. RE-CALCULATE RECEIVER SIDES BASED ON FINAL POSITIONS
    const finalReceivers = Object.keys(finalFormation);
    const rightReceivers = finalReceivers.filter(r => finalFormation[r].x >= 50).sort((a,b) => finalFormation[b].x - finalFormation[a].x);
    const leftReceivers = finalReceivers.filter(r => finalFormation[r].x < 50).sort((a,b) => finalFormation[a].x - finalFormation[b].x);

    // 5. CONCEPTS & DIRECTION
    const direction = DIRECTIONS[getRandomKey(DIRECTIONS)];
    const formationHasRightStrongSide = ['Tri', 'Brunch', 'Spread'].includes(formationName);
    const formationHasLeftStrongSide = ['Angle', 'Lunch', 'Split'].includes(formationName);
    const is2x2 = rightReceivers.length === 2 && leftReceivers.length === 2;
    const is3x1 = (rightReceivers.length === 3 && leftReceivers.length === 1) || (leftReceivers.length === 3 && rightReceivers.length === 1);

    let rightConcept: string;
    let leftConcept: string;
    let finalRoutes: { [receiver: string]: { routeName: string; path: RoutePath } } = {};
    let playConceptsString = '';

    const getAvailableConcepts = (count: number, side: 'right' | 'left', allConcepts: ConceptLibrary) => {
        let category: ConceptDefinition['category'];
        if (count === 1) return PLAYS_ONE_REC; 

        switch (count) {
            case 2: category = 'two'; break;
            case 3: category = 'three'; break;
            case 4: category = 'full'; break;
            default: return [];
        }

        let baseList = Object.keys(allConcepts).filter(c => allConcepts[c].category === category);
        
        return baseList.filter(c => {
            const isSpreadOrSplit = formationName === 'Spread' || formationName === 'Split';
            if (c.startsWith('Murrey') && (!is3x1 || side !== 'right' || !formationHasRightStrongSide)) return false;
            if (c.startsWith('Melody') && (!is3x1 || side !== 'left' || !formationHasLeftStrongSide)) return false;
            if (c.startsWith('Ringo') && (side !== 'right' || !formationHasRightStrongSide)) return false;
            if (c.startsWith('Linda') && (side !== 'left' || !formationHasLeftStrongSide)) return false;
            if (c.startsWith('Zander') && (side !== 'right' || !isSpreadOrSplit)) return false;
            if (c.startsWith('Wilma') && (side !== 'left' || !isSpreadOrSplit)) return false;
            return true;
        });
    };
    
    const availableFullField = getAvailableConcepts(finalReceivers.length, 'right', conceptLibrary);
    if (finalReceivers.length >= 4 && Math.random() < 0.2 && availableFullField.length > 0) {
        let conceptName = getRandomElement(availableFullField);
        if (conceptName === 'Mesh' && !is2x2) {
           conceptName = 'Verts'; 
        }
        playConceptsString = conceptName;
        
        if (conceptName === 'Mesh' && routeLibrary['Out'] && routeLibrary['LDrag'] && routeLibrary['Drag']) {
            const outsideLeft = leftReceivers[0];
            const insideLeft = leftReceivers[1];
            const outsideRight = rightReceivers[0];
            const insideRight = rightReceivers[1];

            finalRoutes[outsideLeft] = { routeName: 'Out', path: getMirroredPath(routeLibrary['Out']) };
            finalRoutes[outsideRight] = { routeName: 'Out', path: routeLibrary['Out'] };
            finalRoutes[insideLeft] = { routeName: 'Drag', path: routeLibrary['LDrag'] };
            finalRoutes[insideRight] = { routeName: 'Drag', path: routeLibrary['Drag'] };
        } else {
            // Refactored to use the simpler and more robust split-field assignment logic
            const rightAssignments = assignRoutesToReceivers(conceptName, rightReceivers, true, conceptLibrary, routeLibrary);
            const leftAssignments = assignRoutesToReceivers(conceptName, leftReceivers, false, conceptLibrary, routeLibrary);
            finalRoutes = { ...rightAssignments, ...leftAssignments };
        }

    } else { 
        rightConcept = getRandomElement(getAvailableConcepts(rightReceivers.length, 'right', conceptLibrary));
        leftConcept = getRandomElement(getAvailableConcepts(leftReceivers.length, 'left', conceptLibrary));

        const rightAssignments = assignRoutesToReceivers(rightConcept, rightReceivers, true, conceptLibrary, routeLibrary);
        const leftAssignments = assignRoutesToReceivers(leftConcept, leftReceivers, false, conceptLibrary, routeLibrary);
        finalRoutes = { ...rightAssignments, ...leftAssignments };

        playConceptsString = formationHasRightStrongSide || formationName.toLowerCase().includes('r') 
            ? `${rightConcept} / ${leftConcept}` 
            : `${leftConcept} / ${rightConcept}`;
    }

    // 6. FINAL PLAYCALL
    const finalPlayCall = [formationName, direction, ...motionCalls, playMotion, playConceptsString]
        .filter(part => part && part.trim() !== '' && part !== 'null')
        .join(' ');

    return {
        playcall: finalPlayCall,
        formationName: formationName,
        routes: finalRoutes,
        motions: appliedMotions
    };
};