import { Card, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import SectionGrouping from "./SectionGrouping";

export default function GroupManagementPanel({
  previewData,
  previewKeys,
  previewGroups,
  setPreviewGroups,
  REPORT_META,
}: any) {
  if (!previewData) return null;

  const GROUPING_ENABLED = ["pl", "bs"];

  return (
    <Card className="border">
      <CardContent className="space-y-6">
        <h2 className="text-lg font-semibold">Group Management</h2>

        <Tabs
          defaultValue={previewKeys.find((k: string) =>
            GROUPING_ENABLED.includes(k)
          )}
        >
          <TabsList>
            {previewKeys
              .filter((k: string) => GROUPING_ENABLED.includes(k))
              .map((k: string) => (
                <TabsTrigger key={k} value={k}>
                  {REPORT_META[k].label}
                </TabsTrigger>
              ))}
          </TabsList>

          {previewKeys.map((k: string) => {
            const mis = previewData.mis[k];
            if (!mis) return null;

            return (
              <TabsContent key={k} value={k}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mis.sections.map((section: any, idx: number) => {
                    const sectionKey = `${k}-section-${idx}`;

                    return (
                      <Card key={sectionKey} className="border">
                        <CardContent className="space-y-3">
                          <h3 className="font-semibold text-sm uppercase">
                            {section.heading}
                          </h3>

                          <SectionGrouping
                            sectionKey={sectionKey}
                            rows={section.rows}
                            previewGroups={previewGroups}
                            setPreviewGroups={setPreviewGroups}
                            mode="groups"
                            colCount={0}
                            enableGrouping={GROUPING_ENABLED.includes(k)}
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
