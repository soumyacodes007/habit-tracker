import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function WelcomeSection({ userName = 'Annie B.' }) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-accent/20 to-primary/10">
      <div className="p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground mb-2">Hello,</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {userName}
          </h1>
          <p className="text-foreground/80 mb-6">
            You're doing great! Keep track of your habits and emotions for a healthier life.
          </p>
          <Link href="/habits">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start a New Habit
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
