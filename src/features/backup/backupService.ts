import Dexie from 'dexie';

export class BackupService {
  static async createSnapshot(name = 'manual'): Promise<string> {
    const payload = await (await import('./exportRepository')).exportAll();
    const serialized = JSON.stringify(payload);
    const fileName = `contextos-backup-${name}-${Date.now()}.json`;
    const blob = new Blob([serialized], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return fileName;
  }
}
