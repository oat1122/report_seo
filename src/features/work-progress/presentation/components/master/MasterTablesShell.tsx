"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryManager } from "./CategoryManager";
import { StatusManager } from "./StatusManager";

export function MasterTablesShell() {
  return (
    <Tabs defaultValue="categories" className="w-full">
      <TabsList>
        <TabsTrigger value="categories">หมวด</TabsTrigger>
        <TabsTrigger value="statuses">สถานะ</TabsTrigger>
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
    </Tabs>
  );
}
