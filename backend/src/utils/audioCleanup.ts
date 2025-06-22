import fs from 'fs';
import path from 'path';

export class AudioCleanup {
  private static publicDir = path.join(__dirname, '../../public');

  static async cleanupOldAudioFiles(maxAgeMinutes: number = 30): Promise<void> {
    try {
      if (!fs.existsSync(this.publicDir)) {
        return;
      }

      const files = fs.readdirSync(this.publicDir);
      const now = Date.now();
      let cleanedCount = 0;

      for (const file of files) {
        if (file.startsWith('tts_') && file.endsWith('.wav')) {
          const filePath = path.join(this.publicDir, file);
          const stats = fs.statSync(filePath);
          const ageMinutes = (now - stats.mtime.getTime()) / (1000 * 60);

          if (ageMinutes > maxAgeMinutes) {
            fs.unlinkSync(filePath);
            cleanedCount++;
          }
        }
      }

      if (cleanedCount > 0) {
        console.log(`🗑️ Cleaned up ${cleanedCount} old audio files`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up audio files:', error);
    }
  }

  static async cleanupSessionAudioFiles(sessionId: string): Promise<void> {
    try {
      if (!fs.existsSync(this.publicDir)) {
        return;
      }

      const files = fs.readdirSync(this.publicDir);
      let cleanedCount = 0;

      for (const file of files) {
        if (file.includes(sessionId) && file.endsWith('.wav')) {
          const filePath = path.join(this.publicDir, file);
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`🗑️ Cleaned up ${cleanedCount} audio files for session ${sessionId}`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up session audio files:', error);
    }
  }

  static startPeriodicCleanup(intervalMinutes: number = 60): void {
    setInterval(() => {
      this.cleanupOldAudioFiles(30);
    }, intervalMinutes * 60 * 1000);
    
    console.log(`🔄 Started periodic audio cleanup every ${intervalMinutes} minutes`);
  }
}
