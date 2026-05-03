import { Injectable } from '@angular/core';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {

  async init(): Promise<void> {
    try {
      const rc = getRemoteConfig();
      rc.defaultConfig = { enable_task_stats: false };

      // In dev mode, always fetch fresh values; in prod use default 12h interval
      if (!environment.production) {
        rc.settings.minimumFetchIntervalMillis = 0;
      }

      await fetchAndActivate(rc);
    } catch (error) {
      console.warn('FeatureFlagService: Remote Config fetch failed, using defaults', error);
    }
  }

  getBoolean(key: string): boolean {
    try {
      const rc = getRemoteConfig();
      return getValue(rc, key).asBoolean();
    } catch {
      return false;
    }
  }
}
