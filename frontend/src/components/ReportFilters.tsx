import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";


type ReportFiltersProps = {
  clients: any[];
  templates: any[];

  selectedClient: string;
  setSelectedClient: (v: string) => void;

  selectedTemplate: string;
  setSelectedTemplate: (v: string) => void;

  startDate: string;
  setStartDate: (v: string) => void;

  endDate: string;
  setEndDate: (v: string) => void;

  onClear: () => void;
};

const ReportFilters = ({
  clients,
  templates,
  selectedClient,
  setSelectedClient,
  selectedTemplate,
  setSelectedTemplate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClear,
}: ReportFiltersProps) => {
  return (
    <div className="flex gap-4 items-center flex-wrap">
      {/* Client */}
      <Select value={selectedClient} onValueChange={setSelectedClient}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Client" />
        </SelectTrigger>
        <SelectContent position="item-aligned" className="mt-18">
          <SelectGroup>
            <SelectLabel>Clients</SelectLabel>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Template */}
      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Template" />
        </SelectTrigger>
        <SelectContent position="item-aligned" className="mt-18">
          <SelectGroup>
            <SelectLabel>Templates</SelectLabel>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.template_name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Start Date */}
      <Input
        type="date"
        value={startDate}
        className="w-[160px]"
        onChange={(e) => setStartDate(e.target.value)}
      />

      {/* End Date */}
      <Input
        type="date"
        value={endDate}
        className="w-[160px]"
        onChange={(e) => setEndDate(e.target.value)}
      />

      {/* Clear */}
      <Button
        onClick={onClear}
        className="w-[130px]"
        variant="outline"
      >
        Clear
      </Button>
    </div>
  );
};

export default ReportFilters;
