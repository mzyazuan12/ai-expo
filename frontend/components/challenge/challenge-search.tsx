"use client";

import { useState } from "react";
import { SearchFilters } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";

interface ChallengeSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export function ChallengeSearch({ onSearch, initialFilters }: ChallengeSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({});
    onSearch({});
  };

  const handleDateRangeChange = (range: { start: string; end: string }) => {
    setFilters(prev => ({ ...prev, date_range: range }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Search Challenges</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search challenges..."
              value={filters.query || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">TRL Level</label>
                <Select
                  value={filters.trl?.[0]?.toString()}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, trl: [parseInt(value)] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select TRL" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        TRL {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Urgency</label>
                <Select
                  value={filters.urgency?.[0]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, urgency: [value] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Classification</label>
                <Select
                  value={filters.classification_level?.[0]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, classification_level: [value] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unclassified">Unclassified</SelectItem>
                    <SelectItem value="confidential">Confidential</SelectItem>
                    <SelectItem value="secret">Secret</SelectItem>
                    <SelectItem value="top_secret">Top Secret</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Provider Type</label>
                <Select
                  value={filters.provider_type?.[0]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, provider_type: [value] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academia">Academia</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="industry">Industry</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DateRangePicker
                  value={filters.date_range}
                  onChange={handleDateRangeChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={filters.sort_by}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sort_by: value as SearchFilters['sort_by'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="upvotes">Upvotes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {key}: {Array.isArray(value) ? value.join(", ") : value.toString()}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => setFilters(prev => ({ ...prev, [key]: undefined }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="ml-auto"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 