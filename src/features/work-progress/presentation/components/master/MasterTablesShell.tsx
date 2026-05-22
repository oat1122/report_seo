"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryManager } from "./CategoryManager";
import { StatusManager } from "./StatusManager";
import { MarkTypeManager } from "./MarkTypeManager";

export function MasterTablesShell() {
  return (
    <Tabs defaultValue="categories" className="w-full">
      <TabsList>
        <TabsTrigger value="categories">หมวด</TabsTrigger>
        <TabsTrigger value="statuses">สถานะ</TabsTrigger>
        <TabsTrigger value="markTypes">สัญลักษณ์ period</TabsTrigger>
      </TabsList>

      <TabsContent value="categories">
        <Card>
          <CardContent className="pt-6">
            <CategoryManager />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="statuses">
        <Card>
          <CardContent className="pt-6">
            <StatusManager />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="markTypes">
        <Card>
          <CardContent className="pt-6">
            <MarkTypeManager />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
