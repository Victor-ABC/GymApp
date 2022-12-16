import { Camera, CameraResultType } from '@capacitor/camera';
import { ExceptionCode, Plugins } from '@capacitor/core';

export class PictureService {
  async takePhoto() {
    const { Camera } = Plugins;

    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      saveToGallery: false
    });
    if (photo.webPath) {
      return photo;
    }
    throw new Error('Failed to Load Picture');
  }
  async takePhotoBlob(): Promise<Blob | null> {
    const { Camera } = Plugins;
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        saveToGallery: false
      });
      if (!photo.webPath) {
        return null;
      }
      const blob: Blob = await (await fetch(photo.webPath)).blob();
      return blob;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async selectPhoto(): Promise<Blob> {
    return new Promise<Blob>((res, rej) => {
      const uploadInput = document.createElement('input');
      uploadInput.setAttribute('accept', 'image/*');
      uploadInput.setAttribute('type', 'file');
      uploadInput.setAttribute('name', 'file');
      uploadInput.setAttribute('id', 'image-file-input');
      uploadInput.style.display = 'none';
      uploadInput.addEventListener('change', () => {
        const file = uploadInput.files ? uploadInput.files[0] : null;
        document.body.removeChild(uploadInput);
        if (!file) {
          return rej();
        }
        return res(file);
      });
      document.body.appendChild(uploadInput);
      uploadInput.click();
    });
  }
}
