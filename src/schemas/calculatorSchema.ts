
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
        (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
         z.number({ required_error: 'Drug amount is required.', invalid_type_error: 'Amount must be a number.' })
          .positive({ message: 'Amount must be positive.' })
    ),
    drugAmountUnit: z.enum(['mg', 'mcg', 'units'], { required_error: 'Amount unit is required.' }),
    drugVolume: z.preprocess(
        (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
         z.number({ required_error: 'Syringe volume is required.', invalid_type_error: 'Volume must be a number.' })
          .positive({ message: 'Volume must be positive.' })
          .int({ message: 'Volume must be a whole number.' }) // Typically syringe volumes are whole numbers
    ),
  });
};

// Define a default or base schema if needed, although dynamic is preferred here
export const defaultCalculatorSchema = createCalculatorSchema(null);

export type CalculatorFormValues = z.infer<ReturnType<typeof createCalculatorSchema>>;
