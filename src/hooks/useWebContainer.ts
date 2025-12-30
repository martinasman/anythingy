'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { WebContainer, type FileSystemTree } from '@webcontainer/api'

export type WebContainerStatus =
  | 'idle'
  | 'booting'
  | 'mounting'
  | 'installing'
  | 'starting'
  | 'ready'
  | 'error'

interface UseWebContainerReturn {
  status: WebContainerStatus
  previewUrl: string | null
  terminalOutput: string[]
  error: string | null
  mountFiles: (files: FileSystemTree) => Promise<void>
  writeFile: (path: string, content: string) => Promise<void>
  restart: () => Promise<void>
  isReady: boolean
}

// Singleton instance - WebContainer can only boot once per page
let webcontainerInstance: WebContainer | null = null
let bootPromise: Promise<WebContainer> | null = null

async function getWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) {
    return webcontainerInstance
  }

  if (bootPromise) {
    return bootPromise
  }

  bootPromise = WebContainer.boot()
  webcontainerInstance = await bootPromise
  return webcontainerInstance
}

export function useWebContainer(): UseWebContainerReturn {
  const [status, setStatus] = useState<WebContainerStatus>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const containerRef = useRef<WebContainer | null>(null)
  const serverProcessRef = useRef<ReturnType<WebContainer['spawn']> | null>(null)

  const addTerminalLine = useCallback((line: string) => {
    setTerminalOutput(prev => [...prev.slice(-100), line]) // Keep last 100 lines
  }, [])

  const bootContainer = useCallback(async () => {
    if (containerRef.current) return containerRef.current

    try {
      setStatus('booting')
      setError(null)
      addTerminalLine('> Booting WebContainer...')

      const container = await getWebContainer()
      containerRef.current = container

      // Listen for server-ready events
      container.on('server-ready', (port, url) => {
        addTerminalLine(`> Server ready on port ${port}`)
        setPreviewUrl(url)
        setStatus('ready')
      })

      addTerminalLine('> WebContainer booted successfully')
      return container
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to boot WebContainer'
      setError(message)
      setStatus('error')
      addTerminalLine(`> Error: ${message}`)
      throw err
    }
  }, [addTerminalLine])

  const mountFiles = useCallback(async (files: FileSystemTree) => {
    try {
      const container = await bootContainer()

      setStatus('mounting')
      addTerminalLine('> Mounting project files...')

      await container.mount(files)
      addTerminalLine('> Files mounted successfully')

      // Run npm install
      setStatus('installing')
      addTerminalLine('> Running npm install...')

      const installProcess = await container.spawn('npm', ['install'])

      // Stream install output
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          const lines = data.split('\n').filter(Boolean)
          lines.forEach(line => addTerminalLine(line))
        }
      }))

      const installExitCode = await installProcess.exit

      if (installExitCode !== 0) {
        throw new Error(`npm install failed with exit code ${installExitCode}`)
      }

      addTerminalLine('> Dependencies installed successfully')

      // Start the dev server
      setStatus('starting')
      addTerminalLine('> Starting Vite dev server...')

      // Kill previous server if exists
      if (serverProcessRef.current) {
        serverProcessRef.current.then(p => p.kill())
      }

      serverProcessRef.current = container.spawn('npm', ['run', 'dev'])

      const devProcess = await serverProcessRef.current

      // Stream dev server output
      devProcess.output.pipeTo(new WritableStream({
        write(data) {
          const lines = data.split('\n').filter(Boolean)
          lines.forEach(line => addTerminalLine(line))
        }
      }))

      // Note: status will change to 'ready' via server-ready event

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mount files'
      setError(message)
      setStatus('error')
      addTerminalLine(`> Error: ${message}`)
    }
  }, [bootContainer, addTerminalLine])

  const restart = useCallback(async () => {
    try {
      setStatus('starting')
      setPreviewUrl(null)
      setError(null)
      addTerminalLine('> Restarting dev server...')

      const container = containerRef.current
      if (!container) {
        throw new Error('WebContainer not initialized')
      }

      // Kill previous server
      if (serverProcessRef.current) {
        const process = await serverProcessRef.current
        process.kill()
      }

      // Start new server
      serverProcessRef.current = container.spawn('npm', ['run', 'dev'])

      const devProcess = await serverProcessRef.current

      devProcess.output.pipeTo(new WritableStream({
        write(data) {
          const lines = data.split('\n').filter(Boolean)
          lines.forEach(line => addTerminalLine(line))
        }
      }))

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restart'
      setError(message)
      setStatus('error')
      addTerminalLine(`> Error: ${message}`)
    }
  }, [addTerminalLine])

  // Write a single file (for hot reload)
  const writeFile = useCallback(async (path: string, content: string) => {
    const container = containerRef.current
    if (!container) {
      console.warn('WebContainer not initialized, cannot write file')
      return
    }

    try {
      await container.fs.writeFile(path, content)
    } catch (err) {
      console.error('Failed to write file:', err)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (serverProcessRef.current) {
        serverProcessRef.current.then(p => p.kill()).catch(() => {})
      }
    }
  }, [])

  return {
    status,
    previewUrl,
    terminalOutput,
    error,
    mountFiles,
    writeFile,
    restart,
    isReady: status === 'ready',
  }
}
