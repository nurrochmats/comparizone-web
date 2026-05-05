"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface FilterOption {
  code: string;
  name: string;
  type: 'option' | 'boolean' | 'number';
  options?: string[]; // for option type
  min?: number; // for number type
  max?: number; // for number type
  unit?: string;
}

interface FilterPanelProps {
  availableFilters: FilterOption[];
  onFilterApply: (filters: any[]) => void;
  isLoading?: boolean;
}

export function FilterPanel({ availableFilters, onFilterApply, isLoading }: FilterPanelProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [selectedBooleans, setSelectedBooleans] = useState<Record<string, boolean>>({});
  const [selectedRanges, setSelectedRanges] = useState<Record<string, [number, number]>>({});

  const handleOptionToggle = (filterCode: string, option: string) => {
    setSelectedOptions(prev => {
      const current = prev[filterCode] || [];
      if (current.includes(option)) {
        return { ...prev, [filterCode]: current.filter(o => o !== option) };
      } else {
        return { ...prev, [filterCode]: [...current, option] };
      }
    });
  };

  const handleApply = () => {
    const filters: any[] = [];

    // Map selected options
    Object.entries(selectedOptions).forEach(([attribute, values]) => {
      if (values.length > 0) {
        filters.push({ attribute, values });
      }
    });

    // Map selected booleans
    Object.entries(selectedBooleans).forEach(([attribute, value_boolean]) => {
      if (value_boolean) {
        filters.push({ attribute, value_boolean });
      }
    });

    // Map selected ranges
    Object.entries(selectedRanges).forEach(([attribute, range]) => {
      filters.push({ attribute, min: range[0], max: range[1] });
    });

    onFilterApply(filters);
  };

  return (
    <Card className="sticky top-20 bg-white dark:bg-zinc-950">
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {availableFilters.map(filter => (
          <div key={filter.code} className="space-y-3">
            <h4 className="font-semibold text-sm">{filter.name} {filter.unit ? `(${filter.unit})` : ''}</h4>

            {filter.type === 'option' && filter.options && (
              <div className="space-y-2">
                {filter.options.map(opt => (
                  <div key={opt} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`filter-${filter.code}-${opt}`} 
                      checked={(selectedOptions[filter.code] || []).includes(opt)}
                      onCheckedChange={() => handleOptionToggle(filter.code, opt)}
                    />
                    <Label htmlFor={`filter-${filter.code}-${opt}`} className="font-normal cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {filter.type === 'boolean' && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`filter-${filter.code}`} 
                  checked={!!selectedBooleans[filter.code]}
                  onCheckedChange={(checked) => 
                    setSelectedBooleans(prev => ({ ...prev, [filter.code]: checked as boolean }))}
                />
                <Label htmlFor={`filter-${filter.code}`} className="font-normal cursor-pointer">
                  Has {filter.name}
                </Label>
              </div>
            )}

            {filter.type === 'number' && filter.max !== undefined && (
              <div className="space-y-4 pt-2 px-2">
                <Slider
                  defaultValue={[filter.min || 0, filter.max]}
                  max={filter.max}
                  min={filter.min || 0}
                  step={(filter.max - (filter.min || 0)) / 20}
                  onValueChange={(val) => setSelectedRanges(prev => ({ ...prev, [filter.code]: [(val as number[])[0], (val as number[])[1]] }))}
                />
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>{selectedRanges[filter.code]?.[0] ?? filter.min} {filter.unit}</span>
                  <span>{selectedRanges[filter.code]?.[1] ?? filter.max} {filter.unit}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        <Button className="w-full mt-6" onClick={handleApply} disabled={isLoading}>
          {isLoading ? 'Applying...' : 'Apply Filters'}
        </Button>
      </CardContent>
    </Card>
  );
}
