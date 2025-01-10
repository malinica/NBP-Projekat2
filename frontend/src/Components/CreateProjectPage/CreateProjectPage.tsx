import React, {useRef, useState} from "react";
import {createProjectAPI} from "../../Services/ProjectService.tsx";
import {toast} from 'react-hot-toast'
import {TagPicker} from "../TagPicker/TagPicker.tsx";
import {Tag} from "../../Interfaces/Tag/Tag.ts";

export const CreateProjectPage = () => {

    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

    const imageInputRef = useRef<HTMLInputElement | null>(null);

    const handleAddTag = (tag: Tag) => {
        setSelectedTags((prev) => [...prev, tag]);
    };

    const handleRemoveTag = (tagId: string) => {
        setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !description || !image || selectedTags.length === 0) {
            toast.error("Popunite sva polja.");
            return;
        }
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("image", image);
        selectedTags.map((tag: Tag) => {
            formData.append("tagsIds", tag.id);
        });

        try {
            const response = await createProjectAPI(formData);
            if(response && response.status === 200) {
                toast.success("Projekat je uspešno kreiran.");
                setTitle('');
                setDescription('');
                setImage(null);
                if (imageInputRef.current) {
                    imageInputRef.current.value = "";
                }
                setSelectedTags([]);
            }
        }
        catch(error:any) {
            console.error(error);
            toast.error("Došlo je do greške prilikom kreiranja projekta.");
        }
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h2 className="mb-4 text-center">Kreiraj Projekat</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Naziv projekta</label>
                            <input
                                type="text"
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Opis</label>
                            <textarea
                                className="form-control"
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Izaberi sliku</label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files?.[0] || null)}
                                ref={imageInputRef}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <TagPicker selectedTags={selectedTags} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Sačuvaj Projekat</button>
                    </form>
                </div>
            </div>
        </div>
    );
};