import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          SIMFORGE AI
        </h1>
        <p className="text-center mb-8 text-lg">
          Convert DroneWERX threads into VelociDrone missions in under 2 minutes
        </p>
        <div className="flex justify-center">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
          >
            Launch Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
