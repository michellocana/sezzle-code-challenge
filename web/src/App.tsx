import { Calculator } from '@/components/calculator'
import { ThemeToggle } from '@/components/theme-toggle'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <div className="relative flex min-h-svh items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Calculator />
      <Toaster position="bottom-center" />
    </div>
  )
}

export default App
