import type { FC } from 'react'; // Use type import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface DrugReferenceData {
  agent: string;
  tradeName: string;
  initialDose: string;
  maintenanceDose: string;
  maxDose: string;
}

// Data based on the provided HTML structure
const drugReferenceTableData: DrugReferenceData[] = [
    {
        agent: 'Norepinephrine (noradrenaline)',
        tradeName: 'Levophed',
        initialDose: '5 to 15 mcg/minute (0.05 to 0.15 mcg/kg/minute)\nCardiogenic shock: 0.05 mcg/kg/minute',
        maintenanceDose: '2 to 80 mcg/minute (0.025 to 1 mcg/kg/minute)\nCardiogenic shock: 0.05 to 0.4 mcg/kg/minute',
        maxDose: '80 to 250 mcg/minute (1 to 3.3 mcg/kg/minute)',
    },
    {
        agent: 'Epinephrine (adrenaline)',
        tradeName: 'Adrenalin',
        initialDose: '1 to 15 mcg/minute (0.01 to 0.2 mcg/kg/minute)',
        maintenanceDose: '1 to 40 mcg/minute (0.01 to 0.5 mcg/kg/minute)',
        maxDose: '40 to 160 mcg/minute (0.5 to 2 mcg/kg/minute)',
    },
    {
        agent: 'Dopamine',
        tradeName: 'Intropin',
        initialDose: '2 to 5 mcg/kg/minute',
        maintenanceDose: '2 to 20 mcg/kg/minute',
        maxDose: '20 mcg/kg/minute',
    },
    {
        agent: 'Vasopressin (arginine-vasopressin)',
        tradeName: 'Pitressin, Vasostrict',
        initialDose: '0.03 units/minute',
        maintenanceDose: '0.01 to 0.04 units/minute (not titrated)',
        maxDose: 'Doses >0.04 units/minute can cause cardiac ischemia and should be reserved for salvage therapy',
    },
    {
        agent: 'Dobutamine',
        tradeName: 'Dobutrex',
        initialDose: 'Usual: 2 to 5 mcg/kg/minute (range: 0.5 to 5 mcg/kg/minute; lower doses for less severe cardiac decompensation)',
        maintenanceDose: '2 to 10 mcg/kg/minute',
        maxDose: '20 mcg/kg/minute',
    },
    {
        agent: 'Milrinone',
        tradeName: 'Primacor',
        initialDose: '0.125 to 0.25 mcg/kg/minute',
        maintenanceDose: '0.125 to 0.75 mcg/kg/minute',
        maxDose: '0.75 mcg/kg/minute',
    },
      {
    agent: 'Nitroglycerin (Glyceryl Trinitrate)', // Added from drugData.ts if needed
    tradeName: 'Nitronal, Tridil',
    initialDose: '5 to 20 mcg/minute',
    maintenanceDose: '10 to 200 mcg/minute',
    maxDose: 'Up to 400 mcg/minute may be required in some cases',
  },
];


const Footnotes: FC = () => (
  <div className="mt-6 text-sm text-muted-foreground space-y-3">
    <h4 className="font-semibold text-foreground">Important Notes:</h4>
    <ul className="list-disc space-y-1 pl-5">
      <li>All doses shown are for intravenous (IV) administration in adult patients.</li>
      <li>Vasopressors can cause life-threatening hypotension and hypertension, dysrhythmias, and myocardial ischemia.</li>
      <li>They should be administered by use of an infusion pump adjusted by clinicians trained and experienced in dose titration of intravenous vasopressors using continuous noninvasive electronic monitoring of blood pressure, heart rate, rhythm, and function.</li>
      <li>Hypovolemia should be corrected prior to the institution of vasopressor therapy. Reduce infusion rate gradually; avoid sudden discontinuation.</li>
      <li>Vasopressors can cause severe local tissue ischemia; central line administration is preferred.</li>
      <li>Vasopressor infusions are high-risk medications requiring caution to prevent a medication error and patient harm.</li>
    </ul>
    <p className="pt-2 text-xs">
      <strong className="text-foreground">Abbreviations:</strong> DSW: 5% dextrose water; MAP: mean arterial pressure; NS: 0.9% saline.
    </p>
  </div>
);


export const DrugReferenceTable: FC = () => {
  return (
    // Removed the outer container div. Scrolling is handled by the parent.
    <div className="space-y-4">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead className="min-w-[150px] font-semibold">Agent</TableHead>
            <TableHead className="min-w-[120px] font-semibold">US Trade Name</TableHead>
            <TableHead className="min-w-[180px] font-semibold">Initial Dose</TableHead>
            <TableHead className="min-w-[180px] font-semibold">Usual Maintenance Dose Range</TableHead>
            <TableHead className="min-w-[180px] font-semibold">Max Dose (Refractory Shock)</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {drugReferenceTableData.map((drug) => (
            <TableRow key={drug.agent}>
                <TableCell className="font-medium align-top">{drug.agent}</TableCell>
                <TableCell className="align-top">{drug.tradeName}</TableCell>
                <TableCell className="whitespace-pre-line align-top">{drug.initialDose}</TableCell>
                <TableCell className="whitespace-pre-line align-top">{drug.maintenanceDose}</TableCell>
                <TableCell className="whitespace-pre-line align-top">{drug.maxDose}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
        <Separator />
        <Footnotes />
    </div>
  );
};
