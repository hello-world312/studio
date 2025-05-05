
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CalculatorFormValues } from '@/schemas/calculatorSchema'; // Use type import
import { createCalculatorSchema } from '@/schemas/calculatorSchema';
import { drugData, type Drug } from '@/data/drugData'; // Use type import

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from '@/components/ui/alert';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { DrugReferenceTable } from '@/components/DrugReferenceTable'; // Import the new component
import {
	Calculator,
	Scale,
	Gauge,
	Info,
	FlaskConical,
	AlertTriangle,
	CheckCircle,
    BookOpen,
    EyeOff,
    Eye,
    Beaker, // Icon for concentration
    Droplets, // Icon for volume
} from 'lucide-react';

export default function ICUDoseCalcPage() {
	const [selectedDrug, setSelectedDrug] = React.useState<Drug | null>(null);
	const [calculationResult, setCalculationResult] = React.useState<
		string | null
	>(null);
	const [formulaUsed, setFormulaUsed] = React.useState<string>('');
    const [doseStatus, setDoseStatus] = React.useState<'standard' | 'low' | 'high' | null>(null);


	const { toast } = useToast();

	// Dynamically create the schema based on the selected drug
	const calculatorSchema = React.useMemo(
		() => createCalculatorSchema(selectedDrug),
		[selectedDrug]
	);

	const form = useForm<CalculatorFormValues>({
		resolver: zodResolver(calculatorSchema),
		mode: 'onChange', // Validate on change for better UX
		defaultValues: {
			drug: '',
			weight: undefined,
			dose: undefined,
			doseUnit: '',
			drugAmount: undefined, // Start undefined
			drugAmountUnit: undefined, // Set initial undefined
			drugVolume: undefined, // Start undefined
		},
	});

	const { watch, setValue, trigger, formState: { isValid }, getValues } = form;

	// Watch for changes in the drug selection
	const watchedDrug = watch('drug');

	React.useEffect(() => {
		const drug = drugData.find((d) => d.name === watchedDrug) || null;
		setSelectedDrug(drug);

		// Reset fields when drug changes
		if (drug) {
            // Reset dependent fields and set new defaults
            setValue('doseUnit', drug.dosing.unit);
            setValue('drugAmount', drug.standardFormulation.amount); // Set default amount
            setValue('drugAmountUnit', drug.standardFormulation.unit);
            setValue('drugVolume', drug.standardFormulation.volume); // Set default volume
            // Clear fields that need user input for the new drug
            setValue('dose', undefined);
            if (!drug.dosing.isWeightBased) {
                setValue('weight', undefined); // Clear weight if not needed
            } else {
                 // Keep weight if needed and already entered? This might be okay.
                 setValue('weight', getValues('weight'));
            }
            // Clear previous results
            setCalculationResult(null);
            setFormulaUsed('');
            setDoseStatus(null);
             // Trigger validation for potentially newly required fields or cleared fields
            trigger(['dose', 'weight', 'drugAmount', 'drugVolume', 'drugAmountUnit']);
		} else {
            // Clear everything if no drug is selected
            setValue('doseUnit', '');
            setValue('drugAmount', undefined);
            setValue('drugAmountUnit', undefined);
            setValue('drugVolume', undefined);
            setValue('dose', undefined);
            setValue('weight', undefined);
            setCalculationResult(null);
            setFormulaUsed('');
            setDoseStatus(null);
        }

	}, [watchedDrug, setValue, trigger, getValues]);


	const onSubmit = (data: CalculatorFormValues) => {
		if (selectedDrug) {
			try {
				// Ensure required values are numbers before calculation
				const dose = data.dose!;
				const weight = data.weight; // Can be undefined if not weight-based
				const drugAmount = data.drugAmount!;
				const drugAmountUnit = data.drugAmountUnit!;
				const drugVolume = data.drugVolume!;


				const calculation = selectedDrug.calculateRate(
					dose,
					weight, // Pass potentially undefined weight
					drugAmount,
                    drugAmountUnit,
					drugVolume
				);

                // Alert if concentration differs from standard
                const isStandardConcentration =
                    drugAmount === selectedDrug.standardFormulation.amount &&
                    drugAmountUnit === selectedDrug.standardFormulation.unit &&
                    drugVolume === selectedDrug.standardFormulation.volume;

                if (!isStandardConcentration) {
                    toast({
                        title: "Concentration Alert",
                        description: `Using non-standard preparation: ${drugAmount}${drugAmountUnit} in ${drugVolume}ml. Standard is ${selectedDrug.standardFormulation.amount}${selectedDrug.standardFormulation.unit} in ${selectedDrug.standardFormulation.volume}ml. Please verify preparation.`,
                        variant: "default", // Use default or a custom variant if needed
                        duration: 8000, // Longer duration for important warnings
                    });
                }


				setCalculationResult(calculation.rate.toFixed(2) + ' ml/hr');
				setFormulaUsed(calculation.formula);
                setDoseStatus(calculation.doseStatus);

			} catch (error) {
				console.error('Calculation Error:', error);
				toast({
					title: 'Calculation Error',
					description:
						error instanceof Error
							? error.message
							: 'An unexpected error occurred.',
					variant: 'destructive',
				});
				setCalculationResult(null);
				setFormulaUsed('');
                setDoseStatus(null);
			}
		}
	};

    // Use handleSubmit from react-hook-form
    const { handleSubmit, control } = form;


	return (
		<div className="min-h-screen bg-background text-foreground p-4 md:p-8">
            {/* Main Calculator Card */}
			<Card className="max-w-2xl mx-auto shadow-lg rounded-lg border border-border overflow-hidden mb-8">
				<CardHeader className="bg-primary text-primary-foreground p-4">
					<div className="flex items-center gap-2">
						{/* Syringe Icon SVG */}
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-accent"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/></svg>
						<CardTitle className="text-xl md:text-2xl font-bold">
							ICU DoseCalc
						</CardTitle>
					</div>
					<CardDescription className="text-primary-foreground/90 mt-1 text-sm">
						Vasopressor & Inotrope Infusion Rate Calculator
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6 space-y-6">
					<Form {...form}>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							{/* Drug Selection */}
							<div className="grid grid-cols-1 md:grid-cols-[2fr,auto] gap-4 items-end">
								<FormField
									control={control}
									name="drug"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-1 font-semibold">
												<FlaskConical className="h-4 w-4 text-accent" /> Drug Selection
											</FormLabel>
											<Select
												onValueChange={(value) => {
													field.onChange(value);
													// Triggering useEffect handles resets
												}}
												value={field.value} // Ensure value is controlled
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a drug" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{drugData.map((drug) => (
														<SelectItem
															key={drug.name}
															value={drug.name}
														>
															{drug.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* Drug Info Button */}
								{selectedDrug && (
									<Dialog>
										<DialogTrigger asChild>
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="w-full md:w-auto mt-1" // Adjusted margin
											>
												<Info className="mr-2 h-4 w-4" /> Info
											</Button>
										</DialogTrigger>
										<DialogContent className="sm:max-w-[480px]">
											<DialogHeader>
												<DialogTitle>{selectedDrug.name}</DialogTitle>
												<DialogDescription>
													Standard information based on typical Egyptian market availability. Always verify with local formulary.
												</DialogDescription>
											</DialogHeader>
											<div className="grid gap-3 py-4 text-sm">
												<p>
													<strong>Brand Examples:</strong>{' '}
													{selectedDrug.brands.join(', ')}
												</p>
                                                <Separator/>
												<p>
													<strong>Standard Prep (for {selectedDrug.standardFormulation.volume}ml):</strong>{' '}
													<strong>{selectedDrug.standardFormulation.amount}{selectedDrug.standardFormulation.unit} in {selectedDrug.standardFormulation.volume}ml</strong>
												</p>
                                                 <Separator/>
												<p>
													<strong>Available Ampoules/Vials:</strong>{' '}
													{selectedDrug.concentrationsAvailable.join('; ')}
												</p>
                                                 <Separator/>
												<p>
													<strong>Standard Dosing Range:</strong>{' '}
													<strong>{selectedDrug.dosing.range} {selectedDrug.dosing.unit}</strong>
												</p>
											</div>
										</DialogContent>
									</Dialog>
								)}
							</div>

							{/* Weight (Conditional) */}
							{selectedDrug?.dosing.isWeightBased && (
								<FormField
									control={control}
									name="weight"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-1 font-semibold">
												<Scale className="h-4 w-4 text-accent" /> Patient Weight (kg)
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.1"
													placeholder="Enter weight in kilograms"
													{...field}
													value={field.value ?? ''} // Controlled: Ensure value is never null/undefined for input
													onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Convert empty string to undefined for validation/logic
                                                        field.onChange(value === '' ? undefined : parseFloat(value));
                                                    }}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{/* Desired Dose */}
							{selectedDrug && (
								<div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4 items-end">
									<FormField
										control={control}
										name="dose"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-1 font-semibold">
													<Gauge className="h-4 w-4 text-accent" /> Desired Dose
												</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="any" // Allow decimals
														placeholder="Enter dose value"
														{...field}
                                                        value={field.value ?? ''} // Controlled
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Convert empty string to undefined
                                                            field.onChange(value === '' ? undefined : parseFloat(value));
                                                        }}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
                                    <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                         <Input
                                            value={selectedDrug.dosing.unit}
                                            readOnly
                                            className="bg-muted border-muted-foreground/30 cursor-not-allowed"
                                            aria-label="Dose unit"
                                        />
                                    </FormItem>
								</div>
							)}

                             {/* Preparation / Concentration Fields */}
                             {selectedDrug && (
                                <div>
                                    <FormLabel className="flex items-center gap-1 font-semibold mb-2">
                                         <Beaker className="h-4 w-4 text-accent" /> Syringe Preparation
                                    </FormLabel>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end p-4 border rounded-md bg-muted/30">
                                        {/* Drug Amount */}
                                        <FormField
                                            control={control}
                                            name="drugAmount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Drug Amount</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            // placeholder={`Std: ${selectedDrug.standardFormulation.amount}`} // Removed placeholder
                                                            placeholder="e.g. 4" // Generic placeholder
                                                            {...field}
                                                            value={field.value ?? ''} // Controlled
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                // Convert empty string to undefined
                                                                field.onChange(value === '' ? undefined : parseFloat(value));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/* Drug Amount Unit */}
                                        <FormField
                                            control={control}
                                            name="drugAmountUnit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Unit</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value} // Controlled component
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Unit" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {/* Allow selection relevant to the drug type */}
                                                            {['mg', 'mcg', 'units'].map(unit => (
                                                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                                            ))}

                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/* Syringe Volume */}
                                        <FormField
                                            control={control}
                                            name="drugVolume"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs flex items-center gap-1">
                                                        <Droplets className="h-3 w-3 text-accent/80" />
                                                        in Volume (ml)
                                                        </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="1"
                                                            // placeholder={`Std: ${selectedDrug.standardFormulation.volume}`} // Removed placeholder
                                                            placeholder="e.g. 50" // Generic placeholder
                                                            {...field}
                                                             value={field.value ?? ''} // Controlled
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                // Convert empty string to undefined
                                                                field.onChange(value === '' ? undefined : parseInt(value, 10));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 px-1">
                                        Standard prep: {selectedDrug.standardFormulation.amount}{selectedDrug.standardFormulation.unit} in {selectedDrug.standardFormulation.volume}ml. Adjust if different.
                                    </p>
                                </div>
                             )}


							{/* Calculation Button */}
                            {selectedDrug && (
							    <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-4" disabled={!isValid}>
								    <Calculator className="mr-2 h-4 w-4" /> Calculate Infusion Rate
							    </Button>
                            )}
						</form>
					</Form>

					{/* Output Section */}
					{calculationResult && selectedDrug && getValues('dose') !== undefined && ( // Ensure dose has a value before showing result
						<div className="mt-8 p-4 border border-accent/30 rounded-md bg-secondary/30 space-y-4 shadow-inner">
							<h3 className="text-lg font-semibold flex items-center gap-2 text-accent">
								<FlaskConical className="h-5 w-5" /> Calculation Result
							</h3>
							<p className="text-3xl font-bold text-accent text-center py-4">
								{calculationResult}
							</p>
							<Separator className="bg-accent/20"/>
							<div>
								<h4 className="font-medium mb-1">Formula Used:</h4>
								<code className="text-xs sm:text-sm bg-muted p-2 rounded-md block overflow-x-auto whitespace-pre-wrap">
									{formulaUsed}
								</code>
							</div>
							{doseStatus && (
								<Alert
									variant={ doseStatus === 'standard' ? 'default' : 'destructive'}
									className={`mt-2 ${doseStatus !== 'standard' ? 'bg-destructive/10 border-destructive/30' : 'bg-green-100/50 border-green-500/30'}`}
								>
									{doseStatus === 'standard' ? (
										<CheckCircle className={`h-4 w-4 ${doseStatus !== 'standard' ? 'text-destructive' : 'text-green-700'}`} />
									) : (
										<AlertTriangle className="h-4 w-4 text-destructive" />
									)}
									<AlertTitle className={`${doseStatus !== 'standard' ? 'text-destructive' : 'text-green-800'} font-semibold`}>
                                        Dose Range Check
                                    </AlertTitle>
									<AlertDescription className={`${doseStatus !== 'standard' ? 'text-destructive/90' : 'text-green-700/90'}`}>
										{doseStatus === 'standard'
											? `The desired dose (${getValues('dose')} ${selectedDrug.dosing.unit}) is within the standard range (${selectedDrug.dosing.range} ${selectedDrug.dosing.unit}).`
											: `Warning: The desired dose (${getValues('dose')} ${selectedDrug.dosing.unit}) is outside the standard range (${selectedDrug.dosing.range} ${selectedDrug.dosing.unit}). Verify order.`}
									</AlertDescription>
								</Alert>
							)}
						</div>
					)}


				</CardContent>
				<CardFooter className="p-3 bg-muted/50 rounded-b-lg text-xs text-muted-foreground text-center border-t">
					ICU DoseCalc | Verify all calculations before administration.
				</CardFooter>
			</Card>

             {/* Safety Warning Section - Collapsible */}
            <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto mb-8">
                <AccordionItem value="safety-notice" className="border border-destructive/50 rounded-lg overflow-hidden">
                    <AccordionTrigger className="bg-destructive/10 hover:bg-destructive/20 px-4 py-3 text-destructive font-semibold hover:no-underline group"> {/* Added group class */}
                         <div className="flex items-center gap-2 w-full"> {/* Ensure full width */}
                              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                              <span className="flex-grow text-left">Important Safety Notice</span> {/* Make text take available space */}
                               <Eye className="h-4 w-4 ml-auto flex-shrink-0 group-data-[state=closed]:hidden" /> {/* Use ml-auto and flex-shrink */}
                               <EyeOff className="h-4 w-4 ml-auto flex-shrink-0 group-data-[state=open]:hidden" />
                         </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 bg-destructive/5">
                        <Alert variant="destructive" className="border-0 p-0">
                            <AlertDescription className="text-xs leading-relaxed text-destructive/90">
                                This calculator is intended as an educational and decision-support tool only. It is <strong>NOT</strong> a substitute for professional medical judgment, clinical assessment, or institutional protocols. Always double-check calculations, verify drug concentrations and doses with the prepared syringe, and confirm with institutional guidelines and a qualified healthcare professional before administering any medication. The creators are not liable for any errors or clinical decisions made based on this tool. Standard concentrations are based on typical Egyptian market availability but may vary. Dose ranges provided are typical but may need adjustment based on clinical context and institutional guidelines. <strong>Final verification by the prescribing physician and administering nurse is mandatory.</strong>
                            </AlertDescription>
                        </Alert>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>


            {/* Drug Reference Section - Collapsible */}
            <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto mb-8"> {/* Added mb-8 for spacing */}
                <AccordionItem value="drug-reference" className="border border-border rounded-lg overflow-hidden shadow-lg">
                    <AccordionTrigger className="bg-secondary hover:bg-secondary/80 px-4 py-3 text-secondary-foreground font-semibold hover:no-underline group"> {/* Added group class */}
                        <div className="flex items-center gap-2 w-full"> {/* Ensure full width */}
                            <BookOpen className="h-5 w-5 flex-shrink-0" />
                            <span className="flex-grow text-left">Vasopressor & Inotrope Reference</span> {/* Make text take available space */}
                            <Eye className="h-4 w-4 ml-auto flex-shrink-0 group-data-[state=closed]:hidden" /> {/* Use ml-auto and flex-shrink */}
                            <EyeOff className="h-4 w-4 ml-auto flex-shrink-0 group-data-[state=open]:hidden" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0 bg-background">
                         <Card className="border-0 rounded-none shadow-none">
                            <CardContent className="p-0">
                                {/* Scrollable container */}
                                <div className="overflow-auto touch-pan-x touch-pan-y" style={{ WebkitOverflowScrolling: 'touch', maxHeight: '500px' }}> {/* Added maxHeight */}
                                    <div className="p-4 min-w-[800px]"> {/* Ensure minimum width for table content */}
                                        <DrugReferenceTable />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-3 bg-muted/50 rounded-b-lg text-xs text-muted-foreground text-center border-t">
                                Reference Data | Always consult official resources and local protocols.
                            </CardFooter>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>


			{/* Toaster is already in layout.tsx */}
		</div>
	);
}

