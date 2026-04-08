
export interface Point {
  x: number;
  y: number;
}

export type RoutePath = Point[];

export interface RouteLibrary {
  [routeName: string]: RoutePath;
}

export interface ConceptDefinition {
  routes: string[];
  category: 'one' | 'two' | 'three' | 'full';
  compatibleFormations?: string[]; // Optional: restrict concept to specific formations
}

export interface ConceptLibrary {
  [conceptName: string]: ConceptDefinition;
}

export interface ProtectionDefinition {
  paths: {
    [lineman: string]: RoutePath;
  };
}

export interface ProtectionLibrary {
  [protectionName: string]: ProtectionDefinition;
}

export interface PlayerPosition {
  x: number; // percentage of field width
  y: number; // percentage of field height from line of scrimmage
}

export interface Formation {
  [receiver: string]: PlayerPosition;
}

export interface FormationLibrary {
  [formationName: string]: Formation;
}

export interface MotionLibrary {
  [motionName: string]: {
    path: RoutePath;
    receiver: string;
  };
}

export interface Play {
  playcall: string;
  formationName: string;
  protectionName?: string;
  protectionPaths?: { [lineman: string]: RoutePath };
  routes: {
    [receiver: string]: {
      routeName: string;
      path: RoutePath;
    };
  };
  motions: {
    receiver: string;
    motionName: string;
    path: RoutePath;
  }[];
}

export type AppMode = 'mainMenu' | 'generator' | 'study' | 'quizDiagram' | 'quizPlaycall';
