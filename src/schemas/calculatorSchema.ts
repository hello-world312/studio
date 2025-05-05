
// src/schemas/calculatorSchema.ts
import { z } from 'zod';
import type { Drug } from '@/data/drugData'; // Use type import

// Helper function to create schema based on selected drug
export const createCalculatorSchema = (selectedDrug: Drug | null) => {
  return z.object({
    drug: z.string().min(1, { message: 'Please select a drug.' }),
    weight: z.preprocess(
        // Preprocess to handle empty string or undefined -> undefined
        (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
        z.number({ invalid_type_error: 'Weight must be a number.' })
         .positive({ message: 'Weight must be positive.' })
         .optional() // Optional base schema
    ).refine((val) => !selectedDrug || !selectedDrug.dosing.isWeightBased || (val !== undefined && val > 0), {
        message: 'Patient weight is required for this drug.', // Custom message
        // Only apply this refinement if the drug is selected and requires weight
        path: ['weight'], // Specify the path for the error message
    }),
    dose: z.preprocess(
        (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
        z.number({ required_error: 'Desired dose is required.', invalid_type_error: 'Dose must be a number.' })
         .positive({ message: 'Dose must be positive.' })
    ),
    doseUnit: z.string(), // Readonly, no validation needed as it's derived
    drugAmount: z.preprocess(
        (val) => (val === '' || val === undefined || val === null ? 0 : Number(val)), // Default empty/null/undefined to 0
         z.number({ required_error: 'Drug amount is required.', invalid_type_error: 'Amount must be a number.' })
          .min(0, { message: 'Amount cannot be negative.' }) // Allow 0 but not negative
    ),
    drugAmountUnit: z.enum(['mg', 'mcg', 'units'], { required_error: 'Amount unit is required.' }),
    drugVolume: z.preprocess(
        (val) => (val === '' || val === undefined || val === null ? 0 : Number(val)), // Default empty/null/undefined to 0
         z.number({ required_error: 'Syringe volume is required.', invalid_type_error: 'Volume must be a number.' })
          .min(0, { message: 'Volume cannot be negative.' }) // Allow 0 but not negative
          .int({ message: 'Volume must be a whole number.' }) // Typically syringe volumes are whole numbers
    ),
  }).refine(data => data.drugAmount > 0 || data.drugVolume <= 0, { // If volume > 0, amount must be > 0
      message: "Drug amount must be positive if volume is positive.",
      path: ["drugAmount"],
  }).refine(data => data.drugVolume > 0 || data.drugAmount <= 0, { // If amount > 0, volume must be > 0
      message: "Syringe volume must be positive if drug amount is positive.",
      path: ["drugVolume"],
  });
};

// Define a default or base schema if needed, although dynamic is preferred here
export const defaultCalculatorSchema = createCalculatorSchema(null);

export type CalculatorFormValues = z.infer<ReturnType<typeof createCalculatorSchema>>;
