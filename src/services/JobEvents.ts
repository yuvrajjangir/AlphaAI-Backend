import { EventEmitter } from 'events';

type JobListener = (data: any) => void;

export class JobEvents extends EventEmitter {
  private static instance: JobEvents;
  private listenersMap: Map<string, JobListener[]> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): JobEvents {
    if (!JobEvents.instance) {
      JobEvents.instance = new JobEvents();
    }
    return JobEvents.instance;
  }

  public emitProgress(
    jobId: string,
    progress: number,
    state: string = 'in_progress',
  ) {
    const data = { jobId, progress, state };
    this.emit(`job:${jobId}`, data);
  }

  public onJobProgress(jobId: string, callback: JobListener) {
    this.on(`job:${jobId}`, callback);

    if (!this.listenersMap.has(jobId)) {
      this.listenersMap.set(jobId, []);
    }
    this.listenersMap.get(jobId)!.push(callback);
  }

  public removeJobListeners(jobId: string) {
    const listeners = this.listenersMap.get(jobId);
    if (listeners) {
      for (const listener of listeners) {
        this.off(`job:${jobId}`, listener);
      }
      this.listenersMap.delete(jobId);
    }
  }
}
