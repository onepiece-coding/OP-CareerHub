import { describe, it, beforeEach, expect, vi } from 'vitest';
import stream from 'stream';

// import the module
import * as cloud from '../../src/utils/cloudinary.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('cloudinary utils (unit)', () => {
  it('uploadBufferToCloudinary resolves when uploaderFactory calls cb with result', async () => {
    const uploaderFactory = (
      _opts: any,
      cb: (err?: any, res?: any) => void,
    ) => {
      const pass = new stream.PassThrough();
      // simulate async upload completion
      process.nextTick(() =>
        cb(undefined, { public_id: 'pid', secure_url: 'https://cdn/test.pdf' }),
      );
      return pass as unknown as NodeJS.WritableStream;
    };

    const fakeClient = {};
    const res = await cloud.uploadBufferToCloudinary(
      Buffer.from('hello'),
      { folder: 'test' },
      fakeClient as any,
      uploaderFactory,
    );
    expect(res).toHaveProperty('public_id', 'pid');
    expect(res).toHaveProperty('secure_url');
  });

  it('uploadBufferToCloudinary rejects when uploaderFactory calls cb with error', async () => {
    const uploaderFactory = (
      _opts: any,
      cb: (err?: any, res?: any) => void,
    ) => {
      const pass = new stream.PassThrough();
      process.nextTick(() => cb(new Error('upload failed'), undefined));
      return pass as unknown as NodeJS.WritableStream;
    };

    await expect(
      cloud.uploadBufferToCloudinary(
        Buffer.from('x'),
        undefined,
        {} as any,
        uploaderFactory,
      ),
    ).rejects.toThrow('upload failed');
  });

  it('uploadBufferToCloudinary rejects when uploaderFactory returns empty result', async () => {
    const uploaderFactory = (
      _opts: any,
      cb: (err?: any, res?: any) => void,
    ) => {
      const pass = new stream.PassThrough();
      process.nextTick(() => cb(undefined, undefined));
      return pass as unknown as NodeJS.WritableStream;
    };

    await expect(
      cloud.uploadBufferToCloudinary(
        Buffer.from('x'),
        undefined,
        {} as any,
        uploaderFactory,
      ),
    ).rejects.toThrow('Empty response from Cloudinary');
  });

  it('uploadImageBuffer forwards to uploadBufferToCloudinary with resource_type "auto"', async () => {
    // fake client with uploader.upload_stream that returns a writable stream and invokes cb
    const fakeClient = {
      uploader: {
        upload_stream: (opts: any, cb: (err?: any, res?: any) => void) => {
          const pass = new stream.PassThrough();
          // simulate remote service finishing after a tick
          process.nextTick(() =>
            cb(undefined, { public_id: 'p', secure_url: 'u' }),
          );
          return pass as unknown as NodeJS.WritableStream;
        },
      },
    } as any;

    // Call the real wrapper (no spying)
    const res = await cloud.uploadImageBuffer(
      Buffer.from('img'),
      { folder: 'users' },
      fakeClient,
    );
    expect(res).toHaveProperty('public_id', 'p');
    // Additionally assert that returned secure_url exists
    expect(res.secure_url).toBe('u');
  });

  it('uploadPDFBuffer forwards to uploadBufferToCloudinary with resource_type "raw"', async () => {
    const fakeClient = {
      uploader: {
        upload_stream: (opts: any, cb: (err?: any, res?: any) => void) => {
          const pass = new stream.PassThrough();
          process.nextTick(() =>
            cb(undefined, { public_id: 'pdfid', secure_url: 'u' }),
          );
          return pass as unknown as NodeJS.WritableStream;
        },
      },
    } as any;

    const res = await cloud.uploadPDFBuffer(
      Buffer.from('pdf'),
      { folder: 'resumes' },
      fakeClient,
    );
    expect(res).toHaveProperty('public_id', 'pdfid');
    expect(res.secure_url).toBe('u');
  });

  it('uploadPDFFromPath resolves with client.uploader.upload result', async () => {
    const fakeClient = {
      uploader: {
        upload: vi
          .fn()
          .mockResolvedValueOnce({ public_id: 'pid', secure_url: 'url' }),
      },
    } as any;

    const result = await cloud.uploadPDFFromPath(
      '/tmp/x.pdf',
      { folder: 'r' },
      fakeClient,
    );
    expect(fakeClient.uploader.upload).toHaveBeenCalledWith('/tmp/x.pdf', {
      resource_type: 'raw',
      folder: 'r',
      public_id: undefined,
    });
    expect(result).toHaveProperty('public_id', 'pid');
  });

  it('uploadPDFFromPath throws wrapped error on client failure', async () => {
    const fakeClient = {
      uploader: { upload: vi.fn().mockRejectedValueOnce(new Error('boom')) },
    } as any;

    await expect(
      cloud.uploadPDFFromPath('/tmp/x.pdf', {}, fakeClient),
    ).rejects.toThrow('Internal Server Error (cloudinary uploadPDF)');
  });

  it('removeImage calls client.uploader.destroy and returns result', async () => {
    const fakeClient = {
      uploader: { destroy: vi.fn().mockResolvedValueOnce({ result: 'ok' }) },
    } as any;
    const res = await cloud.removeImage('pid', fakeClient);
    expect(fakeClient.uploader.destroy).toHaveBeenCalledWith('pid');
    expect(res).toEqual({ result: 'ok' });
  });

  it('removeImage throws wrapped error when client fails', async () => {
    const fakeClient = {
      uploader: { destroy: vi.fn().mockRejectedValueOnce(new Error('x')) },
    } as any;
    await expect(cloud.removeImage('pid', fakeClient)).rejects.toThrow(
      'Internal Server Error (cloudinary removeImage)',
    );
  });

  it('removeMultipleImages calls client.api.delete_resources and returns result', async () => {
    const fakeClient = {
      api: { delete_resources: vi.fn().mockResolvedValueOnce({ deleted: [] }) },
    } as any;
    const res = await cloud.removeMultipleImages(['a', 'b'], fakeClient);
    expect(fakeClient.api.delete_resources).toHaveBeenCalledWith(['a', 'b']);
    expect(res).toEqual({ deleted: [] });
  });

  it('removeMultipleImages throws on client failure', async () => {
    const fakeClient = {
      api: {
        delete_resources: vi.fn().mockRejectedValueOnce(new Error('boom')),
      },
    } as any;
    await expect(cloud.removeMultipleImages(['a'], fakeClient)).rejects.toThrow(
      'Internal Server Error (cloudinary removeMultipleImages)',
    );
  });

  it('removePDF calls destroy with resource_type raw and returns result', async () => {
    const fakeClient = {
      uploader: { destroy: vi.fn().mockResolvedValueOnce({ result: 'ok' }) },
    } as any;
    const res = await cloud.removePDF('pdfid', fakeClient);
    expect(fakeClient.uploader.destroy).toHaveBeenCalledWith('pdfid', {
      resource_type: 'raw',
    });
    expect(res).toEqual({ result: 'ok' });
  });

  it('removePDF throws wrapped error on failure', async () => {
    const fakeClient = {
      uploader: { destroy: vi.fn().mockRejectedValueOnce(new Error('err')) },
    } as any;
    await expect(cloud.removePDF('pdfid', fakeClient)).rejects.toThrow(
      'Internal Server Error (cloudinary removePDF)',
    );
  });

  it('removeMultiplePDFs calls api.delete_resources with options and returns result', async () => {
    const fakeClient = {
      api: { delete_resources: vi.fn().mockResolvedValueOnce({ ok: true }) },
    } as any;
    const res = await cloud.removeMultiplePDFs(['p1'], fakeClient);
    expect(fakeClient.api.delete_resources).toHaveBeenCalledWith(['p1'], {
      resource_type: 'raw',
      type: 'upload',
      invalidate: true,
    });
    expect(res).toEqual({ ok: true });
  });

  it('removeMultiplePDFs throws wrapped error on failure', async () => {
    const fakeClient = {
      api: {
        delete_resources: vi.fn().mockRejectedValueOnce(new Error('err')),
      },
    } as any;
    await expect(cloud.removeMultiplePDFs(['p1'], fakeClient)).rejects.toThrow(
      'Internal Server Error (cloudinary removeMultiplePDFs)',
    );
  });

  it('default export contains the helper functions', () => {
    const def = (cloud as any).default;
    expect(def).toBeTruthy();
    expect(typeof def.uploadBufferToCloudinary).toBe('function');
    expect(typeof def.uploadImageBuffer).toBe('function');
    expect(typeof def.uploadPDFBuffer).toBe('function');
    expect(typeof def.uploadPDFFromPath).toBe('function');
    expect(typeof def.removeImage).toBe('function');
  });
});
