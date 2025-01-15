import {Tag} from "../../Interfaces/Tag/Tag.ts";
import {useEffect, useState} from "react";
import {getTagsByNameAPI} from "../../Services/TagService.tsx";
import {toast} from 'react-hot-toast';
import {Autocomplete, Chip, TextField} from "@mui/material";
import styles from "./TagPicker.module.css";


type Props = {
    selectedTags: Tag[];
    maxNumberOfTags?: number;
    onAddTag: (tag: Tag) => void;
    onRemoveTag: (tagId: string) => void;
}

export const TagPicker = ({selectedTags, maxNumberOfTags, onAddTag, onRemoveTag} : Props) => {

    const [, setInputValue] = useState("");
    const [options, setOptions] = useState<Tag[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

    useEffect(() => {
        handleSearch('');
    }, []);

    const handleAddTag = () => {
        if(selectedTags && maxNumberOfTags && selectedTags.length >= maxNumberOfTags) {
            toast.error(`Nemoguće dodavanje više od ${maxNumberOfTags} tagova.`)
            return;
        }
        if (selectedTag && !selectedTags.some((tag) => tag.id === selectedTag.id)) {
            onAddTag(selectedTag);
            setSelectedTag(null);
            setInputValue("");
        }
    }

    const handleSearch = async (tagName: string) => {
        try {
            const response = await getTagsByNameAPI(tagName);
            if(response && response.status === 200) {
                setOptions(response.data);
            }
        }
        catch(error) {
            toast.error("Došlo je do greške prilikom pretrage tagova.");
            console.error(error);
        }
    };

    return (
        <div className={`mt-3`}>
            <div className={`mb-2`}>
                <Autocomplete
                    options={options}
                    getOptionLabel={(option) => option.name}
                    filterOptions={(x) => x}
                    onInputChange={async (_, newInputValue) => {
                        setInputValue(newInputValue);
                        await handleSearch(newInputValue);
                    }}
                    onChange={(_, newValue) => setSelectedTag(newValue)}
                    renderInput={(params) => <TextField {...params} label="Dodaj tag" variant="outlined" fullWidth/>}
                />
            </div>

            <div className={`d-flex align-items-center gap-3 mt-3`}>
                <button
                    className={`btn-lg text-white text-center rounded-3 border-0 py-2 px-2 flex-shrink-0 ${styles.slova} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}
                    onClick={handleAddTag}
                    disabled={!selectedTag}
                    type="button"
                >
                    Dodaj Tag
                </button>

                <div className={`d-flex align-items-center flex-wrap gap-2`}>
                {selectedTags.map((tag) => (
                    <Chip key={tag.id} label={tag.name} onDelete={() => onRemoveTag(tag.id)} color="success"/>
                ))}
                </div>
            </div>
        </div>
    );
};