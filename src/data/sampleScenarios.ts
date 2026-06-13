// One-click demo scenarios. All numbers are illustrative sample data.

import type { Scenario } from '../types';

function loc(
  id: string,
  name: string,
  peopleAffected: number,
  urgency: number,
  deliveryDifficulty: number,
  minNeeded: number,
  maxUseful: number,
  notes = '',
) {
  return { id, name, peopleAffected, urgency, deliveryDifficulty, minNeeded, maxUseful, notes };
}

export interface SampleScenario {
  key: string;
  buttonLabel: string;
  scenario: Scenario;
}

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    key: 'food-bank',
    buttonLabel: 'Load food bank example',
    scenario: {
      name: 'Weekly food box distribution (sample)',
      resourceType: 'food-boxes',
      customResourceLabel: '',
      totalUnits: 300,
      fairness: 'balanced',
      maxStops: null,
      maxTotalDifficulty: null,
      locations: [
        loc('fb-1', 'Northside Pantry', 360, 4, 2, 40, 120, 'High demand after plant closure'),
        loc('fb-2', 'Riverside Community Center', 270, 3, 1, 30, 90, ''),
        loc('fb-3', 'Eastgate Church Pantry', 240, 5, 3, 30, 80, 'Serves several elderly residents'),
        loc('fb-4', 'Southview Mutual Aid', 180, 3, 2, 20, 60, ''),
        loc('fb-5', 'Hillcrest Outreach', 150, 2, 4, 10, 50, 'Long rural route'),
      ],
    },
  },
  {
    key: 'winter-clothing',
    buttonLabel: 'Load winter clothing example',
    scenario: {
      name: 'Winter clothing kit drive (sample)',
      resourceType: 'clothing-kits',
      customResourceLabel: '',
      totalUnits: 400,
      fairness: 'urgency',
      maxStops: null,
      maxTotalDifficulty: null,
      locations: [
        loc('wc-1', 'Central Shelter', 140, 5, 1, 40, 140, 'At capacity most nights'),
        loc('wc-2', 'Harbor House', 95, 4, 2, 30, 100, ''),
        loc('wc-3', 'Family Transition Center', 80, 4, 2, 25, 90, 'Many children — sizes vary'),
        loc('wc-4', 'Westside Day Center', 120, 3, 3, 20, 120, 'Drop-in population fluctuates'),
        loc('wc-5', 'County Warming Station', 60, 5, 4, 20, 70, 'Opens only on cold nights'),
        loc('wc-6', 'Veterans Outreach Van', 45, 3, 5, 10, 50, 'Mobile route, hard access'),
      ],
    },
  },
  {
    key: 'school-supplies',
    buttonLabel: 'Load school supplies example',
    scenario: {
      name: 'Back-to-school supply kits (sample)',
      resourceType: 'school-supplies',
      customResourceLabel: '',
      totalUnits: 2500,
      fairness: 'equal',
      maxStops: null,
      maxTotalDifficulty: null,
      locations: [
        loc('ss-1', 'Lincoln Elementary', 1200, 3, 1, 300, 1200, ''),
        loc('ss-2', 'Carver Middle School', 800, 4, 1, 250, 800, 'Highest share of students in need'),
        loc('ss-3', 'Oakdale Elementary', 600, 3, 2, 150, 600, ''),
        loc('ss-4', 'Prairie View K-8', 400, 2, 3, 100, 400, 'Rural campus'),
      ],
    },
  },
  {
    key: 'volunteer-planning',
    buttonLabel: 'Load volunteer planning example',
    scenario: {
      name: 'Saturday volunteer deployment (sample)',
      resourceType: 'volunteers',
      customResourceLabel: '',
      totalUnits: 24,
      fairness: 'easier-delivery',
      maxStops: 5,
      maxTotalDifficulty: null,
      locations: [
        loc('vp-1', 'Food sort warehouse', 200, 4, 1, 6, 10, 'Needs steady crew all day'),
        loc('vp-2', 'Senior meal delivery', 120, 5, 2, 4, 8, 'Drivers required'),
        loc('vp-3', 'Park cleanup', 80, 2, 1, 2, 6, ''),
        loc('vp-4', 'Donation intake desk', 60, 3, 1, 2, 4, ''),
        loc('vp-5', 'Shelter kitchen shift', 90, 4, 2, 3, 6, ''),
        loc('vp-6', 'Remote trail repair', 40, 2, 5, 2, 6, 'Hard to reach; needs carpool'),
      ],
    },
  },
];

export function emptyLocation(id: string) {
  return loc(id, '', 0, 3, 2, 0, 1);
}

export function blankScenario(): Scenario {
  return {
    name: '',
    resourceType: 'food-boxes',
    customResourceLabel: '',
    totalUnits: 100,
    fairness: 'balanced',
    maxStops: null,
    maxTotalDifficulty: null,
    locations: [emptyLocation('loc-1'), emptyLocation('loc-2')],
  };
}
