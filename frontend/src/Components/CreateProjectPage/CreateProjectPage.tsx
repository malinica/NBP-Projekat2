import React, {useRef, useState} from "react";
import {createProjectAPI} from "../../Services/ProjectService.tsx";
import {toast} from 'react-hot-toast'
import {TagPicker} from "../TagPicker/TagPicker.tsx";
import {Tag} from "../../Interfaces/Tag/Tag.ts";
import styles from "./CreateProjectPage.module.css";
import {useNavigate} from "react-router";

export const CreateProjectPage = () => {
    const navigate = useNavigate();
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
                navigate(`/projects/${response.data.id}`);
            }
        }
        catch(error:any) {
            console.error(error);
            toast.error("Došlo je do greške prilikom kreiranja projekta.");
        }
    };

    return (
        <div className={`container-fluid bg-lilac d-flex justify-content-center flex-grow-1`}>
            <div className={`col-xxl-6 col-xl-7 col-lg-6 col-md-10 col-sm-12 p-5 m-4 bg-light rounded d-flex flex-column`}>
                <div className={`row justify-content-center bg-light rounded`}>
                    <div className={`col-md-6 m-4`}>
                        <h2 className={`mb-4 text-center text-violet`}>Kreiraj Projekat</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={`mb-3`}>
                                <label className={`form-label text-dark-green`}>Naziv projekta:</label>
                                <input
                                    type="text"
                                    className={`form-control ${styles.fields}`}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={`mb-3`}>
                                <label className={`form-label text-dark-green`}>Opis:</label>
                                <textarea
                                    className={`form-control ${styles.fields}`}
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={`mb-3`}>
                                <label className={`form-label text-dark-green`}>Slika:</label>
                                <input
                                    type="file"
                                    className={`form-control ${styles.fields}`}
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                    ref={imageInputRef}
                                    required
                                />
                            </div>
                            <div className={`mb-3`}>
                                <TagPicker selectedTags={selectedTags} maxNumberOfTags={10} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />
                            </div>
                            <button type="submit" className={`btn-lg text-white text-center rounded py-2 px-2 ${styles.slova} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}>Sačuvaj Projekat</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};