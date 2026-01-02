import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";

import MISRenderer from "./MISRenderer";

type ReportPreviewProps = {
  previewData: any;
  previewKeys: string[];

  previewGroups: Record<string, any>;
  setPreviewGroups: React.Dispatch<React.SetStateAction<any>>;

  REPORT_META: Record<string, { label: string; Icon: any }>;
  GROUPING_ENABLED: string[];

  onSaveGroups: () => void;
  onPublish: () => void;
  onUnpublish: () => void;

  savingGroups: boolean;
  publishing: boolean;
};

const ReportPreview = ({
  previewData,
  previewKeys,
  previewGroups,
  setPreviewGroups,
  REPORT_META,
  GROUPING_ENABLED,
  onSaveGroups,
  onPublish,
  onUnpublish,
  savingGroups,
  publishing,
}: ReportPreviewProps) => {
  if (!previewData?.mis || previewKeys.length === 0) return null;

  return (
    <Card className="border shadow-md">
      <CardContent>
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold uppercase">
              Preview: {previewData?.report?.client_name || ""}
            </h2>
            <p className="text-sm text-gray-600">
              {previewData?.mis?.period || ""}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <Button
              className="bg-blue-600 text-white"
              onClick={onSaveGroups}
              disabled={
                savingGroups ||
                !previewKeys.some((k) => GROUPING_ENABLED.includes(k))
              }
            >
              {savingGroups ? "Saving..." : "Save Groups"}
            </Button>

            {previewData.published ? (
              <Button variant="destructive" onClick={onUnpublish}>
                {publishing ? "Unpublishing..." : "Unpublish"}
              </Button>
            ) : (
              <Button className="bg-green-600" onClick={onPublish}>
                {publishing ? "Publishing..." : "Publish"}
              </Button>
            )}
          </div>
        </div>

        {/* TABS */}
        <Tabs defaultValue={previewKeys[0]}>
          <TabsList className="mb-5 flex flex-wrap gap-2">
            {previewKeys.map((k) => {
              const meta = REPORT_META[k];
              const Icon = meta.Icon;

              return (
                <TabsTrigger key={k} value={k} className="flex gap-2">
                  <Icon size={14} />
                  {meta.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {previewKeys.map((k) => (
            <TabsContent key={k} value={k}>
              <MISRenderer
                mis={previewData.mis[k]}
                typeKey={k}
                previewGroups={previewGroups}
                setPreviewGroups={setPreviewGroups}
                groupingEnabled={GROUPING_ENABLED}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReportPreview;
