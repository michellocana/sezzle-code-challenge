import { Calculator } from '@/components/calculator'
import { ThemeToggle } from '@/components/theme-toggle'

function App() {
  return (
    <div className="relative flex min-h-svh items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Calculator />
    </div>
  )
}

export default App
