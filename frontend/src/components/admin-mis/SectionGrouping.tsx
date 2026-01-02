import { useState } from "react";
import {
  TableRow,
  TableCell,
  TableBody,
} from "../ui/table";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

import { Pencil, Trash2, Save, X } from "lucide-react";

// Group structure
interface Group {
  name: string;
  entries: string[];
}

// Section state
interface SectionState {
  groups: Group[];
}

// Component props
interface Props {
  sectionKey: string;
  rows: any[];
  previewGroups: Record<string, SectionState>;
  setPreviewGroups: (fn: any) => void;
  colCount: number;
  mode: "groups" | "rows";
  enableGrouping: boolean;
}



export default function SectionGrouping({
  sectionKey,
  rows,
  previewGroups,
  setPreviewGroups,
  mode,
  enableGrouping
}: Props) {

  if (!enableGrouping) {
  // No group UI
  if (mode === "groups") return null;

  // No dropdown column
  if (mode === "rows") {
    return (
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name}>
            <TableCell className="pl-6 font-medium">
              {row.name}
            </TableCell>

            {row.values?.map((v: any, i: number) => (
              <TableCell key={i} className="text-right">
                {typeof v === "number"
                  ? v.toLocaleString("en-IN")
                  : v}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    );
  }
}


  const section = previewGroups[sectionKey] || { groups: [] }; // If this section already has groups → use them
  const groups = section.groups; // Else start with empty groups

  // This ensure:
     // Only current section groups are updated
     // Other sections groups are not affected
  const updateGroups = (updated: Group[]) => {
    setPreviewGroups((prev: any) => ({
      ...prev,
      [sectionKey]: { groups: updated },
    }));
  };

  // CRUD operations begins 

  // Add groups 

  // Prevents empty group names
  // Creates group with no entries initially
  const addGroup = (name: string) => {
    if (!name.trim()) return;
    updateGroups([...groups, { name: name.trim(), entries: [] }]);
  };

  // Edit groups
  
  // Find group by name
  // Updates group name
  // Entries stay unchanged
  const editGroup = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    updateGroups(
      groups.map((g) =>
        g.name === oldName ? { ...g, name: newName.trim() } : g
      )
    );
  };

  // Delete groups

  // Remove the group from the list
  // Rows become ungrouped
  const deleteGroup = (name: string) => {
    updateGroups(groups.filter((g) => g.name !== name));
  };

  // Group mapping logic 

  // Find which group a row belongs to
  // Used to pre select group in dropdown
  const findGroup = (rowName: string) => {
    const g = groups.find((g) => g.entries.includes(rowName));
    return g ? g.name : null;
  };

  // Assign group to row

  // Row belongs to only one group
  // Automatically removed from other groups
  // No duplicate entries
  const assignGroup = (rowName: string, groupName: string) => {
    updateGroups(
      groups.map((g) => {
        if (g.name === groupName) {
          return { ...g, entries: [...new Set([...g.entries, rowName])] };
        }
        return { ...g, entries: g.entries.filter((e) => e !== rowName) };
      })
    );
  };

  // Remove group from row

  // Row is removed from group
  const removeGroup = (rowName: string) => {
    updateGroups(
      groups.map((g) => ({
        ...g,
        entries: g.entries.filter((e) => e !== rowName),
      }))
    );
  };


// Group mapping UI
  if (mode === "groups") {
    return (
      <div className="space-y-3">
        {groups.length === 0 && (
          <p className="text-xs text-gray-500">No groups created yet.</p>
        )}

        {groups.map((g) => (
          <GroupItem
            key={g.name}
            group={g}
            onEdit={editGroup}
            onDelete={deleteGroup}
          />
        ))}

        <AddGroupForm onAdd={addGroup} />
      </div>
    );
  }


// Preview table rows
  if (mode === "rows") {
    return (
      <TableBody>
        {rows.map((row) => {
          const currentGroup = findGroup(row.name);

          return (
            <TableRow key={row.name} className="hover:bg-gray-50">
              {/* NAME */}
              <TableCell className="pl-6 font-medium">{row.name}</TableCell>

              {/* VALUES */}
              {row.values?.map((v: any, i: number) => (
                <TableCell key={i} className="text-right">
                  {typeof v === "number" ? v.toLocaleString("en-IN") : v}
                </TableCell>
              ))}

              {/* GROUP DROPDOWN */}
              <TableCell className="text-right pr-4">
                <Select
                  value={currentGroup ?? "__none__"}
                  onValueChange={(value) => {
                    if (value === "__none__") removeGroup(row.name);
                    else assignGroup(row.name, value);
                  }}
                >
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="__none__">No Group</SelectItem>
                    {groups.map((g) => (
                      <SelectItem key={g.name} value={g.name}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    );
  }

  return null;
}

// Group item component 
function GroupItem({
  group,
  onEdit,
  onDelete,
}: {
  group: Group;
  onEdit: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(group.name);

  return (
    <div className="flex justify-between items-center border bg-white px-3 py-2 rounded-md">
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            className="h-7 w-[180px] text-xs"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              onEdit(group.name, value);
              setEditing(false);
            }}
          >
            <Save size={13} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setEditing(false)}
          >
            <X size={13} />
          </Button>
        </div>
      ) : (
        <span className="text-sm font-medium">{group.name}</span>
      )}

      <div className="flex items-center gap-2">
        <Pencil
          size={14}
          className="text-gray-500 hover:text-blue-600 cursor-pointer"
          onClick={() => setEditing(true)}
        />
        <Trash2
          size={14}
          className="text-red-500 hover:text-red-700 cursor-pointer"
          onClick={() => onDelete(group.name)}
        />
      </div>
    </div>
  );
}


// Add group form
function AddGroupForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");

  if (!adding) {
    return (
      <Button size="sm" onClick={() => setAdding(true)}>
        + Add Group
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        className="h-8 w-[200px] text-xs"
        placeholder="Group name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        size="sm"
        onClick={() => {
          onAdd(value);
          setValue("");
          setAdding(false);
        }}
      >
        Save
      </Button>
      <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
        Cancel
      </Button>
    </div>
  );
}
