import { Card, CardContent } from "../components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import SectionGrouping from "../components/admin-mis/SectionGrouping";

type MISRendererProps = {
  mis: any;
  typeKey: string;

  previewGroups: Record<string, any>;
  setPreviewGroups: React.Dispatch<React.SetStateAction<any>>;

  groupingEnabled: string[];
};

const MISRenderer = ({
  mis,
  typeKey,
  previewGroups,
  setPreviewGroups,
  groupingEnabled,
}: MISRendererProps) => {
  if (!mis) return null;

  const headers = mis.headers || [];
  const sections = mis.sections || [];
  const colCount = headers.length;

  return (
    <div className="space-y-10">
      {sections.map((section: any, idx: number) => {
        const sectionKey = `${typeKey}-section-${idx}`;

        return (
          <div key={sectionKey} className="space-y-4">
            {/* SECTION HEADING */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold border-l-4 border-blue-600 pl-3">
                {section.heading}
              </h3>
            </div>

            {/* PREVIEW TABLE */}
            <Card className="border">
              <CardContent className="p-0">
                <Table>
                  <colgroup>
                    <col style={{ width: "40%" }} />
                    {headers.slice(1).map((_: string, i: number) => (
                      <col
                        key={i}
                        style={{
                          width: `${60 / (headers.length - 1)}%`,
                        }}
                      />
                    ))}
                    <col style={{ width: "15%" }} />
                  </colgroup>

                  <TableHeader>
                    <TableRow>
                      {headers.map((h: string, i: number) => (
                        <TableHead
                          key={i}
                          className={i === 0 ? "text-left" : "text-right"}
                        >
                          {h}
                        </TableHead>
                      ))}

                      {groupingEnabled.includes(typeKey) && (
                        <TableHead className="text-left">
                          Group
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>

                  <SectionGrouping
                    sectionKey={sectionKey}
                    rows={section.rows}
                    colCount={colCount}
                    previewGroups={previewGroups}
                    setPreviewGroups={setPreviewGroups}
                    mode="rows"
                    enableGrouping={groupingEnabled.includes(typeKey)}
                  />
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default MISRenderer;
