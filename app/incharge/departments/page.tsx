"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, FlaskConical, BookText } from "lucide-react";

// --- TYPE DEFINITIONS ---
type Experiment = {
    _id: string; 
    name: string;
    department: string;
    year: string;
    requiredEquipment: {
        name: string;
        quantity: number;
        details: string;
    }[];
};

type Department = {
    _id: string;
    name: string;
    experiments: Experiment[];
};

const groupExperimentsByYear = (experiments: Experiment[]) => {
    return experiments.reduce((acc, experiment) => {
        const year = experiment.year || "N/A";
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year].push(experiment);
        return acc;
    }, {} as Record<string, Experiment[]>);
};

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/departments');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch department data.');
                }
                const data = await response.json();
                setDepartments(data);
            } catch (err: any) {
                setError(err.message || 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    return (
        <DashboardLayout
            userRole="incharge"
            title="Departments & Experiments"
            subtitle="Browse all experiments available for each department and academic year."
        >
            <div className="bg-white rounded-lg p-6 shadow-sm border">
                {loading && (
                    <div className="flex items-center justify-center py-20 text-gray-500">
                        <Loader2 className="w-8 h-8 mr-2 animate-spin" />
                        <span>Loading department data...</span>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!loading && !error && departments.length > 0 && (
                    <Accordion type="single" collapsible className="w-full">
                        {departments.map(dept => {
                            const experimentsByYear = groupExperimentsByYear(dept.experiments);
                            return (
                                <AccordionItem key={dept._id} value={dept.name}>
                                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <FlaskConical className="w-5 h-5 text-blue-600" />
                                            {dept.name}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-6">
                                        {Object.keys(experimentsByYear).length > 0 ? (
                                            Object.entries(experimentsByYear).sort(([yearA], [yearB]) => yearA.localeCompare(yearB)).map(([year, experiments]) => (
                                                <div key={year} className="mb-4">
                                                    <h4 className="text-md font-semibold text-gray-800 mb-2">Year {year}</h4>
                                                    <ul className="list-disc list-inside space-y-2 pl-4">
                                                        {experiments.map(exp => (
                                                            <li key={exp._id} className="text-gray-700">
                                                                <span className="font-medium">{exp.name}</span>
                                                                <p className="text-xs text-gray-500 pl-5">
                                                                    Requires {exp.requiredEquipment.length} item(s)
                                                                </p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-gray-500 py-4">
                                                <BookText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                                No experiments found for this department.
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}
                 {!loading && !error && departments.length === 0 && (
                    <div className="text-center text-gray-500 py-20">
                        <FlaskConical className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold">No Departments Found</h3>
                        <p className="text-sm">Could not find any departments in the database.</p>
                    </div>
                 )}
            </div>
        </DashboardLayout>
    );
}

export default DepartmentsPage;

