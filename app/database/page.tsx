import React from "react";
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DatabasePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Database & Prisma Schema</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Prisma Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto mb-4">
{`
model Person {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`}
            </pre>
            <p>
              The <code>Person</code> model represents a user in the database. Each person has a unique <code>id</code>, <code>name</code>, <code>email</code>, and timestamps for creation and updates. Prisma manages migrations and type safety for all database operations.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Database Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-6 mb-4">
              <li><strong>Table:</strong> <code>Person</code></li>
              <li><strong>Primary Key:</strong> <code>id</code> (auto-increment integer)</li>
              <li><strong>Fields:</strong> <code>name</code>, <code>email</code> (unique), <code>createdAt</code>, <code>updatedAt</code></li>
            </ul>
            <p>
              The database is managed via Prisma migrations and connects to a PostgreSQL instance for reliable, scalable data storage.
            </p>
          </CardContent>
        </Card>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">
            Back to Home
          </Link>
        </Button>
      </main>
    </div>
  );
}
