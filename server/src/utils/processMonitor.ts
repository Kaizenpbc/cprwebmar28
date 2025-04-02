import os from 'os';

export interface ProcessMetrics {
  cpu: {
    cores: number;
    usage: string;
    model: string;
    speed: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usage: string;
  };
  uptime: number;
  startTime: string;
}

export class ProcessMonitor {
  private static instance: ProcessMonitor;
  private startTime: Date;

  private constructor() {
    this.startTime = new Date();
  }

  public static getInstance(): ProcessMonitor {
    if (!ProcessMonitor.instance) {
      ProcessMonitor.instance = new ProcessMonitor();
    }
    return ProcessMonitor.instance;
  }

  public async collectMetrics(): Promise<ProcessMetrics> {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0) / cpus.length;

    return {
      cpu: {
        cores: cpus.length,
        usage: cpuUsage.toFixed(2),
        model: cpus[0].model,
        speed: cpus[0].speed
      },
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usage: ((usedMem / totalMem) * 100).toFixed(2)
      },
      uptime: process.uptime(),
      startTime: this.startTime.toISOString()
    };
  }
} 