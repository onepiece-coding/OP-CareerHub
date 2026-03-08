import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock multer BEFORE importing the module under test
vi.mock('multer', () => {
  // a very small fake of multer's API that fileUpload.ts relies on.

  const memoryStorage = () => 'memory-storage-fn';
  const diskStorage = (opts: any) => {
    // return an object exposing the destination/filename functions we passed in
    return { destination: opts.destination, filename: opts.filename };
  };

  const multerFactory = (opts: any) => {
    // return an object that preserves the options so tests can assert them
    const result: any = {
      _opts: opts,
      storage: opts?.storage ?? 'no-storage',
      fileFilter: opts?.fileFilter,
      limits: opts?.limits,
      single: (fieldName: string) => `single:${fieldName}`,
      array: (fieldName: string, maxCount?: number) =>
        `array:${fieldName}:${maxCount ?? ''}`,
      fields: (fields: any) => `fields:${JSON.stringify(fields)}`,
    };
    return result;
  };

  multerFactory.memoryStorage = memoryStorage;
  multerFactory.diskStorage = diskStorage;

  return {
    default: multerFactory,
    memoryStorage,
    diskStorage,
  };
});

const modPromise = import('../../src/middlewares/fileUpload.js');

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  try {
    vi.useRealTimers();
  } catch {
    /* ignore */
  }
});

describe('fileUpload middleware utilities', () => {
  it('imageFileFilter accepts image mimetypes', async () => {
    const mod = await modPromise;
    const cb = vi.fn();
    const fakeFile: any = { mimetype: 'image/png' };
    mod.imageFileFilter({} as any, fakeFile, cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('imageFileFilter rejects non-image mimetypes with helpful message', async () => {
    const mod = await modPromise;
    const cb = vi.fn();
    const fakeFile: any = { mimetype: 'text/plain' };
    mod.imageFileFilter({} as any, fakeFile, cb);
    expect(cb).toHaveBeenCalled();
    const firstArg = cb.mock.calls[0][0];
    expect(firstArg).toBeInstanceOf(Error);
    expect(String(firstArg.message)).toMatch(/Only images are allowed/i);
  });

  it('pdfFileFilter accepts application/pdf', async () => {
    const mod = await modPromise;
    const cb = vi.fn();
    const fakeFile: any = { mimetype: 'application/pdf' };
    mod.pdfFileFilter({} as any, fakeFile, cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('pdfFileFilter rejects non-pdf mimetypes', async () => {
    const mod = await modPromise;
    const cb = vi.fn();
    const fakeFile: any = { mimetype: 'image/png' };
    mod.pdfFileFilter({} as any, fakeFile, cb);
    expect(cb).toHaveBeenCalled();
    const firstArg = cb.mock.calls[0][0];
    expect(firstArg).toBeInstanceOf(Error);
    expect(String(firstArg.message)).toMatch(/Only PDFs are allowed/i);
  });

  it('DEFAULT_IMAGE_LIMITS and DEFAULT_PDF_LIMITS have expected sizes', async () => {
    const mod = await modPromise;
    expect(mod.DEFAULT_IMAGE_LIMITS).toHaveProperty('fileSize');
    expect(mod.DEFAULT_PDF_LIMITS).toHaveProperty('fileSize');
    expect(mod.DEFAULT_IMAGE_LIMITS.fileSize).toBe(1 * 1024 * 1024); // 1MB
    expect(mod.DEFAULT_PDF_LIMITS.fileSize).toBe(2 * 1024 * 1024); // 2MB
  });

  it('memoryUpload, photoUploadMemory, pdfUploadMemory expose multer-like API', async () => {
    const mod = await modPromise;
    expect(typeof mod.memoryUpload.single).toBe('function');
    // @ts-ignore
    expect(mod.photoUploadMemory._opts).toBeDefined();
    // @ts-ignore
    expect(mod.photoUploadMemory.fileFilter).toBe(mod.imageFileFilter);
    // @ts-ignore
    expect(mod.photoUploadMemory.limits).toBe(mod.DEFAULT_IMAGE_LIMITS);

    // @ts-ignore
    expect(mod.pdfUploadMemory.fileFilter).toBe(mod.pdfFileFilter);
    // @ts-ignore
    expect(mod.pdfUploadMemory.limits).toBe(mod.DEFAULT_PDF_LIMITS);

    // @ts-ignore
    expect(mod.singleImage('avatar')).toBe('single:avatar');
    // @ts-ignore
    expect(mod.multipleImages()).toBe('array:images:5');
    // @ts-ignore
    expect(mod.singlePDF('resume')).toBe('single:resume');
    // @ts-ignore
    expect(mod.multiplePDFs()).toBe('array:pdfs:3');

    // @ts-ignore
    const fieldsResult = mod.uploadFields([{ name: 'image', maxCount: 2 }]);
    expect(String(fieldsResult)).toMatch(/^fields:/);
  });

  it('createPhotoDiskUpload returns multer instance with disk storage and its filename generator produces safe name', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T12:34:56Z'));

    const mod = await modPromise;

    const imagesDir = '/tmp/images';
    const inst = mod.createPhotoDiskUpload(imagesDir, mod.DEFAULT_IMAGE_LIMITS);

    // @ts-ignore
    expect(inst._opts).toBeDefined();
    // @ts-ignore
    const storage = inst.storage;
    expect(storage).toHaveProperty('destination');
    expect(typeof storage.destination).toBe('function');
    expect(storage).toHaveProperty('filename');
    expect(typeof storage.filename).toBe('function');

    const destCb = vi.fn();
    // @ts-ignore
    storage.destination({} as any, { originalname: 'x' } as any, destCb);
    expect(destCb).toHaveBeenCalledWith(null, imagesDir);

    const filenameCb = vi.fn();
    // @ts-ignore
    storage.filename({} as any, { originalname: 'my.png' } as any, filenameCb);
    expect(filenameCb).toHaveBeenCalled();
    const calledWith = filenameCb.mock.calls[0][1];
    expect(String(calledWith)).toContain('2020-01-01T12-34-56');
    expect(String(calledWith)).toContain('-my.png');

    // restore timers
    vi.useRealTimers();
  });
});
