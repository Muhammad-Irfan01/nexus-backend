import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService {
  private client: SupabaseClient;
  private bucket = 'documents';

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // NOT the anon key - needs write access
    );
  }

  async upload(fileName: string, buffer: Buffer, mimeType: string): Promise<string> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(fileName, buffer, { contentType: mimeType });

    if (error) throw error;
    return fileName; // store this in storagePath
  }

  async download(fileName: string): Promise<Buffer> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .download(fileName);

    if (error) throw error;
    return Buffer.from(await data.arrayBuffer());
  }

  async delete(fileName: string): Promise<void> {
    await this.client.storage.from(this.bucket).remove([fileName]);
  }
}
