import {useCallback, useState} from "react";
import Cropper from "react-easy-crop";
import styles from './ImageCropModal.module.css'

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (croppedImage: Blob) => void;
    imageSrc: string;
}

export const ImageCropModal = ({ isOpen, onClose, onSave, imageSrc }: Props) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const getCroppedImage = async () => {
        if (!croppedAreaPixels) return;
        const image = await fetch(imageSrc);
        const blob = await image.blob();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.src = URL.createObjectURL(blob);
        await new Promise((resolve) => (img.onload = resolve));

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;
        ctx.drawImage(
            img,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        );

        canvas.toBlob((croppedBlob) => {
            if (croppedBlob) onSave(croppedBlob);
        }, "image/jpeg");
    };

    if(!isOpen) return null;

    return (
        <div className={`modal d-block`} style={{backgroundColor: "rgba(0, 0, 0, 0.5)"}}>
            <div className={`modal-dialog`}>
                <div className={`modal-content`}>
                    <div className={`modal-header`}>
                        <h2>Podesite sliku</h2>
                        <button type="button" className={`btn-close`} onClick={onClose}></button>
                    </div>
                    <div className={`modal-body ${styles.modal_body}`}>
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                    <div className="modal-footer">
                        <button onClick={onClose}>Otkaži</button>
                        <button onClick={getCroppedImage}>Sačuvaj</button>
                    </div>
                </div>
            </div>
        </div>);
};