// src/data/drugData.ts

export interface DrugFormulation {
	amount: number;
	unit: 'mg' | 'mcg' | 'units';
	volume: number;
	volumeUnit: 'ml';
}

export interface DrugDosing {
	range: string; // e.g., "0.05–0.5"
	unit: 'mcg/kg/min' | 'mcg/min' | 'units/min';
	min: number;
	max: number;
	isWeightBased: boolean;
	isTimeBasedInMinutes: boolean; // true if dose is per minute, false if per hour etc.
}

export interface Drug {
	name: string;
	brands: string[];
	concentrationsAvailable: string[];
	standardFormulation: DrugFormulation; // Default concentration used in calculations
	dosing: DrugDosing;
	// Formula function takes dose, weight (optional), concentration amount, unit, and dilution volume
	// Returns rate in ml/hr, the formula string, and dose status
	calculateRate: (
		dose: number,
		weight: number | undefined,
		concentrationAmount: number, // Amount of drug (e.g., 4mg)
		concentrationUnit: 'mg' | 'mcg' | 'units', // Unit of the drug amount
		dilutionVolume: number // Volume it's diluted in (e.g., 50ml)
	) => { rate: number; formula: string; doseStatus: 'standard' | 'low' | 'high' };
}

export const drugData: Drug[] = [
	{
		name: 'Norepinephrine (Noradrenaline)',
		brands: ['Noradrenaline', 'Levophed'],
		concentrationsAvailable: ['4 mg/4 mL ampoule (1 mg/mL)'],
		standardFormulation: { amount: 4, unit: 'mg', volume: 50, volumeUnit: 'ml' }, // Standard: 4mg in 50ml
		dosing: {
			range: '0.05–0.5',
			unit: 'mcg/kg/min',
			min: 0.05,
			max: 0.5,
			isWeightBased: true,
			isTimeBasedInMinutes: true,
		},
		calculateRate: (dose, weight, concentrationAmount, concentrationUnit, dilutionVolume) => {
			if (!weight) throw new Error('Weight is required for Norepinephrine.');
			if (concentrationUnit !== 'mg') throw new Error('Concentration for Norepinephrine must be in mg.');

			// Concentration in mg/ml
			const concentrationMgPerMl = concentrationAmount / dilutionVolume;
			// Convert concentration to mcg/ml for calculation consistency
			const concentrationMcgPerMl = concentrationMgPerMl * 1000;

			// Rate calculation: (Dose (mcg/kg/min) * Weight (kg) * 60 min/hr) / Concentration (mcg/ml)
			const rate = (dose * weight * 60) / concentrationMcgPerMl;

			const formula = `Rate (ml/hr) = (Dose [${dose} mcg/kg/min] × Weight [${weight} kg] × 60 min/hr) / (Concentration [${concentrationAmount} mg / ${dilutionVolume} ml] × 1000 mcg/mg)`;

            const doseStatus = dose < 0.05 ? 'low' : dose > 0.5 ? 'high' : 'standard';

			return { rate, formula, doseStatus };
		},
	},
	{
		name: 'Epinephrine (Adrenaline)',
		brands: ['Adrenaline 1:1000 INJ', 'Dilute Adrenaline 1:10,000'],
		concentrationsAvailable: ['1 mg/mL (1:1000)', '0.1 mg/mL (1:10,000)'],
		standardFormulation: { amount: 1, unit: 'mg', volume: 50, volumeUnit: 'ml' }, // Standard: 1mg in 50ml
		dosing: {
			range: '0.01–0.1',
			unit: 'mcg/kg/min',
			min: 0.01,
			max: 0.1,
			isWeightBased: true,
			isTimeBasedInMinutes: true,
		},
		calculateRate: (dose, weight, concentrationAmount, concentrationUnit, dilutionVolume) => {
			if (!weight) throw new Error('Weight is required for Epinephrine.');
            if (concentrationUnit !== 'mg') throw new Error('Concentration for Epinephrine must be in mg.');

			// Concentration in mg/ml
			const concentrationMgPerMl = concentrationAmount / dilutionVolume;
			// Convert concentration to mcg/ml
			const concentrationMcgPerMl = concentrationMgPerMl * 1000;

			// Rate calculation: (Dose (mcg/kg/min) * Weight (kg) * 60 min/hr) / Concentration (mcg/ml)
			const rate = (dose * weight * 60) / concentrationMcgPerMl;

			const formula = `Rate (ml/hr) = (Dose [${dose} mcg/kg/min] × Weight [${weight} kg] × 60 min/hr) / (Concentration [${concentrationAmount} mg / ${dilutionVolume} ml] × 1000 mcg/mg)`;

            const doseStatus = dose < 0.01 ? 'low' : dose > 0.1 ? 'high' : 'standard';

			return { rate, formula, doseStatus };
		},
	},
	{
		name: 'Dopamine',
		brands: ['Dopamine Fresenius'],
		concentrationsAvailable: ['200 mg/5 mL ampoule (40 mg/mL)'],
		standardFormulation: { amount: 200, unit: 'mg', volume: 50, volumeUnit: 'ml' }, // Standard: 200mg in 50ml
		dosing: {
			range: '2–20',
			unit: 'mcg/kg/min',
			min: 2,
			max: 20,
			isWeightBased: true,
			isTimeBasedInMinutes: true,
		},
		calculateRate: (dose, weight, concentrationAmount, concentrationUnit, dilutionVolume) => {
			if (!weight) throw new Error('Weight is required for Dopamine.');
            if (concentrationUnit !== 'mg') throw new Error('Concentration for Dopamine must be in mg.');

			// Concentration in mg/ml
			const concentrationMgPerMl = concentrationAmount / dilutionVolume;
			// Convert concentration to mcg/ml
			const concentrationMcgPerMl = concentrationMgPerMl * 1000;

			// Rate calculation: (Dose (mcg/kg/min) * Weight (kg) * 60 min/hr) / Concentration (mcg/ml)
			const rate = (dose * weight * 60) / concentrationMcgPerMl;

			const formula = `Rate (ml/hr) = (Dose [${dose} mcg/kg/min] × Weight [${weight} kg] × 60 min/hr) / (Concentration [${concentrationAmount} mg / ${dilutionVolume} ml] × 1000 mcg/mg)`;

            const doseStatus = dose < 2 ? 'low' : dose > 20 ? 'high' : 'standard';

			return { rate, formula, doseStatus };
		},
	},
	{
		name: 'Dobutamine',
		brands: ['Dobutamine HCl', 'Dobutrex'],
		concentrationsAvailable: ['12.5 mg/mL in 20 mL (250 mg)', '250 mg/vial'],
		standardFormulation: { amount: 250, unit: 'mg', volume: 50, volumeUnit: 'ml' }, // Standard: 250mg in 50ml
		dosing: {
			range: '2–20',
			unit: 'mcg/kg/min',
			min: 2,
			max: 20,
			isWeightBased: true,
			isTimeBasedInMinutes: true,
		},
		calculateRate: (dose, weight, concentrationAmount, concentrationUnit, dilutionVolume) => {
			if (!weight) throw new Error('Weight is required for Dobutamine.');
            if (concentrationUnit !== 'mg') throw new Error('Concentration for Dobutamine must be in mg.');

			// Concentration in mg/ml
			const concentrationMgPerMl = concentrationAmount / dilutionVolume;
			// Convert concentration to mcg/ml
			const concentrationMcgPerMl = concentrationMgPerMl * 1000;

			// Rate calculation: (Dose (mcg/kg/min) * Weight (kg) * 60 min/hr) / Concentration (mcg/ml)
			const rate = (dose * weight * 60) / concentrationMcgPerMl;

			const formula = `Rate (ml/hr) = (Dose [${dose} mcg/kg/min] × Weight [${weight} kg] × 60 min/hr) / (Concentration [${concentrationAmount} mg / ${dilutionVolume} ml] × 1000 mcg/mg)`;

            const doseStatus = dose < 2 ? 'low' : dose > 20 ? 'high' : 'standard';

			return { rate, formula, doseStatus };
		},
	},
	{
		name: 'Vasopressin',
		brands: ['Vasopressin Injection'],
		concentrationsAvailable: ['20 units/mL in 1 mL ampoule'],
		standardFormulation: { amount: 20, unit: 'units', volume: 50, volumeUnit: 'ml' }, // Standard: 20 units in 50ml
		dosing: {
			range: '0.01–0.04',
			unit: 'units/min',
			min: 0.01,
			max: 0.04,
			isWeightBased: false,
			isTimeBasedInMinutes: true,
		},
		calculateRate: (dose, weight, concentrationAmount, concentrationUnit, dilutionVolume) => {
            // Weight is not used for Vasopressin calculation but passed for consistency
            if (concentrationUnit !== 'units') throw new Error('Concentration for Vasopressin must be in units.');

			// Concentration in units/ml
			const concentrationUnitsPerMl = concentrationAmount / dilutionVolume;

			// Rate calculation: (Dose (units/min) * 60 min/hr) / Concentration (units/ml)
			const rate = (dose * 60) / concentrationUnitsPerMl;

			const formula = `Rate (ml/hr) = (Dose [${dose} units/min] × 60 min/hr) / Concentration [${concentrationAmount} units / ${dilutionVolume} ml]`;

            const doseStatus = dose < 0.01 ? 'low' : dose > 0.04 ? 'high' : 'standard';

			return { rate, formula, doseStatus };
		},
	},
	{
		name: 'Milrinone',
		brands: ['Milrinone Lactate Injection'],
		concentrationsAvailable: ['1 mg/mL in 10 mL ampoule (10 mg total)'],
		standardFormulation: { amount: 10, unit: 'mg', volume: 50, volumeUnit: 'ml' }, // Standard: 10mg in 50ml
		dosing: {
			range: '0.25–0.75',
			unit: 'mcg/kg/min',
			min: 0.25,
			max: 0.75,
			isWeightBased: true,
			isTimeBasedInMinutes: true,
		},
		calculateRate: (dose, weight, concentrationAmount, concentrationUnit, dilutionVolume) => {
			if (!weight) throw new Error('Weight is required for Milrinone.');
            if (concentrationUnit !== 'mg') throw new Error('Concentration for Milrinone must be in mg.');

			// Concentration in mg/ml
			const concentrationMgPerMl = concentrationAmount / dilutionVolume;
			// Convert concentration to mcg/ml
			const concentrationMcgPerMl = concentrationMgPerMl * 1000;

			// Rate calculation: (Dose (mcg/kg/min) * Weight (kg) * 60 min/hr) / Concentration (mcg/ml)
			const rate = (dose * weight * 60) / concentrationMcgPerMl;

			const formula = `Rate (ml/hr) = (Dose [${dose} mcg/kg/min] × Weight [${weight} kg] × 60 min/hr) / (Concentration [${concentrationAmount} mg / ${dilutionVolume} ml] × 1000 mcg/mg)`;

            const doseStatus = dose < 0.25 ? 'low' : dose > 0.75 ? 'high' : 'standard';

			return { rate, formula, doseStatus };
		},
	},
	{
		name: 'Nitroglycerin (Glyceryl Trinitrate)',
		brands: ['Nitronal', 'Tridil'],
		concentrationsAvailable: ['1 mg/mL in 50 mL ampoule (50 mg total)'],
		standardFormulation: { amount: 50, unit: 'mg', volume: 50, volumeUnit: 'ml' }, // Standard: 50mg in 50ml
		dosing: {
			range: '5–200',
			unit: 'mcg/min',
			min: 5,
			max: 200,
			isWeightBased: false,
			isTimeBasedInMinutes: true,
		},
		calculateRate: (dose, weight, concentrationAmount, concentrationUnit, dilutionVolume) => {
            // Weight is not used for Nitroglycerin calculation
            if (concentrationUnit !== 'mg') throw new Error('Concentration for Nitroglycerin must be in mg.');

			// Concentration in mg/ml
			const concentrationMgPerMl = concentrationAmount / dilutionVolume;
			// Convert concentration to mcg/ml
			const concentrationMcgPerMl = concentrationMgPerMl * 1000;

			// Rate calculation: (Dose (mcg/min) * 60 min/hr) / Concentration (mcg/ml)
			const rate = (dose * 60) / concentrationMcgPerMl;

			const formula = `Rate (ml/hr) = (Dose [${dose} mcg/min] × 60 min/hr) / (Concentration [${concentrationAmount} mg / ${dilutionVolume} ml] × 1000 mcg/mg)`;

            const doseStatus = dose < 5 ? 'low' : dose > 200 ? 'high' : 'standard';

			return { rate, formula, doseStatus };
		},
	},
];
