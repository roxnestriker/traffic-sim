import { Router, Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';

const router = Router();

// Data storage
interface TrafficScenario {
  id: string;
  name: string;
  description: string;
  vehicles: Array<{
    id: string;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    speed: number; // km/h
    headway: number; // seconds
  }>;
  signals: Array<{
    id: string;
    lat: number;
    lng: number;
    cycle: {
      red: number; // seconds
      yellow: number; // seconds
      green: number; // seconds
    };
  }>;
  created: string;
  modified: string;
}

const dataFile = path.join(__dirname, '../../data/scenarios.json');

// Ensure data directory exists
fs.ensureDirSync(path.dirname(dataFile));

// Helper functions
const loadScenarios = async (): Promise<TrafficScenario[]> => {
  try {
    if (await fs.pathExists(dataFile)) {
      return await fs.readJSON(dataFile);
    }
    return [];
  } catch (error) {
    console.error('Error loading scenarios:', error);
    return [];
  }
};

const saveScenarios = async (scenarios: TrafficScenario[]): Promise<void> => {
  try {
    await fs.writeJSON(dataFile, scenarios, { spaces: 2 });
  } catch (error) {
    console.error('Error saving scenarios:', error);
    throw error;
  }
};

// Routes

// GET /api/scenarios - List all scenarios
router.get('/', async (req: Request, res: Response) => {
  try {
    const scenarios = await loadScenarios();
    res.json(scenarios);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load scenarios' });
  }
});

// GET /api/scenarios/:id - Get specific scenario
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const scenarios = await loadScenarios();
    const scenario = scenarios.find(s => s.id === req.params.id);
    
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    res.json(scenario);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load scenario' });
  }
});

// POST /api/scenarios - Create new scenario
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, vehicles = [], signals = [] } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Scenario name is required' });
    }
    
    const scenarios = await loadScenarios();
    const newScenario: TrafficScenario = {
      id: Date.now().toString(),
      name,
      description: description || '',
      vehicles,
      signals,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };
    
    scenarios.push(newScenario);
    await saveScenarios(scenarios);
    
    res.status(201).json(newScenario);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create scenario' });
  }
});

// PUT /api/scenarios/:id - Update scenario
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const scenarios = await loadScenarios();
    const index = scenarios.findIndex(s => s.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    const { name, description, vehicles, signals } = req.body;
    
    scenarios[index] = {
      ...scenarios[index],
      name: name || scenarios[index].name,
      description: description !== undefined ? description : scenarios[index].description,
      vehicles: vehicles || scenarios[index].vehicles,
      signals: signals || scenarios[index].signals,
      modified: new Date().toISOString()
    };
    
    await saveScenarios(scenarios);
    
    res.json(scenarios[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update scenario' });
  }
});

// DELETE /api/scenarios/:id - Delete scenario
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const scenarios = await loadScenarios();
    const index = scenarios.findIndex(s => s.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    scenarios.splice(index, 1);
    await saveScenarios(scenarios);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete scenario' });
  }
});

export default router;
