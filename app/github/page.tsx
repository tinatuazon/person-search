import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GithubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">GitHub Repository</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Source Code</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You can view the source code for Person Search on GitHub:</p>
            <a
              href="https://github.com/tinatuazon/person-search"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline text-lg hover:text-primary/80"
            >
              github.com/tinatuazon/person-search
            </a>
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
