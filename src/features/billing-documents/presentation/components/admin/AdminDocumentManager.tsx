"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AllDocumentsTable } from "./AllDocumentsTable";

export function AdminDocumentManager() {
  return (
    <Card>
      <CardContent className="pt-6">
        <AllDocumentsTable />
      </CardContent>
    </Card>
  );
}
